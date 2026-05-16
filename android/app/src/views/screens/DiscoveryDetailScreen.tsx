import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_URL } from '../../config/api';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const COLORS = {
  primary: '#15803D',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  darkText: '#0F172A',
  mediumText: '#475569',
  lightText: '#94A3B8',
  white: '#FFFFFF',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  accent: '#8B5CF6',
};

const DiscoveryDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { scan } = route.params;
  const { token, user, role } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const resolveUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) {
      return Platform.OS === 'android' ? path.replace('localhost', '10.0.2.2') : path;
    }
    const baseUrl = API_URL.replace('/api', '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  const handleVerify = async (status: 'verified' | 'corrected') => {
    try {
      setLoading(true);
      const res = await axios.put(`${API_URL}/predictions/verify/${scan._id}`, {
        status,
        verifierId: user?._id || user?.uid,
        verifierRole: 'medical_officer'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        Alert.alert('Success', `Scan marked as ${status}`);
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error verifying scan:', error);
      Alert.alert('Error', 'Failed to submit verification');
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = resolveUrl(scan.imagePath);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: imageUrl || undefined }} style={styles.mainImage} />
        
        <View style={styles.contentCard}>
          <View style={styles.resultHeader}>
            <View style={styles.badgeRow}>
               <View style={[styles.statusBadge, { backgroundColor: scan.verificationStatus === 'pending' ? COLORS.warning + '20' : COLORS.success + '20' }]}>
                 <Text style={[styles.statusText, { color: scan.verificationStatus === 'pending' ? COLORS.warning : COLORS.success }]}>
                   {scan.verificationStatus.toUpperCase()}
                 </Text>
               </View>
               <View style={styles.confidenceBadge}>
                 <Text style={styles.confidenceText}>{scan.confidence}% AI Confidence</Text>
               </View>
            </View>
            <Text style={styles.speciesName}>{scan.commonName || scan.className}</Text>
            <Text style={styles.scientificName}>{scan.scientificName}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <InfoItem icon="medical" label="Venomous" value={scan.venom || 'Unknown'} color={COLORS.error} />
            <InfoItem icon="leaf" label="Family" value={scan.family || 'Unknown'} color={COLORS.primary} />
            <InfoItem icon="time" label="Captured" value={new Date(scan.createdAt).toLocaleDateString()} color={COLORS.info} />
            <InfoItem 
              icon="person" 
              label="User ID" 
              value={typeof scan.user === 'string' ? scan.user.substring(0, 8) : 'Guest'} 
              color={COLORS.mediumText} 
            />
          </View>

          <View style={styles.detailSection}>
            <View style={styles.sectionHeader}>
              <Icon name="information-circle" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Full Analysis</Text>
            </View>
            <Text style={styles.detailText}>
              This identification was performed using the Wildlife Safety AI model. 
              The AI detected {scan.className} with {scan.confidence}% certainty. 
              Field observations and medical advice provided are based on the identified species profile.
            </Text>
          </View>

          {scan.verificationStatus === 'pending' && (role === 'medical-officer' || role === 'admin') && (
            <View style={styles.actionContainer}>
              <Text style={styles.actionPrompt}>As a Medical Officer, please verify this identification:</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.btn, styles.approveBtn]} 
                  onPress={() => handleVerify('verified')}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" size="small" /> : (
                    <>
                      <Icon name="checkmark-circle" size={20} color="#fff" />
                      <Text style={styles.btnText}>APPROVE</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btn, styles.rejectBtn]} 
                  onPress={() => handleVerify('corrected')}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" size="small" /> : (
                    <>
                      <Icon name="close-circle" size={20} color="#fff" />
                      <Text style={styles.btnText}>OVERRIDE</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoItem = ({ icon, label, value, color }: any) => (
  <View style={styles.infoItem}>
    <View style={[styles.infoIcon, { backgroundColor: color + '15' }]}>
      <Icon name={icon} size={18} color={color} />
    </View>
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

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
  scrollContent: {
    paddingBottom: 40,
  },
  mainImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#F1F5F9',
  },
  contentCard: {
    marginTop: -30,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    minHeight: 500,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  confidenceBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.mediumText,
  },
  speciesName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.darkText,
    textAlign: 'center',
  },
  scientificName: {
    fontSize: 16,
    fontStyle: 'italic',
    color: COLORS.mediumText,
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.lightText,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.darkText,
    fontWeight: '700',
  },
  detailSection: {
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkText,
    marginLeft: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.mediumText,
    lineHeight: 22,
  },
  actionContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  actionPrompt: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtn: {
    backgroundColor: COLORS.success,
    marginRight: 8,
  },
  rejectBtn: {
    backgroundColor: COLORS.error,
    marginLeft: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    marginLeft: 8,
  },
});

export default DiscoveryDetailScreen;
