import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
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
  unread: '#ECFDF5',
};

const NotificationsScreen = () => {
  const navigation = useNavigation<any>();
  const { user, token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && Array.isArray(response.data.notifications)) {
        setNotifications(response.data.notifications);
      } else if (Array.isArray(response.data)) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications().then(() => setRefreshing(false));
  };

  const markAsRead = async (id: string) => {
    try {
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const renderNotification = ({ item }: { item: any }) => {
    const isUnread = !item.read;
    
    return (
      <TouchableOpacity 
        style={[styles.notificationCard, isUnread && styles.notificationUnread]}
        onPress={() => {
          if (isUnread) markAsRead(item._id);
          // Handle navigation based on notification type if needed
          Alert.alert(item.title, item.message);
        }}
      >
        <View style={[styles.iconContainer, { backgroundColor: isUnread ? '#15803D' : '#F1F5F9' }]}>
          <Icon 
            name={item.type === 'alert' ? 'alert-circle' : 'notifications'} 
            size={24} 
            color={isUnread ? COLORS.white : COLORS.mediumText} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.notiTitle, isUnread && styles.boldText]}>{item.title}</Text>
          <Text style={styles.notiMessage} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.notiDate}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        {isUnread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={COLORS.darkText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="lock-closed-outline" size={64} color={COLORS.lightText} />
          <Text style={styles.emptyText}>Please login to view your notifications.</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity 
          onPress={() => {
            Alert.alert('Clear All', 'Are you sure you want to mark all as read?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Yes', onPress: async () => {
                try {
                  await axios.patch(`${API_URL}/notifications/read-all`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  fetchNotifications();
                } catch (e) {}
              }}
            ]);
          }}
          style={styles.clearButton}
        >
          <Icon name="checkmark-done" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="notifications-off-outline" size={64} color={COLORS.lightText} />
              <Text style={styles.emptyText}>All caught up! No new notifications.</Text>
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
  clearButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingVertical: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  notificationUnread: {
    backgroundColor: COLORS.unread,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  notiTitle: {
    fontSize: 16,
    color: COLORS.darkText,
    marginBottom: 4,
  },
  notiMessage: {
    fontSize: 14,
    color: COLORS.mediumText,
    marginBottom: 6,
  },
  notiDate: {
    fontSize: 12,
    color: COLORS.lightText,
  },
  boldText: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  loader: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.lightText,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  loginButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
});

export default NotificationsScreen;
