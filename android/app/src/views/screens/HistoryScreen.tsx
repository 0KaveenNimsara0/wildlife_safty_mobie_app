import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import AuthService from '../../services/AuthService';
import { API_URL } from '../../config/api';

const COLORS = {
  primary: '#15803D',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  darkText: '#0F172A',
  mediumText: '#475569',
  lightText: '#94A3B8',
  white: '#FFFFFF',
  border: '#E2E8F0',
  pending: '#F59E0B',
  verified: '#10B981',
  corrected: '#3B82F6',
};

const HistoryScreen = () => {
  const navigation = useNavigation<any>();
  const { token, user } = useContext(AuthContext);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    if (!token || !user?.uid) return;
    try {
      setLoading(true);
      const res = await AuthService.getUserHistory(user.uid, token);
      if (res.success) {
        setHistory(res.predictions);
      }
    } catch (error: any) {
      console.error('Error fetching history:', error);
      Alert.alert('Error', error.message || 'Failed to fetch your history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token, user?.uid]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const resolveUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) {
      return Platform.OS === 'android' ? path.replace('localhost', '10.0.2.2') : path;
    }
    const baseUrl = API_URL.replace('/api', '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  const renderItem = ({ item }: { item: any }) => {
    const imageUrl = resolveUrl(item.imagePath);
    const isCorrected = item.verificationStatus === 'corrected';
    const displayName = isCorrected ? item.expertLabel : (item.commonName || item.className);

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('DiscoveryDetail', { scan: item })}
      >
        <View style={styles.cardContent}>
          <Image source={{ uri: imageUrl || undefined }} style={styles.image} />
          <View style={styles.info}>
            <View style={styles.headerRow}>
              <Text style={styles.familyText}>{item.family?.toUpperCase()}</Text>
              <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            
            <Text style={styles.nameText} numberOfLines={1}>{displayName}</Text>
            
            {isCorrected && (
              <Text style={styles.aiResultText}>AI thought: {item.commonName}</Text>
            )}

            <View style={styles.metaRow}>
              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceValue}>{item.confidence}%</Text>
                <Text style={styles.confidenceLabel}>Confidence</Text>
              </View>
              
              <View style={[styles.statusBadge, { backgroundColor: COLORS[item.verificationStatus as keyof typeof COLORS] + '15' }]}>
                <Text style={[styles.statusText, { color: COLORS[item.verificationStatus as keyof typeof COLORS] }]}>
                  {item.verificationStatus.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My History</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Icon name="refresh" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your discoveries...</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="time-outline" size={64} color={COLORS.lightText} />
              <Text style={styles.emptyTitle}>No History Yet</Text>
              <Text style={styles.emptySubtitle}>Start identifying species to build your collection.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.darkText,
  },
  refreshButton: {
    padding: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.mediumText,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    marginBottom: 16,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardContent: {
    flexDirection: 'row',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  info: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  familyText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  dateText: {
    fontSize: 10,
    color: COLORS.lightText,
    fontWeight: '600',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkText,
    marginTop: 4,
  },
  aiResultText: {
    fontSize: 11,
    color: COLORS.mediumText,
    fontStyle: 'italic',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.darkText,
  },
  confidenceLabel: {
    fontSize: 9,
    color: COLORS.lightText,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.darkText,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.lightText,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});

export default HistoryScreen;
