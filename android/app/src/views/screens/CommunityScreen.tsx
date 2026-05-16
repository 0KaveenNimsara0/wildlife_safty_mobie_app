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
};

const CommunityScreen = () => {
  const navigation = useNavigation<any>();
  const { user, token } = useContext(AuthContext);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const renderPost = ({ item }: { item: any }) => {
    // Backend uses photoUrl field for post images
    const imageUrl = item.photoUrl ? (item.photoUrl.startsWith('http') ? item.photoUrl : `${API_URL.replace('/api', '')}${item.photoUrl.startsWith('/') ? '' : '/'}${item.photoUrl}`) : null;
    
    // Backend uses authorAvatar and authorName directly on the post
    const authorName = item.authorName || 'Anonymous';
    const authorAvatarUrl = item.authorAvatar ? 
      (item.authorAvatar.startsWith('http') ? item.authorAvatar : `${API_URL.replace('/api', '')}${item.authorAvatar.startsWith('/') ? '' : '/'}${item.authorAvatar}`) : null;

    return (
      <View style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarMini}>
              {authorAvatarUrl ? (
                <Image source={{ uri: authorAvatarUrl }} style={styles.avatarMiniImage} />
              ) : (
                <Text style={styles.avatarMiniText}>{authorName.charAt(0)}</Text>
              )}
            </View>
            <View>
              <Text style={styles.userName}>{authorName}</Text>
              <Text style={styles.postTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
          {item.status === 'verified' && (
            <View style={styles.verifiedBadge}>
              <Icon name="checkmark-circle" size={14} color={COLORS.primary} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {/* Post Content */}
        <Text style={styles.animalTitle}>{item.animalName}</Text>
        <Text style={styles.postDescription}>{item.experience}</Text>
        
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.postImage} resizeMode="cover" />
        )}

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="heart-outline" size={20} color={COLORS.mediumText} />
            <Text style={styles.actionText}>{item.likes?.length || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="chatbubble-outline" size={20} color={COLORS.mediumText} />
            <Text style={styles.actionText}>{item.comments?.length || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Feed</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="images-outline" size={64} color={COLORS.lightText} />
              <Text style={styles.emptyText}>No posts yet. Be the first to share!</Text>
            </View>
          }
        />
      )}

      {user && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Icon name="add" size={30} color={COLORS.white} />
        </TouchableOpacity>
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  postCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarMini: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarMiniImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarMiniText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  postTime: {
    fontSize: 12,
    color: COLORS.lightText,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
  },
  animalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  postDescription: {
    fontSize: 15,
    color: COLORS.mediumText,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.mediumText,
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.lightText,
    marginTop: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
});

export default CommunityScreen;
