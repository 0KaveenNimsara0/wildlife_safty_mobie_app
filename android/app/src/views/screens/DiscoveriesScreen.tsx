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
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
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

const DiscoveriesScreen = () => {
  const navigation = useNavigation<any>();
  const { token, role, user } = useContext(AuthContext);
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    corrected: 0
  });

  const fetchScans = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/predictions/all`, {
        params: { status: filter === 'all' ? undefined : filter },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setScans(response.data.predictions);
        
        // Also fetch all to update stats (this could be optimized if backend returned stats)
        const statsRes = await axios.get(`${API_URL}/predictions/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsRes.data.success) {
          const all = statsRes.data.predictions;
          setStats({
            total: all.length,
            pending: all.filter((s: any) => s.verificationStatus === 'pending').length,
            verified: all.filter((s: any) => s.verificationStatus === 'verified').length,
            corrected: all.filter((s: any) => s.verificationStatus === 'corrected').length,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching scans:', error);
      Alert.alert('Error', 'Failed to fetch scan history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [filter, token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchScans();
  };

  const handleVerify = async (id: string, status: 'verified' | 'corrected') => {
    try {
      const res = await axios.put(`${API_URL}/predictions/verify/${id}`, {
        status,
        verifierId: user?._id || user?.uid,
        verifierRole: 'medical_officer'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        Alert.alert('Success', `Scan marked as ${status}`);
        fetchScans();
      }
    } catch (error) {
      console.error('Error verifying scan:', error);
      Alert.alert('Error', 'Failed to submit verification');
    }
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

  const renderScan = ({ item }: { item: any }) => {
    const imageUrl = resolveUrl(item.imagePath);

    return (
      <TouchableOpacity 
        style={styles.scanCard}
        onPress={() => navigation.navigate('DiscoveryDetail', { scan: item })}
      >
        <View style={styles.scanMain}>
          <Image source={{ uri: imageUrl || undefined }} style={styles.scanImage} />
          <View style={styles.scanInfo}>
            <Text style={styles.speciesName}>{item.commonName || item.className}</Text>
            <Text style={styles.scientificName}>{item.scientificName}</Text>
            <View style={styles.confidenceRow}>
              <View style={styles.confidenceBar}>
                <View style={[styles.confidenceFill, { width: `${item.confidence}%` }]} />
              </View>
              <Text style={styles.confidenceText}>{item.confidence}% AI</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: COLORS[item.verificationStatus as keyof typeof COLORS] + '20' }]}>
              <Text style={[styles.statusText, { color: COLORS[item.verificationStatus as keyof typeof COLORS] }]}>
                {item.verificationStatus.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {item.verificationStatus === 'pending' && (
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.verifyBtn]}
              onPress={() => handleVerify(item._id, 'verified')}
            >
              <Icon name="checkmark" size={18} color={COLORS.white} />
              <Text style={styles.actionButtonText}>APPROVE</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectBtn]}
              onPress={() => handleVerify(item._id, 'corrected')}
            >
              <Icon name="close" size={18} color={COLORS.white} />
              <Text style={styles.actionButtonText}>OVERRIDE</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identification Oversight</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.statsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>
          <View style={[styles.statBox, { borderColor: COLORS.pending }]}>
            <Text style={[styles.statValue, { color: COLORS.pending }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statBox, { borderColor: COLORS.verified }]}>
            <Text style={[styles.statValue, { color: COLORS.verified }]}>{stats.verified}</Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
          <View style={[styles.statBox, { borderColor: COLORS.corrected }]}>
            <Text style={[styles.statValue, { color: COLORS.corrected }]}>{stats.corrected}</Text>
            <Text style={styles.statLabel}>Overrides</Text>
          </View>
        </ScrollView>
      </View>

      <View style={styles.filterBar}>
        {['all', 'pending', 'verified', 'corrected'].map((f) => (
          <TouchableOpacity 
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={scans}
          renderItem={renderScan}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="eye-outline" size={64} color={COLORS.lightText} />
              <Text style={styles.emptyText}>No scans found for this filter.</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  statsContainer: {
    backgroundColor: COLORS.surface,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statsScroll: {
    paddingHorizontal: 20,
  },
  statBox: {
    width: 100,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginRight: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.darkText,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.mediumText,
    marginTop: 4,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterTab: {
    marginRight: 20,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.lightText,
    letterSpacing: 0.5,
  },
  filterTabTextActive: {
    color: COLORS.primary,
  },
  listContent: {
    padding: 20,
  },
  scanCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  scanMain: {
    flexDirection: 'row',
  },
  scanImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  scanInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  speciesName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  scientificName: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.mediumText,
    marginTop: 2,
  },
  confidenceRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    marginRight: 8,
  },
  confidenceFill: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.mediumText,
  },
  statusBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtn: {
    backgroundColor: COLORS.verified,
    marginRight: 8,
  },
  rejectBtn: {
    backgroundColor: '#EF4444',
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.white,
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.lightText,
  },
});

export default DiscoveriesScreen;
