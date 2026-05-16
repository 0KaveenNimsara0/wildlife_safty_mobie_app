import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  ScrollView,
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
};

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'grid-outline' },
  { id: 'wildlife_safety', label: 'Safety', icon: 'shield-checkmark' },
  { id: 'medical_advice', label: 'Medical', icon: 'medkit' },
  { id: 'emergency_response', label: 'Emergency', icon: 'alert-circle' },
  { id: 'prevention', label: 'Prevention', icon: 'umbrella' },
  { id: 'treatment', label: 'Treatment', icon: 'bandage' },
];

const ArticlesScreen = () => {
  const navigation = useNavigation<any>();
  const { user, token, role } = useContext(AuthContext);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);

  const fetchArticles = async (category: string) => {
    setLoading(true);
    try {
      // Use the correct public endpoint: /api/articles/category/:category
      const endpoint = `${API_URL}/articles/category/${category}`;
      const response = await axios.get(endpoint);
      if (response.data.success) {
        setArticles(response.data.articles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(selectedCategory);
  }, [selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchArticles(selectedCategory).then(() => setRefreshing(false));
  };

  const renderArticle = ({ item }: { item: any }) => {
    const imageUrl = item.coverImage ? 
      (item.coverImage.startsWith('http') ? item.coverImage : `${API_URL.replace('/api', '')}${item.coverImage.startsWith('/') ? '' : '/'}${item.coverImage}`) : null;

    return (
      <TouchableOpacity 
        style={styles.articleCard}
        onPress={() => navigation.navigate('ArticleDetail', { article: item })}
      >
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.articleImage} />
        )}
        <View style={styles.articleInfo}>
          <Text style={styles.articleCategory}>
            {item.category ? item.category.replace('_', ' ').toUpperCase() : 'GENERAL'}
          </Text>
          <Text style={styles.articleTitle}>{item.title}</Text>
          <Text style={styles.articleExcerpt} numberOfLines={2}>{item.content}</Text>
          <View style={styles.articleFooter}>
            <Text style={styles.articleAuthor}>By {item.authorName || 'Expert'}</Text>
            <Text style={styles.articleDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Knowledge Center</Text>
        {role === 'medical-officer' ? (
          <TouchableOpacity onPress={() => navigation.navigate('MyArticles')} style={styles.myArticlesPill}>
            <Icon name="document-text" size={16} color={COLORS.white} />
            <Text style={styles.myArticlesPillText}>My Articles</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Icon name={cat.icon} size={18} color={selectedCategory === cat.id ? COLORS.white : COLORS.mediumText} />
              <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
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
              <Text style={styles.emptyText}>No articles found in this category yet.</Text>
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
  myArticlesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  myArticlesPillText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  categoryContainer: {
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryScroll: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.mediumText,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: 20,
  },
  articleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  articleImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F1F5F9',
  },
  articleInfo: {
    padding: 16,
  },
  articleCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 8,
  },
  articleExcerpt: {
    fontSize: 14,
    color: COLORS.mediumText,
    lineHeight: 20,
    marginBottom: 12,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  articleAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  articleDate: {
    fontSize: 12,
    color: COLORS.lightText,
  },
  loader: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.lightText,
    textAlign: 'center',
  },
});

export default ArticlesScreen;
