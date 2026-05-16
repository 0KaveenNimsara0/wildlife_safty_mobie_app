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
  const { user, token, role } = useContext(AuthContext);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/posts`);
      if (response.data && response.data.posts) {
        setPosts(response.data.posts);
      } else {
        setPosts(response.data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!token || !user) {
      Alert.alert('Login Required', 'Please log in to like posts.');
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/like`, { userId: user.uid || user._id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: response.data.likes, likedBy: response.data.likedBy } : p));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleVerifyPost = async (postId: string, status: 'verified' | 'rejected') => {
    if (!token) return;
    try {
      const res = await axios.post(`${API_URL}/medical-officer/posts/${postId}/verify`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        Alert.alert('Success', `Post marked as ${status}`);
        fetchPosts();
      }
    } catch (error) {
      console.error('Error verifying post:', error);
      Alert.alert('Error', 'Failed to submit verification');
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
    // Helper to resolve URLs
    const resolveUrl = (path: string) => {
      if (!path) return null;
      if (path.startsWith('http')) {
        // Fix localhost issue for Android emulator
        if (Platform.OS === 'android' && path.includes('localhost')) {
          return path.replace('localhost', '10.0.2.2');
        }
        return path;
      }
      const baseUrl = API_URL.replace('/api', '');
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return `${baseUrl}${cleanPath}`;
    };

    const imageUrl = resolveUrl(item.photoUrl);
    const authorName = item.authorName || 'Anonymous';
    const authorAvatarUrl = resolveUrl(item.authorAvatar);

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
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLike(item._id)}
          >
            <Icon 
              name={item.likedBy?.includes(user?.uid) ? "heart" : "heart-outline"} 
              size={20} 
              color={item.likedBy?.includes(user?.uid) ? "#EF4444" : COLORS.mediumText} 
            />
            <Text style={[styles.actionText, item.likedBy?.includes(user?.uid) && { color: "#EF4444" }]}>
              {item.likes || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('PostDetail', { post: item })}
          >
            <Icon name="chatbubble-outline" size={20} color={COLORS.mediumText} />
            <Text style={styles.actionText}>{item.comments?.length || 0}</Text>
          </TouchableOpacity>
          
          {/* Expert Controls */}
          {role === 'medical-officer' && item.status !== 'verified' && (
            <View style={styles.expertActions}>
              <TouchableOpacity 
                style={[styles.expertBtn, styles.verifyBtn]}
                onPress={() => handleVerifyPost(item._id, 'verified')}
              >
                <Text style={styles.expertBtnText}>VERIFY</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.expertBtn, styles.rejectBtn]}
                onPress={() => handleVerifyPost(item._id, 'rejected')}
              >
                <Text style={styles.expertBtnText}>REJECT</Text>
              </TouchableOpacity>
            </View>
          )}
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
  expertActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  expertBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  verifyBtn: {
    backgroundColor: '#10B981',
  },
  rejectBtn: {
    backgroundColor: '#94A3B8',
  },
  expertBtnText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
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
