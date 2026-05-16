import React, { useState, useEffect, useContext, useCallback } from 'react';
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
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
};

const ChatListScreen = () => {
  const navigation = useNavigation<any>();
  const { user, token } = useContext(AuthContext);
  const [conversations, setConversations] = useState<any[]>([]);
  const [medicalOfficers, setMedicalOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (silent = false) => {
    if (!token) return;
    try {
      if (!silent) setLoading(true);
      
      const [convRes, moRes] = await Promise.all([
        AuthService.getConversations(token),
        AuthService.getMedicalOfficers(token)
      ]);

      if (convRes.success) setConversations(convRes.conversations);
      if (moRes.success) setMedicalOfficers(moRes.medicalOfficers);
    } catch (error) {
      console.error('Error fetching chat data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const renderConversation = ({ item }: { item: any }) => {
    const mo = item.medicalOfficer;
    const moAvatarUrl = mo?.photoURL ? 
      (mo.photoURL.startsWith('http') ? mo.photoURL : `${API_URL.replace('/api', '')}/${mo.photoURL}`) : null;

    return (
      <TouchableOpacity 
        style={styles.chatCard}
        onPress={() => navigation.navigate('ChatDetail', { conversation: item, medicalOfficer: mo })}
      >
        <View style={styles.avatarContainer}>
          {moAvatarUrl ? (
            <Image source={{ uri: moAvatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{mo?.name?.charAt(0) || 'M'}</Text>
          )}
          {item.unreadCount > 0 && <View style={styles.unreadBadge} />}
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.moName}>{mo?.name || 'Medical Officer'}</Text>
            <Text style={styles.chatTime}>
              {item.lastMessage ? new Date(item.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage?.message || 'Start a conversation...'}
          </Text>
        </View>
        <Icon name="chevron-forward" size={18} color={COLORS.lightText} />
      </TouchableOpacity>
    );
  };

  const renderMedicalOfficer = (mo: any) => {
    const moAvatarUrl = mo.photoURL ? 
      (mo.photoURL.startsWith('http') ? mo.photoURL : `${API_URL.replace('/api', '')}/${mo.photoURL}`) : null;

    return (
      <TouchableOpacity 
        key={mo._id}
        style={styles.moCard}
        onPress={() => navigation.navigate('ChatDetail', { medicalOfficer: mo })}
      >
        <View style={styles.moAvatarSmall}>
          {moAvatarUrl ? (
            <Image source={{ uri: moAvatarUrl }} style={styles.moAvatarSmallImage} />
          ) : (
            <Text style={styles.moAvatarSmallText}>{mo.name.charAt(0)}</Text>
          )}
        </View>
        <Text style={styles.moNameSmall} numberOfLines={1}>{mo.name.split(' ')[0]}</Text>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Icon name="lock-closed-outline" size={64} color={COLORS.lightText} />
        <Text style={styles.centeredText}>Please log in to chat with medical officers.</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Auth')}>
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical Support</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Available Officers Horizontal List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Specialists</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moList}>
            {medicalOfficers.map(renderMedicalOfficer)}
          </ScrollView>
        </View>

        {/* Conversations List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Channels</Text>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : conversations.length > 0 ? (
            conversations.map((item) => (
              <React.Fragment key={item._id}>
                {renderConversation({ item })}
              </React.Fragment>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="chatbubbles-outline" size={48} color={COLORS.lightText} />
              <Text style={styles.emptyText}>No active conversations yet.</Text>
            </View>
          )}
        </View>
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  section: {
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.lightText,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  moList: {
    paddingHorizontal: 15,
  },
  moCard: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 70,
  },
  moAvatarSmall: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  moAvatarSmallImage: {
    width: 60,
    height: 60,
    borderRadius: 20,
  },
  moAvatarSmallText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  moNameSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 18,
  },
  avatarText: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    textAlign: 'center',
    lineHeight: 50,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.mediumText,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 15,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  moName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  chatTime: {
    fontSize: 12,
    color: COLORS.lightText,
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.mediumText,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.lightText,
    marginTop: 10,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: COLORS.background,
  },
  centeredText: {
    fontSize: 16,
    color: COLORS.mediumText,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
});

export default ChatListScreen;
