import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
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

const CreatePostScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { editPost } = route.params || {};
  
  const { user, token } = useContext(AuthContext);
  const [animalName, setAnimalName] = useState(editPost?.animalName || '');
  const [description, setDescription] = useState(editPost?.experience || '');
  const [image, setImage] = useState<any>(editPost?.photoUrl ? { uri: editPost.photoUrl } : null);
  const [loading, setLoading] = useState(false);

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

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImage(response.assets[0]);
      }
    });
  };

  const handleCreatePost = async () => {
    if (!animalName.trim() || !description.trim()) {
      Alert.alert('Error', 'Please enter both the species name and description.');
      return;
    }

    setLoading(true);

    try {
      if (editPost) {
        // Safe Text-Only Update (matches existing backend PUT logic)
        await axios.put(`${API_URL}/posts/${editPost._id}`, {
          animalName,
          experience: description
        }, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });
        Alert.alert('Success', 'Post updated successfully!');
      } else {
        // Create Mode (Still uses multipart for new posts)
        const formData = new FormData();
        formData.append('animalName', animalName);
        formData.append('experience', description);
        formData.append('authorId', user?.uid);
        formData.append('authorName', user?.displayName || 'Anonymous');
        formData.append('authorAvatar', user?.photoURL || '');

        if (image) {
          formData.append('photo', {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: image.fileName || `post_${Date.now()}.jpg`,
          } as any);
        }

        await axios.post(`${API_URL}/posts`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        });
        Alert.alert('Success', 'Post created successfully!');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving post:', error);
      Alert.alert('Error', 'Failed to save post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderImagePreview = () => {
    if (!image) return null;
    const uri = image.uri.startsWith('http') || image.uri.startsWith('/') 
      ? resolveUrl(image.uri) 
      : image.uri;
    
    return (
      <View style={[styles.imageWrapper, { marginTop: 24 }]}>
        <Image source={{ uri }} style={styles.previewImage} />
        {!editPost && (
          <TouchableOpacity style={styles.removeImage} onPress={() => setImage(null)}>
            <Icon name="close-circle" size={28} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="close" size={24} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editPost ? 'Edit Sighting' : 'Create Post'}</Text>
        <TouchableOpacity 
          onPress={handleCreatePost} 
          disabled={loading || !description.trim() || !animalName.trim()}
          style={styles.postButton}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <Text style={[styles.postButtonText, (!description.trim() || !animalName.trim()) && { color: COLORS.lightText }]}>
              {editPost ? 'Save' : 'Post'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Species Identified</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="e.g., Spectacled Cobra"
            placeholderTextColor={COLORS.lightText}
            value={animalName}
            onChangeText={setAnimalName}
          />
        </View>

        <View style={[styles.inputCard, { marginTop: 16 }]}>
          <Text style={styles.inputLabel}>Observation Details</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Describe behavior, surroundings, and safety level..."
            placeholderTextColor={COLORS.lightText}
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>
        {renderImagePreview() || (
          <TouchableOpacity style={[styles.addImageButton, { marginTop: 24 }]} onPress={handlePickImage}>
            <Icon name="camera-outline" size={32} color={COLORS.primary} />
            <Text style={styles.addImageText}>Attach Evidence</Text>
          </TouchableOpacity>
        )}
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
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  content: {
    padding: 20,
  },
  inputCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1,
  },
  nameInput: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
    padding: 0,
  },
  textInput: {
    fontSize: 16,
    color: COLORS.mediumText,
    textAlignVertical: 'top',
    minHeight: 100,
    padding: 0,
  },
  addImageButton: {
    height: 200,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  imageWrapper: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 16,
  },
  removeImage: {
    position: 'absolute',
    top: 10,
    right: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default CreatePostScreen;
