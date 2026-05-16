import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
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
};

const PostDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { post } = route.params;
  const { user, token } = useContext(AuthContext);
  
  const [comments, setComments] = useState<any[]>(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

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

  const imageUrl = resolveUrl(post.photoUrl);
  const authorAvatarUrl = resolveUrl(post.authorAvatar);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    if (!token || !user) {
      Alert.alert('Login Required', 'Please log in to add comments.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/posts/${post._id}/comments`, {
        authorId: user.uid,
        authorName: user.displayName || user.name || 'Anonymous',
        authorAvatar: user.photoURL || '',
        text: commentText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComments([...comments, response.data]);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discussion</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Post Section */}
          <View style={styles.postSection}>
            <View style={styles.authorRow}>
              <View style={styles.avatar}>
                {authorAvatarUrl ? (
                  <Image source={{ uri: authorAvatarUrl }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{post.authorName?.charAt(0)}</Text>
                )}
              </View>
              <View>
                <Text style={styles.authorName}>{post.authorName}</Text>
                <Text style={styles.postDate}>{new Date(post.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>

            <Text style={styles.animalTitle}>{post.animalName}</Text>
            <Text style={styles.experience}>{post.experience}</Text>

            {imageUrl && (
              <Image source={{ uri: imageUrl }} style={styles.postImage} resizeMode="cover" />
            )}
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
            {comments.map((comment, index) => {
              const commentAvatar = resolveUrl(comment.authorAvatar);
              return (
                <View key={comment._id || index} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentAvatar}>
                      {commentAvatar ? (
                        <Image source={{ uri: commentAvatar }} style={styles.commentAvatarImage} />
                      ) : (
                        <Text style={styles.commentAvatarText}>{comment.authorName?.charAt(0)}</Text>
                      )}
                    </View>
                    <View style={styles.commentInfo}>
                      <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                      <Text style={styles.commentDate}>{new Date(comment.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              );
            })}
            {comments.length === 0 && (
              <View style={styles.emptyComments}>
                <Icon name="chatbubble-outline" size={48} color={COLORS.lightText} />
                <Text style={styles.emptyText}>No comments yet. Be the first to start the conversation!</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Add Comment Input */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor={COLORS.lightText}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={handleAddComment}
              disabled={loading || !commentText.trim()}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Icon 
                  name="send" 
                  size={20} 
                  color={commentText.trim() ? COLORS.primary : COLORS.lightText} 
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  postSection: {
    backgroundColor: COLORS.surface,
    padding: 20,
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  postDate: {
    fontSize: 12,
    color: COLORS.lightText,
  },
  animalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 10,
  },
  experience: {
    fontSize: 16,
    color: COLORS.mediumText,
    lineHeight: 24,
    marginBottom: 20,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  commentsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 20,
  },
  commentCard: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  commentAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.mediumText,
  },
  commentInfo: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  commentDate: {
    fontSize: 10,
    color: COLORS.lightText,
  },
  commentText: {
    fontSize: 14,
    color: COLORS.mediumText,
    lineHeight: 20,
    paddingLeft: 42,
  },
  emptyComments: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.lightText,
    textAlign: 'center',
    marginTop: 15,
    paddingHorizontal: 40,
  },
  inputWrapper: {
    padding: 15,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 15,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.darkText,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PostDetailScreen;
