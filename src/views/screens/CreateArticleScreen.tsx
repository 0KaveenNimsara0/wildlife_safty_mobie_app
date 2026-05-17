import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
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

const CATEGORIES = [
  { id: 'wildlife_safety', label: 'Safety' },
  { id: 'medical_advice', label: 'Medical' },
  { id: 'emergency_response', label: 'Emergency' },
  { id: 'prevention', label: 'Prevention' },
  { id: 'treatment', label: 'Treatment' },
];

const CreateArticleScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { token, user } = useContext(AuthContext);
  const editingArticle = route.params?.article;

  const [title, setTitle] = useState(editingArticle?.title || '');
  const [category, setCategory] = useState(editingArticle?.category || CATEGORIES[0].id);
  const [content, setContent] = useState(editingArticle?.content || '');
  const [excerpt, setExcerpt] = useState(editingArticle?.excerpt || editingArticle?.executiveSummary || '');
  const [tags, setTags] = useState(editingArticle?.tags?.join(', ') || '');
  const [imageAssets, setImageAssets] = useState(editingArticle?.images?.map((img: any) => img.url).join(', ') || editingArticle?.coverImage || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingArticle?.status === 'published') {
      Alert.alert('Restricted', 'This article is already published and cannot be modified.');
      navigation.goBack();
    }
  }, [editingArticle]);

  const handleSave = async (submitForReview: boolean = false) => {
    if (!title || !content) {
      Alert.alert('Error', 'Title and content are required.');
      return;
    }

    try {
      setLoading(true);
      
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t !== '');
      const imgArray = imageAssets.split(',').map(url => ({ url: url.trim() })).filter(img => img.url !== '');

      const payload = {
        title,
        category,
        content,
        excerpt: excerpt || content.substring(0, 150) + '...',
        tags: tagArray,
        images: imgArray,
        authorName: user?.displayName || user?.name || 'Medical Officer',
      };

      let response;
      if (editingArticle) {
        response = await axios.put(`${API_URL}/medical-officer/articles/${editingArticle._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        response = await axios.post(`${API_URL}/medical-officer/articles`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (submitForReview) {
        const articleId = response.data.article?._id || editingArticle?._id;
        await axios.post(`${API_URL}/medical-officer/articles/${articleId}/submit`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Alert.alert('Success', 'Article submitted for administrator review.');
      } else {
        Alert.alert('Success', 'Article draft saved successfully.');
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving article:', error);
      Alert.alert('Error', 'Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="close" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editingArticle ? 'Edit Article' : 'Write Article'}</Text>
        <TouchableOpacity 
          onPress={() => handleSave(true)}
          disabled={loading}
          style={styles.publishHeaderBtn}
        >
          {loading ? <ActivityIndicator size="small" color={COLORS.primary} /> : (
            <Text style={styles.publishHeaderText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formSection}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, category === cat.id && styles.catChipActive]}
                onPress={() => setCategory(cat.id)}
              >
                <Text style={[styles.catText, category === cat.id && styles.catTextActive]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Enter a compelling title..."
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={COLORS.lightText}
          />

          <Text style={styles.label}>Navigation Tags</Text>
          <TextInput
            style={styles.urlInput}
            placeholder="wildlife, first aid, venom (separate with commas)"
            value={tags}
            onChangeText={setTags}
            placeholderTextColor={COLORS.lightText}
          />

          <Text style={styles.label}>Image Assets (URLs)</Text>
          <TextInput
            style={styles.urlInput}
            placeholder="https://image1.jpg, https://image2.jpg"
            value={imageAssets}
            onChangeText={setImageAssets}
            placeholderTextColor={COLORS.lightText}
          />

          <Text style={styles.label}>Executive Summary</Text>
          <TextInput
            style={[styles.urlInput, { height: 80 }]}
            placeholder="Brief overview for the dashboard preview..."
            value={excerpt}
            onChangeText={setExcerpt}
            multiline
            placeholderTextColor={COLORS.lightText}
          />

          <Text style={styles.label}>Article Content</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Write detailed medical information and advice..."
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            placeholderTextColor={COLORS.lightText}
          />
        </View>

        <View style={styles.actionFooter}>
          <TouchableOpacity 
            style={styles.draftBtn}
            onPress={() => handleSave(false)}
            disabled={loading}
          >
            <Text style={styles.draftBtnText}>Save as Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.publishBtn}
            onPress={() => handleSave(true)}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <Text style={styles.publishBtnText}>Submit for Review</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  publishHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  publishHeaderText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  scrollContent: {
    padding: 24,
  },
  formSection: {
    marginBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.mediumText,
    marginBottom: 12,
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: COLORS.primary,
  },
  catText: {
    fontSize: 14,
    color: COLORS.mediumText,
    fontWeight: '600',
  },
  catTextActive: {
    color: COLORS.primary,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.darkText,
    padding: 0,
    marginBottom: 10,
  },
  urlInput: {
    fontSize: 14,
    color: COLORS.mediumText,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contentInput: {
    fontSize: 16,
    color: COLORS.darkText,
    minHeight: 300,
    lineHeight: 24,
    padding: 0,
  },
  actionFooter: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  draftBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  draftBtnText: {
    color: COLORS.mediumText,
    fontWeight: '700',
  },
  publishBtn: {
    flex: 2,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  publishBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
});

export default CreateArticleScreen;
