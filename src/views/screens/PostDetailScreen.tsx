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
  
  const [currentPost, setCurrentPost] = useState(post);
  const [comments, setComments] = useState<any[]>(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [editingComment, setEditingComment] = useState<any>(null);
  const [reactionMenuVisible, setReactionMenuVisible] = useState<string | null>(null);

  const EMOJI_MAP: { [key: string]: string } = {
    '👍': 'like',
    '❤️': 'love',
    '😂': 'laugh',
    '😮': 'wow',
    '😢': 'sad',
    '😡': 'angry'
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

  const imageUrl = resolveUrl(currentPost.photoUrl);
  const authorAvatarUrl = resolveUrl(currentPost.authorAvatar);

  const handleLikePost = async () => {
    if (!token || !user) {
      Alert.alert('Login Required', 'Please log in to like posts.');
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/posts/${currentPost._id}/like`, { 
        userId: user.uid || user._id 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentPost(response.data);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleReaction = async (commentId: string, emoji: string) => {
    if (!token || !user) return;
    const reactionType = EMOJI_MAP[emoji] || 'like';
    
    try {
      // Using the generic reactions endpoint for multi-type support
      const response = await axios.post(`${API_URL}/posts/${currentPost._id}/comments/${commentId}/react`, {
        userId: user.uid || user._id,
        userName: user.displayName || user.name || 'Anonymous',
        type: reactionType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setComments(comments.map(c => c._id === commentId ? { ...c, ...response.data } : c));
      }
    } catch (error) {
      console.error('Error reacting to comment:', error);
    }
    setReactionMenuVisible(null);
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to remove this comment?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/posts/${currentPost._id}/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              setComments(comments.filter(c => c._id !== commentId));
            } catch (err) {
              Alert.alert("Error", "Failed to delete comment");
            }
          }
        }
      ]
    );
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    if (!token || !user) {
      Alert.alert('Login Required', 'Please log in to add comments.');
      return;
    }

    setLoading(true);
    try {
      if (editingComment) {
        const res = await axios.put(`${API_URL}/posts/${currentPost._id}/comments/${editingComment._id}`, {
          text: commentText
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Use the full updated comment from the server response to catch isEdited: true
        setComments(comments.map(c => c._id === editingComment._id ? { ...c, ...res.data } : c));
        setEditingComment(null);
      } else {
        const payload = {
          authorId: user.uid,
          authorName: user.displayName || user.name || 'Anonymous',
          authorAvatar: user.photoURL || '',
          text: commentText,
          parentId: replyingTo?._id || null
        };

        const response = await axios.post(`${API_URL}/posts/${currentPost._id}/comments`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setComments([...comments, response.data]);
        setReplyingTo(null);
      }
      setCommentText('');
    } catch (error) {
      console.error('Error processing comment:', error);
      Alert.alert('Error', 'Failed to submit comment.');
    } finally {
      setLoading(false);
    }
  };

  const renderComment = (comment: any, isReply = false) => {
    const commentAvatar = resolveUrl(comment.authorAvatar);
    const isLiked = comment.likedBy?.includes(user?.uid || user?._id);
    const childReplies = comments.filter(c => c.parentId === comment._id);
    const isAuthor = user && (comment.authorId === user.uid || comment.authorId === user._id);
    const isOP = comment.authorId === currentPost.authorId;
    const isMedical = comment.authorRole === 'medical_officer' || comment.authorRole === 'medical-officer';

    const renderReactionSummary = (comment: any) => {
      if (!comment.reactionCounts) return null;
      const TYPE_TO_EMOJI: { [key: string]: string } = {
        'like': '👍', 'love': '❤️', 'laugh': '😂', 'wow': '😮', 'sad': '😢', 'angry': '😡'
      };
      
      const emojisToShow = Object.entries(comment.reactionCounts)
        .filter(([_, count]) => (count as number) > 0)
        .map(([type]) => TYPE_TO_EMOJI[type])
        .slice(0, 3);

      if (emojisToShow.length === 0) return null;

      return (
        <View style={styles.reactionSummary}>
          <View style={styles.emojiStack}>
            {emojisToShow.map((emoji, i) => (
              <Text key={emoji} style={[styles.summaryEmoji, { zIndex: 10 - i, marginLeft: i === 0 ? 0 : -5 }]}>{emoji}</Text>
            ))}
          </View>
          <Text style={styles.totalReactionsText}>{comment.totalReactions || 0}</Text>
        </View>
      );
    };

    return (
      <View key={comment._id} style={[styles.commentCard, isReply && styles.replyCard]}>
        {reactionMenuVisible === comment._id && (
          <View style={styles.reactionMenu}>
            {Object.keys(EMOJI_MAP).map(emoji => (
              <TouchableOpacity key={emoji} onPress={() => handleReaction(comment._id, emoji)} style={styles.emojiBtn}>
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={styles.commentHeader}>
          <View style={styles.commentAvatar}>
            {commentAvatar ? (
              <Image source={{ uri: commentAvatar }} style={styles.commentAvatarImage} />
            ) : (
              <Text style={styles.commentAvatarText}>{comment.authorName?.charAt(0)}</Text>
            )}
          </View>
          <View style={styles.commentInfo}>
            <View style={styles.commentNameRow}>
              <View style={styles.authorBadgeRow}>
                <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                {isOP && <View style={styles.opBadge}><Text style={styles.opBadgeText}>OP</Text></View>}
                {isMedical && (
                  <View style={styles.medicalBadge}>
                    <Icon name="medkit" size={8} color="#15803D" />
                    <Text style={styles.medicalBadgeText}>MEDICAL EXPERT</Text>
                  </View>
                )}
              </View>
              <View style={styles.commentHeaderRight}>
                <View style={styles.dateRow}>
                  <Text style={styles.commentDate}>{new Date(comment.createdAt).toLocaleDateString()}</Text>
                  {comment.isEdited && <Text style={styles.editedLabel}> (Edited)</Text>}
                </View>
                {isAuthor && (
                  <View style={styles.authorActions}>
                    <TouchableOpacity onPress={() => {
                      setEditingComment(comment);
                      setCommentText(comment.text);
                    }}>
                      <Icon name="create-outline" size={16} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteComment(comment._id)} style={{marginLeft: 10}}>
                      <Icon name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.commentText}>{comment.text}</Text>
            
            <View style={styles.commentActions}>
              <TouchableOpacity 
                style={styles.commentActionBtn} 
                onPress={() => handleReaction(comment._id, '👍')}
                onLongPress={() => setReactionMenuVisible(comment._id)}
              >
                <Icon name={isLiked ? "heart" : "heart-outline"} size={16} color={isLiked ? "#EF4444" : COLORS.mediumText} />
                {renderReactionSummary(comment)}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.commentActionBtn}
                onPress={() => setReplyingTo(comment)}
              >
                <Icon name="arrow-undo-outline" size={16} color={COLORS.mediumText} />
                <Text style={styles.commentActionText}>Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {childReplies.length > 0 && (
          <View style={styles.nestedReplies}>
            {childReplies.map(reply => renderComment(reply, true))}
          </View>
        )}
      </View>
    );
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
                  <Text style={styles.avatarText}>{currentPost.authorName?.charAt(0)}</Text>
                )}
              </View>
              <View>
                <Text style={styles.authorName}>{currentPost.authorName}</Text>
                <Text style={styles.postDate}>{new Date(currentPost.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>

            <Text style={styles.animalTitle}>{currentPost.animalName}</Text>
            <Text style={styles.experience}>{currentPost.experience}</Text>

            {imageUrl && (
              <Image source={{ uri: imageUrl }} style={styles.postImage} resizeMode="cover" />
            )}

            <View style={styles.postActionBar}>
              <TouchableOpacity style={styles.postActionButton} onPress={handleLikePost}>
                <Icon 
                  name={currentPost.likedBy?.includes(user?.uid || user?._id) ? "heart" : "heart-outline"} 
                  size={22} 
                  color={currentPost.likedBy?.includes(user?.uid || user?._id) ? "#EF4444" : COLORS.mediumText} 
                />
                <Text style={[styles.postActionText, currentPost.likedBy?.includes(user?.uid || user?._id) && { color: "#EF4444" }]}>
                  {currentPost.likes || 0}
                </Text>
              </TouchableOpacity>
              <View style={styles.postActionButton}>
                <Icon name="chatbubble-outline" size={20} color={COLORS.mediumText} />
                <Text style={styles.postActionText}>{comments.length}</Text>
              </View>
              <TouchableOpacity style={styles.postActionButton}>
                <Icon name="share-social-outline" size={20} color={COLORS.mediumText} />
                <Text style={styles.postActionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
            {comments.filter(c => !c.parentId).map(comment => renderComment(comment))}
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
          {(replyingTo || editingComment) && (
            <View style={styles.replyingBar}>
              <Text style={styles.replyingText}>
                {editingComment ? 'Editing comment...' : `Replying to `}
                <Text style={{fontWeight: '700'}}>{editingComment ? '' : replyingTo.authorName}</Text>
              </Text>
              <TouchableOpacity onPress={() => { setReplyingTo(null); setEditingComment(null); if(editingComment) setCommentText(''); }}>
                <Icon name="close-circle" size={20} color={COLORS.lightText} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={editingComment ? "Update your comment..." : (replyingTo ? "Add a reply..." : "Add a comment...")}
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
  replyCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    marginTop: 8,
    marginBottom: 0,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary + '40',
  },
  nestedReplies: {
    marginTop: 10,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  authorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  opBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  opBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#15803D',
  },
  medicalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  medicalBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#15803D',
    marginLeft: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editedLabel: {
    fontSize: 10,
    color: COLORS.lightText,
    fontStyle: 'italic',
  },
  commentHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  reactionMenu: {
    position: 'absolute',
    top: -50,
    left: 20,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    padding: 8,
    borderRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1000,
  },
  emojiBtn: {
    paddingHorizontal: 8,
  },
  emojiText: {
    fontSize: 24,
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
    marginBottom: 2,
  },
  commentDate: {
    fontSize: 10,
    color: COLORS.lightText,
  },
  commentNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: COLORS.mediumText,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  commentActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 4,
  },
  commentActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.mediumText,
    marginLeft: 4,
  },
  postActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 15,
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  postActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.mediumText,
    marginLeft: 8,
  },
  reactionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  emojiStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryEmoji: {
    fontSize: 12,
  },
  totalReactionsText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.mediumText,
    marginLeft: 4,
  },
  inputWrapper: {
    padding: 15,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  replyingBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 10,
  },
  replyingText: {
    fontSize: 12,
    color: COLORS.mediumText,
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
