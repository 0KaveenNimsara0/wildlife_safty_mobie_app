// services/OfflineSyncService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'react-native-image-picker';
import { IdentificationController } from '../controllers/IdentificationController';
import { AnimalDetails } from '../models/AnimalDetails';

export interface PendingSighting {
  id: string;
  imageAsset: {
    uri: string;
    fileName: string;
    type: string;
  };
  details: Partial<AnimalDetails>;
  userId: string;
  createdAt: string;
}

const PENDING_QUEUE_KEY = '@pending_sync_sightings';
const HISTORY_CACHE_KEY_PREFIX = '@cached_history_';

export class OfflineSyncService {
  /**
   * Save a sighting prediction temporarily on the phone's AsyncStorage.
   */
  static async savePendingSighting(
    imageAsset: Asset,
    details: Partial<AnimalDetails>,
    userId: string
  ): Promise<PendingSighting> {
    try {
      const pendingItem: PendingSighting = {
        id: `pending_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        imageAsset: {
          uri: imageAsset.uri || '',
          fileName: imageAsset.fileName || `animal_${Date.now()}.jpg`,
          type: imageAsset.type || 'image/jpeg',
        },
        details,
        userId: userId || '',
        createdAt: new Date().toISOString(),
      };

      const existingQueueJson = await AsyncStorage.getItem(PENDING_QUEUE_KEY);
      const queue: PendingSighting[] = existingQueueJson ? JSON.parse(existingQueueJson) : [];
      
      queue.push(pendingItem);
      await AsyncStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
      
      console.log('📦 Sighting saved temporarily to phone:', pendingItem.id);
      return pendingItem;
    } catch (error) {
      console.error('Failed to save pending sighting locally:', error);
      throw error;
    }
  }

  /**
   * Get all pending unsynced sightings from local storage.
   */
  static async getPendingSightings(): Promise<PendingSighting[]> {
    try {
      const queueJson = await AsyncStorage.getItem(PENDING_QUEUE_KEY);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      console.error('Failed to get pending sightings:', error);
      return [];
    }
  }

  /**
   * Remove a single pending sighting from local storage queue by its ID.
   */
  static async removePendingSighting(id: string): Promise<void> {
    try {
      const queueJson = await AsyncStorage.getItem(PENDING_QUEUE_KEY);
      if (!queueJson) return;

      const queue: PendingSighting[] = JSON.parse(queueJson);
      const filteredQueue = queue.filter((item) => item.id !== id);
      
      await AsyncStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(filteredQueue));
      console.log('🗑️ Sighting removed from pending queue:', id);
    } catch (error) {
      console.error('Failed to remove pending sighting:', error);
    }
  }

  /**
   * Synchronize pending sightings with the backend server.
   * If they were saved as anonymous, we can optionally associate them with currentUserId if logged in.
   */
  static async syncPendingSightings(
    token: string | null,
    currentUserId: string | null
  ): Promise<{ successCount: number; failCount: number; stillOffline: boolean }> {
    let successCount = 0;
    let failCount = 0;
    let stillOffline = false;

    try {
      const queue = await this.getPendingSightings();
      if (queue.length === 0) {
        return { successCount: 0, failCount: 0, stillOffline: false };
      }

      console.log(`🔄 Attempting to sync ${queue.length} pending sightings...`);

      for (const sighting of queue) {
        // Enforce user ID binding if the user logged in after taking the offline sighting
        const targetUserId = sighting.userId || currentUserId || '';
        
        // If we still don't have a token but have a user, we can't authorized-sync, but we can try
        const res = await IdentificationController.savePrediction(
          sighting.imageAsset as Asset,
          sighting.details,
          targetUserId,
          token || ''
        );

        if (res && !res.error && (res.success || res._id)) {
          console.log(`✅ Synced sighting ${sighting.id} successfully to database.`);
          await this.removePendingSighting(sighting.id);
          successCount++;
        } else {
          const errorMsg = res?.error || 'Unknown upload failure';
          console.warn(`❌ Sync failed for sighting ${sighting.id}:`, errorMsg);
          
          // Check if this error is due to a network connection issue
          const isNetworkError = 
            errorMsg.toLowerCase().includes('network') || 
            errorMsg.toLowerCase().includes('fetch') || 
            errorMsg.toLowerCase().includes('address') || 
            errorMsg.toLowerCase().includes('connect');

          if (isNetworkError) {
            console.log('🔌 Network connection still unavailable. Aborting sync loop.');
            stillOffline = true;
            break; // Stop trying to sync other items as we are clearly still offline
          } else {
            // It's a validation error (e.g. invalid file, schema error, etc.)
            // We remove/skip it to prevent the sync queue from getting permanently stuck
            console.log(`⚠️ Removing corrupt or invalid sighting ${sighting.id} from queue.`);
            await this.removePendingSighting(sighting.id);
            failCount++;
          }
        }
      }
    } catch (error) {
      console.error('Error during pending sightings synchronization:', error);
    }

    return { successCount, failCount, stillOffline };
  }

  /**
   * Fetch cached history list from local storage for offline reading.
   */
  static async getCachedHistory(userId: string): Promise<any[]> {
    if (!userId) return [];
    try {
      const cacheJson = await AsyncStorage.getItem(`${HISTORY_CACHE_KEY_PREFIX}${userId}`);
      return cacheJson ? JSON.parse(cacheJson) : [];
    } catch (error) {
      console.error('Failed to get cached history:', error);
      return [];
    }
  }

  /**
   * Save a copy of the user's successfully fetched history to AsyncStorage.
   */
  static async saveCachedHistory(userId: string, historyData: any[]): Promise<void> {
    if (!userId) return;
    try {
      await AsyncStorage.setItem(
        `${HISTORY_CACHE_KEY_PREFIX}${userId}`,
        JSON.stringify(historyData)
      );
      console.log(`💾 History cached locally for user ${userId}. Count:`, historyData.length);
    } catch (error) {
      console.error('Failed to cache history locally:', error);
    }
  }
}
