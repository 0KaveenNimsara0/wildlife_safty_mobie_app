import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
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
  error: '#EF4444',
  border: '#E2E8F0',
};

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, role, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    navigation.goBack();
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {user.photoURL ? (
              <Image 
                source={{ uri: user.photoURL.startsWith('http') ? user.photoURL : `${API_URL.replace('/api', '')}${user.photoURL.startsWith('/') ? '' : '/'}${user.photoURL}` }} 
                style={styles.avatarImage} 
              />
            ) : (
              <Text style={styles.avatarText}>
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </Text>
            )}
          </View>
          
          <Text style={styles.name}>{user.displayName || 'Unknown User'}</Text>
          <Text style={styles.email}>{user.email}</Text>
          
          <View style={styles.badgeContainer}>
            <Icon name={role === 'medical-officer' ? 'medkit' : 'person'} size={14} color={COLORS.primary} />
            <Text style={styles.badgeText}>
              {role === 'medical-officer' ? 'Medical Officer' : 'Standard User'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoRow}>
            <Icon name="mail-outline" size={20} color={COLORS.mediumText} style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="person-outline" size={20} color={COLORS.mediumText} style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>User ID</Text>
              <Text style={styles.infoValue}>{user.uid}</Text>
            </View>
          </View>

          {role === 'medical-officer' && (
            <>
              <View style={styles.infoRow}>
                <Icon name="school-outline" size={20} color={COLORS.mediumText} style={styles.infoIcon} />
                <View>
                  <Text style={styles.infoLabel}>Specialization</Text>
                  <Text style={styles.infoValue}>{user.specialization || 'Not set'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Icon name="card-outline" size={20} color={COLORS.mediumText} style={styles.infoIcon} />
                <View>
                  <Text style={styles.infoLabel}>License Number</Text>
                  <Text style={styles.infoValue}>{user.licenseNumber || 'Not set'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Icon name="call-outline" size={20} color={COLORS.mediumText} style={styles.infoIcon} />
                <View>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  <Text style={styles.infoValue}>{user.phoneNumber || 'Not set'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Icon name="business-outline" size={20} color={COLORS.mediumText} style={styles.infoIcon} />
                <View>
                  <Text style={styles.infoLabel}>Hospital</Text>
                  <Text style={styles.infoValue}>{user.hospital || 'Not set'}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  content: {
    padding: 24,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7', // Light green
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: COLORS.mediumText,
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 6,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 16,
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.lightText,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.darkText,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 16,
    borderRadius: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.error,
    marginLeft: 8,
  },
});

export default ProfileScreen;
