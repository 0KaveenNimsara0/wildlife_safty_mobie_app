import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {
  launchImageLibrary,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';
import {NativeModules} from 'react-native';

// --- Native Module for Offline Classification ---
const {ImageClassifier} = NativeModules;

// --- TypeScript Interface for API Data ---
interface AnimalDetails {
  Animal: string;
  ScientificName: string;
  Type: string;
  Diet: string;
  ConservationStatus: string;
  Description: string;
  FunFact: string;
  prediction?: string;
  error?: string;
}

const App = () => {
  const [image, setImage] = useState<Asset | null>(null);
  const [resultData, setResultData] = useState<Partial<AnimalDetails> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnlineMode, setIsOnlineMode] = useState(true); // Default to Online mode

  const handleModeChange = (newMode: boolean) => {
    setIsOnlineMode(newMode);
    // Clear results when switching modes
    setResultData(null); 
    setError(null);
  };

  const pickImage = () => {
    launchImageLibrary({mediaType: 'photo'}, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        setError('ImagePicker Error: ' + response.errorMessage);
      } else if (response.assets && response.assets[0]) {
        setImage(response.assets[0]);
        setResultData(null);
        setError(null);
      }
    });
  };

  const identifyAnimal = async () => {
    if (!image || !image.uri) {
      Alert.alert('Please select an image first.');
      return;
    }

    setLoading(true);
    setError(null);
    setResultData(null);

    if (isOnlineMode) {
      await identifyOnline(image);
    } else {
      await identifyOffline(image.uri);
    }

    setLoading(false);
  };

  const identifyOffline = async (imageUri: string) => {
    try {
      // Call our native module's method
      const predictionResult = await ImageClassifier.classifyImage(imageUri);
      // Display the basic result from the offline model
      setResultData({ Animal: predictionResult });
    } catch (e: any) {
      console.error('Offline classification failed:', e);
      setError(`Offline Error: ${e.message}`);
    }
  };

  const identifyOnline = async (imageAsset: Asset) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageAsset.uri,
      type: imageAsset.type || 'image/jpeg',
      name: imageAsset.fileName || 'animal.jpg',
    });

    try {
      // IMPORTANT: Use your computer's current local IP address
      const API_URL = 'http://192.168.8.156:5000/predict';
      
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {'Content-Type': 'multipart/form-data'},
      });

      const json: AnimalDetails = await response.json();

      if (response.ok && !json.error) {
        setResultData(json);
      } else {
        setError(json.error || 'An unknown API error occurred.');
      }
    } catch (e: any) {
      console.error('Online upload failed:', e);
      setError('Upload failed. Check network and server address.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>Wildlife Safety</Text>

        <View style={styles.modeSelector}>
          <Text style={styles.modeText}>Offline</Text>
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={isOnlineMode ? '#f5dd4b' : '#f4f3f4'}
            onValueChange={handleModeChange}
            value={isOnlineMode}
          />
          <Text style={styles.modeText}>Online</Text>
        </View>
        <Text style={styles.modeDescription}>
            {isOnlineMode ? 'Get detailed info from server' : 'Fast, on-device identification'}
        </Text>

        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {image ? (
            <Image source={{uri: image.uri}} style={styles.image} />
          ) : (
            <Text style={styles.placeholderText}>Tap to Select an Image</Text>
          )}
        </TouchableOpacity>

        {image && (
          <TouchableOpacity style={styles.button} onPress={identifyAnimal} disabled={loading}>
            <Text style={styles.buttonText}>Identify Animal</Text>
          </TouchableOpacity>
        )}

        {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {resultData && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>{resultData.Animal}</Text>
            {isOnlineMode && resultData.ScientificName && (
              <>
                <Text style={styles.scientificName}>{resultData.ScientificName}</Text>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <Text style={[styles.detailValue, {color: resultData.ConservationStatus === 'Endangered' ? '#D9534F' : '#5CB85C'}]}>{resultData.ConservationStatus}</Text>
                </View>
                <Text style={styles.description}>{resultData.Description}</Text>
                <Text style={styles.funFactTitle}>Fun Fact</Text>
                <Text style={styles.funFact}>{resultData.FunFact}</Text>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f0f4f7'},
  scrollView: {padding: 20, alignItems: 'center'},
  title: {fontSize: 32, fontWeight: 'bold', marginBottom: 10, color: '#333'},
  modeSelector: {flexDirection: 'row', alignItems: 'center', marginBottom: 5},
  modeText: {fontSize: 16, marginHorizontal: 10},
  modeDescription: {fontSize: 14, color: '#666', marginBottom: 20},
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {width: '100%', height: '100%', borderRadius: 12, resizeMode: 'contain'},
  placeholderText: {color: '#999', fontSize: 18, fontWeight: '500'},
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {color: 'white', fontSize: 18, fontWeight: 'bold'},
  loader: {marginVertical: 20},
  errorText: {marginTop: 20, fontSize: 16, color: 'red', textAlign: 'center'},
  resultCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    elevation: 3,
  },
  resultTitle: {fontSize: 26, fontWeight: 'bold', color: '#222', marginBottom: 5},
  scientificName: {fontSize: 16, fontStyle: 'italic', color: '#666', marginBottom: 15},
  detailRow: {flexDirection: 'row', marginBottom: 10},
  detailLabel: {fontSize: 16, fontWeight: 'bold', color: '#444', marginRight: 8},
  detailValue: {fontSize: 16, color: '#555', flexShrink: 1},
  description: {fontSize: 16, color: '#333', marginTop: 15, lineHeight: 24},
  funFactTitle: {fontSize: 18, fontWeight: 'bold', color: '#222', marginTop: 20, marginBottom: 5},
  funFact: {fontSize: 16, color: '#333', fontStyle: 'italic', lineHeight: 22},
});

export default App;
