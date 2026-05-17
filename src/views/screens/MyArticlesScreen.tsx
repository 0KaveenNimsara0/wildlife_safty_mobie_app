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
  pending: '#F59E0B',
  published: '#10B981',
  draft: '#64748B',
};

const MyArticlesScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useContext(AuthContext);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyArticles = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/medical-officer/articles/my-articles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && Array.isArray(response.data.articles)) {
        setArticles(response.data.articles);
      } else if (Array.isArray(response.data)) {
        setArticles(response.data);
      }
    } catch (error) {
      console.error('Error fetching my articles:', error);
      Alert.alert('Error', 'Failed to fetch your articles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyArticles();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyArticles();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Article', 'Are you sure you want to remove this article?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await axios.delete(`${API_URL}/medical-officer/articles/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setArticles(prev => prev.filter(a => a._id !== id));
        } catch (e) {
          Alert.alert('Error', 'Failed to delete article');
        }
      }},
    ]);
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

  const renderArticle = ({ item }: { item: any }) => {
    const imageUrl = resolveUrl(item.coverImage);
    const statusColor = item.status === 'published' ? COLORS.published : (item.status === 'pending' || item.status === 'pending_review' ? COLORS.pending : COLORS.draft);
    const isPublished = item.status === 'published';

    return (
      <View style={styles.articleCard}>
        <View style={styles.cardHeader}>
          <Image source={{ uri: imageUrl || undefined }} style={styles.cardImage} />
          <View style={styles.cardMain}>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {item.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.actionBtn, isPublished && { opacity: 0.5 }]}
            onPress={() => {
              if (isPublished) {
                Alert.alert('Restricted', 'Published articles cannot be edited. Please contact an administrator to request changes.');
              } else {
                navigation.navigate('CreateArticle', { article: item });
              }
            }}
          >
            <Icon name="create-outline" size={18} color={isPublished ? COLORS.lightText : COLORS.primary} />
            <Text style={[styles.actionBtnText, { color: isPublished ? COLORS.lightText : COLORS.primary }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => navigation.navigate('ArticleDetail', { article: item })}
          >
            <Icon name="eye-outline" size={18} color={COLORS.mediumText} />
            <Text style={styles.actionBtnText}>Preview</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, isPublished && { opacity: 0.5 }]}
            onPress={() => {
              if (isPublished) {
                Alert.alert('Restricted', 'Published articles cannot be deleted.');
              } else {
                handleDelete(item._id);
              }
            }}
          >
            <Icon name="trash-outline" size={18} color={isPublished ? COLORS.lightText : '#EF4444'} />
            <Text style={[styles.actionBtnText, { color: isPublished ? COLORS.lightText : '#EF4444' }]}>Delete</Text>
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
        <Text style={styles.headerTitle}>My Articles</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={articles}
          renderItem={renderArticle}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="document-text-outline" size={64} color={COLORS.lightText} />
              <Text style={styles.emptyText}>You haven't written any articles yet.</Text>
              <TouchableOpacity 
                style={styles.createBtn}
                onPress={() => navigation.navigate('CreateArticle')}
              >
                <Text style={styles.createBtnText}>Write First Article</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('CreateArticle')}
      >
        <Icon name="add" size={30} color={COLORS.white} />
      </TouchableOpacity>
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
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  articleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 12,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  cardMain: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  dateText: {
    fontSize: 11,
    color: COLORS.lightText,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkText,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: '#F8FAFC',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.mediumText,
    marginLeft: 6,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.lightText,
    textAlign: 'center',
  },
  createBtn: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createBtnText: {
    color: COLORS.white,
    fontWeight: '700',
  },
});

export default MyArticlesScreen;
