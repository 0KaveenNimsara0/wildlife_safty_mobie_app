// App.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';
import {NativeModules} from 'react-native';

// --- Import the new components ---
import Header from './android/app/src/main/components/Header';
import Menu from './android/app/src/main/components/Menu';

// --- Import the local snake data for offline use ---
import snakeData from './snake_data.json'; 

// --- Native Module for Offline Classification ---
const {ImageClassifier} = NativeModules;

// --- TypeScript Interface for API and Local Data ---
interface AnimalDetails {
  Animal: string;
  ScientificName: string;
  LocalNames?: string;
  Venom?: string;
  Description: string;
  ConservationStatus: string;
  FunFact?: string;
  error?: string;
}

const App = () => {
  const [image, setImage] = useState<Asset | null>(null);
  const [resultData, setResultData] = useState<Partial<AnimalDetails> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnlineMode, setIsOnlineMode] = useState(true);
  const [selectionMode, setSelectionMode] = useState<'camera' | 'gallery'>('gallery');
  
  // --- State to control the menu visibility ---
  const [isMenuVisible, setMenuVisible] = useState(false);

  const handleModeChange = (newMode: boolean) => {
    setIsOnlineMode(newMode);
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

  const captureImage = () => {
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        quality: 0.8,
        saveToPhotos: true,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.errorCode) {
          setError('Camera Error: ' + response.errorMessage);
        } else if (response.assets && response.assets[0]) {
          setImage(response.assets[0]);
          setResultData(null);
          setError(null);
        }
      },
    );
  };

  const handleImageSelection = () => {
    if (selectionMode === 'camera') {
      captureImage();
    } else {
      pickImage();
    }
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

  // --- UPDATED: Offline mode now provides full details ---
  const identifyOffline = async (imageUri: string) => {
    try {
      // 1. Get the basic prediction from the native TFLite model
      const predictedClass = await ImageClassifier.classifyImage(imageUri);
      const lookupKey = predictedClass.toLowerCase().trim();

      // 2. Find the full details in our local JSON data
      const details = snakeData.find(
        (snake) => snake['Common English Name(s)'].toLowerCase().trim() === lookupKey,
      );

      if (details) {
        // 3. If found, format the data just like the API response
        setResultData({
          Animal: details['Common English Name(s)'],
          ScientificName: details['Scientific Name & Authority'],
          LocalNames: details['Local Name(s) (Sinhala/Tamil)'],
          Venom: details['Venom & Medical Significance'],
          Description: details.Description,
          ConservationStatus: details['Global IUCN Red List Status'],
          FunFact: `This species is from the '${details.Family}' family.`,
        });
      } else {
        // 4. If not found in the JSON, show a basic message
        setError(`Details for "${predictedClass}" not found in offline database.`);
        setResultData({ Animal: predictedClass, ScientificName: 'No further details available offline.' });
      }
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
      const API_URL = 'http://192.168.1.5:5000/predict';
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
    <View style={styles.container}>
      <Header title="Wildlife Safety" onMenuPress={() => setMenuVisible(true)} />
      <Menu visible={isMenuVisible} onClose={() => setMenuVisible(false)} />
      
      <ScrollView contentContainerStyle={styles.scrollView}>
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

        {/* Camera/Gallery Selection Tabs */}
        <View style={styles.selectionTabs}>
          <TouchableOpacity 
            style={[styles.tabButton, selectionMode === 'camera' && styles.tabButtonActive]}
            onPress={() => setSelectionMode('camera')}
          >
            <Text style={[styles.tabText, selectionMode === 'camera' && styles.tabTextActive]}>
              📷 Camera
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, selectionMode === 'gallery' && styles.tabButtonActive]}
            onPress={() => setSelectionMode('gallery')}
          >
            <Text style={[styles.tabText, selectionMode === 'gallery' && styles.tabTextActive]}>
              🖼️ Gallery
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.imageContainer} onPress={handleImageSelection}>
          {image ? (
            <Image source={{uri: image.uri}} style={styles.image} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderIcon}>
                {selectionMode === 'camera' ? '📷' : '🖼️'}
              </Text>
              <Text style={styles.placeholderText}>
                {selectionMode === 'camera' ? 'Tap to Capture Photo' : 'Tap to Select from Gallery'}
              </Text>
            </View>
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
            <Text style={styles.scientificName}>{resultData.ScientificName}</Text>
            
            {/* Display all the new details */}
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={[styles.detailValue, {color: resultData.ConservationStatus?.includes('Threatened') ? '#D9534F' : '#5CB85C'}]}>{resultData.ConservationStatus}</Text>
            </View>
             <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Local Names:</Text>
                <Text style={styles.detailValue}>{resultData.LocalNames}</Text>
            </View>
             <Text style={styles.sectionTitle}>Venom & Significance</Text>
            <Text style={styles.description}>{resultData.Venom}</Text>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{resultData.Description}</Text>
            {resultData.FunFact && (
                <>
                    <Text style={styles.sectionTitle}>Fun Fact</Text>
                    <Text style={styles.funFact}>{resultData.FunFact}</Text>
                </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// Styles remain the same, but the 'title' style is no longer needed
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f0f4f7'},
  scrollView: {padding: 20, alignItems: 'center'},
  modeSelector: {flexDirection: 'row', alignItems: 'center', marginBottom: 5},
  modeText: {fontSize: 16, marginHorizontal: 10},
  modeDescription: {fontSize: 14, color: '#666', marginBottom: 20},
  selectionTabs: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
    width: '80%',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
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
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  placeholderText: {
    color: '#999', 
    fontSize: 18, 
    fontWeight: '500',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    transform: [{ scale: 1 }],
  },
  buttonText: {
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  loader: {marginVertical: 20},
  errorText: {marginTop: 20, fontSize: 16, color: 'red', textAlign: 'center'},
  resultCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginTop: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  resultTitle: {
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#2c3e50', 
    marginBottom: 4,
    textAlign: 'center',
  },
  scientificName: {
    fontSize: 16, 
    fontStyle: 'italic', 
    color: '#7f8c8d', 
    marginBottom: 20,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row', 
    marginBottom: 12, 
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#34495e', 
    marginRight: 8,
    minWidth: 100,
  },
  detailValue: {
    fontSize: 16, 
    color: '#2c3e50', 
    flexShrink: 1,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#2c3e50', 
    marginTop: 20, 
    marginBottom: 10, 
    borderTopColor: '#ecf0f1', 
    borderTopWidth: 2, 
    paddingTop: 15,
    paddingLeft: 8,
  },
  description: {
    fontSize: 16, 
    color: '#34495e', 
    lineHeight: 24,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  funFact: {
    fontSize: 16, 
    color: '#27ae60', 
    fontStyle: 'italic', 
    lineHeight: 22,
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
});

export default App;