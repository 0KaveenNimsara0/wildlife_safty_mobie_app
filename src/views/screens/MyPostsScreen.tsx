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
  danger: '#EF4444',
};

const MyPostsScreen = () => {
  const navigation = useNavigation<any>();
  const { user, token } = useContext(AuthContext);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyPosts = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API_URL}/posts`);
      const allPosts = response.data.posts || response.data;
      // Filter posts by authorId
      const myPosts = allPosts.filter((p: any) => p.authorId === user.uid || p.authorId === user._id);
      setPosts(myPosts);
    } catch (error) {
      console.error('Error fetching my posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyPosts();
  };

  const handleDeletePost = async (postId: string) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to remove this sighting permanently?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/posts/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              setPosts(posts.filter(p => p._id !== postId));
              Alert.alert("Success", "Post deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete post");
            }
          }
        }
      ]
    );
  };

  const resolveUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) {
      if (Platform.OS === 'android' && path.includes('localhost')) {
        return path.replace('localhost', '10.0.2.2');
      }
      return path;
    }
    const baseUrl = API_URL.replace('/api', '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  const renderPost = ({ item }: { item: any }) => {
    const imageUrl = resolveUrl(item.photoUrl);
    
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View>
            <Text style={styles.animalTitle}>{item.animalName}</Text>
            <Text style={styles.postTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={[styles.statusText, { color: item.status === 'verified' ? COLORS.primary : COLORS.mediumText }]}>
              {item.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.postDescription} numberOfLines={3}>{item.experience}</Text>
        
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.postImage} resizeMode="cover" />
        )}

        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('PostDetail', { post: item })}
          >
            <Icon name="eye-outline" size={20} color={COLORS.mediumText} />
            <Text style={styles.actionText}>View</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { marginLeft: 'auto' }]}
            onPress={() => navigation.navigate('CreatePost', { editPost: item })}
          >
            <Icon name="create-outline" size={20} color="#3B82F6" />
            <Text style={[styles.actionText, { color: "#3B82F6" }]}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { marginLeft: 16 }]}
            onPress={() => handleDeletePost(item._id)}
          >
            <Icon name="trash-outline" size={20} color={COLORS.danger} />
            <Text style={[styles.actionText, { color: COLORS.danger }]}>Delete</Text>
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
        <Text style={styles.headerTitle}>My Sightings</Text>
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
              <Text style={styles.emptyText}>You haven't shared any sightings yet.</Text>
              <TouchableOpacity 
                style={styles.createBtn}
                onPress={() => navigation.navigate('CreatePost')}
              >
                <Text style={styles.createBtnText}>Share Your First Sighting</Text>
              </TouchableOpacity>
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
    borderRadius: 22,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  listContent: {
    padding: 16,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  animalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  postTime: {
    fontSize: 12,
    color: COLORS.lightText,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  postDescription: {
    fontSize: 14,
    color: COLORS.mediumText,
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
  createBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
});

export default MyPostsScreen;
