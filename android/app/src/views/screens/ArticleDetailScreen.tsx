import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
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

const ArticleDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { article } = route.params;
  const { width } = useWindowDimensions();

  const resolveUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) {
      return Platform.OS === 'android' ? path.replace('localhost', '10.0.2.2') : path;
    }
    const baseUrl = API_URL.replace('/api', '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  const imageUrl = resolveUrl(article.coverImage || article.cover);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Article</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Icon name="share-outline" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {article.images && article.images.length > 0 ? (
            article.images.map((img: any, idx: number) => (
              <Image key={idx} source={{ uri: resolveUrl(img.url) || undefined }} style={[styles.mainImage, { width }]} />
            ))
          ) : (
            imageUrl && <Image source={{ uri: imageUrl }} style={[styles.mainImage, { width }]} />
          )}
        </ScrollView>
        
        <View style={styles.contentCard}>
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {article.category ? article.category.replace('_', ' ').toUpperCase() : 'WILDLIFE'}
              </Text>
            </View>
            <Text style={styles.dateText}>{new Date(article.createdAt).toLocaleDateString()}</Text>
          </View>

          <Text style={styles.title}>{article.title}</Text>

          {article.tags && article.tags.length > 0 && (
            <View style={styles.tagContainer}>
              {article.tags.map((tag: string, idx: number) => (
                <View key={idx} style={styles.tagBadge}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
          
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>{article.authorName?.charAt(0) || 'E'}</Text>
            </View>
            <View>
              <Text style={styles.authorName}>{article.authorName || 'Expert Writer'}</Text>
              <Text style={styles.authorTitle}>Medical Officer</Text>
            </View>
          </View>

          {article.excerpt ? (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>EXECUTIVE SUMMARY</Text>
              <Text style={styles.summaryText}>{article.excerpt}</Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          <Text style={styles.articleContent}>{article.content}</Text>
          
          {/* Subtle Tip Section */}
          <View style={styles.tipSection}>
            <Icon name="bulb-outline" size={24} color={COLORS.primary} />
            <Text style={styles.tipText}>
              Always prioritize safety. If you encounter wildlife, maintain a safe distance and alert local authorities if necessary.
            </Text>
          </View>
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
  shareButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#F1F5F9',
  },
  contentCard: {
    marginTop: -20,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.lightText,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.darkText,
    lineHeight: 34,
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  tagBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryBox: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.lightText,
    letterSpacing: 1,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.darkText,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  authorAvatarText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  authorTitle: {
    fontSize: 12,
    color: COLORS.lightText,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 24,
  },
  articleContent: {
    fontSize: 17,
    color: COLORS.mediumText,
    lineHeight: 28,
  },
  tipSection: {
    marginTop: 32,
    backgroundColor: '#F0FDFA',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.mediumText,
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default ArticleDetailScreen;
