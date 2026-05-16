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

const CreatePostScreen = () => {
  const navigation = useNavigation<any>();
  const { user, token } = useContext(AuthContext);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImage(response.assets[0]);
      }
    });
  };

  const handleCreatePost = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('animalName', 'Wildlife Sighting'); // Default or add a field for this
    formData.append('experience', description);
    formData.append('authorId', user?.uid);
    formData.append('authorName', user?.displayName || 'Anonymous');
    formData.append('authorAvatar', user?.photoURL || '');

    if (image) {
      formData.append('photo', {
        uri: image.uri,
        type: image.type,
        name: image.fileName || `post_${Date.now()}.jpg`,
      } as any);
    }

    try {
      await axios.post(`${API_URL}/posts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      Alert.alert('Success', 'Post created successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
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
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity 
          onPress={handleCreatePost} 
          disabled={loading || !description.trim()}
          style={styles.postButton}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <Text style={[styles.postButtonText, !description.trim() && { color: COLORS.lightText }]}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Share a wildlife sighting or safety tip..."
            placeholderTextColor={COLORS.lightText}
            multiline
            value={description}
            onChangeText={setDescription}
            autoFocus
          />
        </View>

        {image ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.removeImage} onPress={() => setImage(null)}>
              <Icon name="close-circle" size={28} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addImageButton} onPress={handlePickImage}>
            <Icon name="camera-outline" size={32} color={COLORS.primary} />
            <Text style={styles.addImageText}>Add Photo</Text>
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
  inputContainer: {
    minHeight: 150,
  },
  textInput: {
    fontSize: 18,
    color: COLORS.darkText,
    textAlignVertical: 'top',
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
