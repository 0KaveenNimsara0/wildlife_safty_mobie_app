// App.tsx
import React, {useState, useRef} from 'react';
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
  Platform,
  UIManager,
  LayoutAnimation,
  Modal, // Import Modal
} from 'react-native';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';
import {NativeModules} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import HapticFeedback from 'react-native-haptic-feedback';

// --- Import the components ---
import Header from './android/app/src/main/components/Header';
import Menu from './android/app/src/main/components/Menu';
import AboutScreen from './android/app/src/main/screens/AboutScreen'; // Import the new About screen

// --- Import the local snake data for offline use ---
import snakeData from './snake_data.json';

// --- Native Module for Offline Classification ---
const {ImageClassifier} = NativeModules;

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  const [resultData, setResultData] = useState<Partial<AnimalDetails> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnlineMode, setIsOnlineMode] = useState(true);
  const [selectionMode, setSelectionMode] = useState<'camera' | 'gallery'>(
    'gallery',
  );
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isAboutVisible, setAboutVisible] = useState(false); // State for About screen
  const resultCardRef = useRef<Animatable.View & View>(null);

  const handleNavigation = (screen: 'Home' | 'About' | 'Settings') => {
    setMenuVisible(false); // Close the menu
    if (screen === 'About') {
      setTimeout(() => setAboutVisible(true), 300); // Open About screen after a short delay
    }
    // Handle other screens if needed
    if (screen === 'Home') {
      // Already on home, do nothing or scroll to top
    }
    if (screen === 'Settings') {
      Alert.alert('Settings', 'Settings screen is not yet implemented.');
    }
  };

  // ... (rest of the functions: hapticTrigger, handleModeChange, etc. remain the same)
  const hapticTrigger = () => {
    const options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    };
    HapticFeedback.trigger('impactLight', options);
  };

  const handleModeChange = (newMode: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOnlineMode(newMode);
    setResultData(null);
    setError(null);
    hapticTrigger();
  };

  const handleSelectionModeChange = (mode: 'camera' | 'gallery') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectionMode(mode);
    hapticTrigger();
  };

  const pickImage = () => {
    launchImageLibrary({mediaType: 'photo'}, (response: ImagePickerResponse) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        setError(`ImagePicker Error: ${response.errorMessage}`);
      } else if (response.assets && response.assets[0]) {
        setImage(response.assets[0]);
        setResultData(null);
        setError(null);
        hapticTrigger();
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
        if (response.didCancel) return;
        if (response.errorCode) {
          setError(`Camera Error: ${response.errorMessage}`);
        } else if (response.assets && response.assets[0]) {
          setImage(response.assets[0]);
          setResultData(null);
          setError(null);
          hapticTrigger();
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
    hapticTrigger();
    if (isOnlineMode) {
      await identifyOnline(image);
    } else {
      await identifyOffline(image.uri);
    }
    setLoading(false);
    if (resultCardRef.current && typeof resultCardRef.current.fadeInUp === 'function') {
      resultCardRef.current.fadeInUp(800);
    }
  };

  const identifyOffline = async (imageUri: string) => {
    try {
      const predictedClass = await ImageClassifier.classifyImage(imageUri);
      const lookupKey = predictedClass.toLowerCase().trim();
      const details = snakeData.find(
        snake =>
          snake['Common English Name(s)'].toLowerCase().trim() === lookupKey,
      );
      if (details) {
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
        setError(
          `Details for "${predictedClass}" not found in offline database.`,
        );
        setResultData({
          Animal: predictedClass,
          ScientificName: 'No further details available offline.',
        });
      }
    } catch (e: any) {
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
      setError('Upload failed. Check network and server address.');
    }
  };


  return (
    <View style={styles.container}>
      <Header title="Wildlife Safety" onMenuPress={() => setMenuVisible(true)} />
      <Menu 
        visible={isMenuVisible} 
        onClose={() => setMenuVisible(false)}
        onNavigate={handleNavigation}
      />

      {/* About Screen Modal */}
      <Modal
        visible={isAboutVisible}
        animationType="slide"
        onRequestClose={() => setAboutVisible(false)}
      >
        <AboutScreen onClose={() => setAboutVisible(false)} />
      </Modal>

      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* ... The rest of your JSX for the main screen ... */}
        <Animatable.View animation="fadeInDown" duration={800} delay={200}>
          <View style={styles.modeSelector}>
            <Text
              style={[
                styles.modeText,
                !isOnlineMode && styles.modeTextActive,
              ]}>
              Offline
            </Text>
            <Switch
              trackColor={{false: '#767577', true: '#81b0ff'}}
              thumbColor={isOnlineMode ? '#3498db' : '#f4f3f4'}
              onValueChange={handleModeChange}
              value={isOnlineMode}
            />
            <Text
              style={[styles.modeText, isOnlineMode && styles.modeTextActive]}>
              Online
            </Text>
          </View>
          <Text style={styles.modeDescription}>
            {isOnlineMode
              ? 'Get detailed info from server'
              : 'Fast, on-device identification'}
          </Text>
        </Animatable.View>

        <Animatable.View
          animation="fadeIn"
          duration={800}
          delay={400}
          style={styles.fullWidth}>
          <View style={styles.selectionTabs}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                selectionMode === 'camera' && styles.tabButtonActive,
              ]}
              onPress={() => handleSelectionModeChange('camera')}>
              <Icon
                name="camera-outline"
                size={20}
                color={selectionMode === 'camera' ? '#fff' : '#3498db'}
              />
              <Text
                style={[
                  styles.tabText,
                  selectionMode === 'camera' && styles.tabTextActive,
                ]}>
                Camera
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                selectionMode === 'gallery' && styles.tabButtonActive,
              ]}
              onPress={() => handleSelectionModeChange('gallery')}>
              <Icon
                name="images-outline"
                size={20}
                color={selectionMode === 'gallery' ? '#fff' : '#3498db'}
              />
              <Text
                style={[
                  styles.tabText,
                  selectionMode === 'gallery' && styles.tabTextActive,
                ]}>
                Gallery
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.imageContainer}
            onPress={handleImageSelection}
            activeOpacity={0.7}>
            {image ? (
              <Image source={{uri: image.uri}} style={styles.image} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Icon
                  name={
                    selectionMode === 'camera'
                      ? 'camera-outline'
                      : 'images-outline'
                  }
                  size={48}
                  color="#aab8c2"
                />
                <Text style={styles.placeholderText}>
                  {selectionMode === 'camera'
                    ? 'Tap to Capture Photo'
                    : 'Tap to Select from Gallery'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animatable.View>

        {image && (
          <Animatable.View animation="fadeInUp" duration={600} delay={100}>
            <TouchableOpacity
              style={styles.button}
              onPress={identifyAnimal}
              disabled={loading}>
              <Text style={styles.buttonText}>Identify Animal</Text>
            </TouchableOpacity>
          </Animatable.View>
        )}
        {loading && (
          <ActivityIndicator
            size="large"
            color="#3498db"
            style={styles.loader}
          />
        )}
        {error && (
          <Animatable.Text
            animation="shake"
            duration={600}
            style={styles.errorText}>
            <Icon name="alert-circle-outline" size={18} /> {error}
          </Animatable.Text>
        )}
        {resultData && (
          <Animatable.View
            ref={resultCardRef}
            style={styles.resultCard}
            animation="fadeInUp"
            duration={800}>
            <Text style={styles.resultTitle}>{resultData.Animal}</Text>
            <Text style={styles.scientificName}>
              {resultData.ScientificName}
            </Text>

            <View style={styles.detailRow}>
              <Icon
                name="shield-checkmark-outline"
                size={22}
                style={styles.detailIcon}
              />
              <Text style={styles.detailLabel}>Status:</Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color: resultData.ConservationStatus?.includes(
                      'Threatened',
                    )
                      ? '#e74c3c'
                      : '#2ecc71',
                  },
                ]}>
                {resultData.ConservationStatus}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon
                name="language-outline"
                size={22}
                style={styles.detailIcon}
              />
              <Text style={styles.detailLabel}>Local Names:</Text>
              <Text style={styles.detailValue}>{resultData.LocalNames}</Text>
            </View>

            <Text style={styles.sectionTitle}>
              <Icon name="warning-outline" size={20} /> Venom & Significance
            </Text>
            <Text style={styles.description}>{resultData.Venom}</Text>

            <Text style={styles.sectionTitle}>
              <Icon name="information-circle-outline" size={20} /> Description
            </Text>
            <Text style={styles.description}>{resultData.Description}</Text>
            {resultData.FunFact && (
              <>
                <Text style={styles.sectionTitle}>
                  <Icon name="bulb-outline" size={20} /> Fun Fact
                </Text>
                <Text style={styles.funFact}>{resultData.FunFact}</Text>
              </>
            )}
          </Animatable.View>
        )}
      </ScrollView>
    </View>
  );
};

// --- Styles (using the same modern StyleSheet from the previous update) ---
const COLORS = {
  primary: '#3498db',
  secondary: '#2ecc71',
  background: '#ecf0f1',
  white: '#ffffff',
  darkText: '#2c3e50',
  lightText: '#7f8c8d',
  error: '#e74c3c',
  card: '#ffffff',
  border: '#bdc3c7',
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  scrollView: {padding: 20, alignItems: 'center'},
  fullWidth: {width: '100%', alignItems: 'center'},
  modeSelector: {flexDirection: 'row', alignItems: 'center', marginBottom: 5},
  modeText: {fontSize: 16, marginHorizontal: 10, color: COLORS.lightText},
  modeTextActive: {fontWeight: 'bold', color: COLORS.primary},
  modeDescription: {fontSize: 14, color: COLORS.lightText, marginBottom: 20},
  selectionTabs: {
    flexDirection: 'row',
    backgroundColor: '#dfe6e9',
    borderRadius: 30,
    padding: 5,
    marginBottom: 20,
    width: '90%',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 25,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: COLORS.lightText,
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 10,
  },
  button: {
    backgroundColor: COLORS.primary,
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
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {marginVertical: 20},
  errorText: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    fontWeight: '600',
    padding: 10,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 10,
    width: '100%',
  },
  resultCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginTop: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 4,
    textAlign: 'center',
  },
  scientificName: {
    fontSize: 16,
    fontStyle: 'italic',
    color: COLORS.lightText,
    marginBottom: 25,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
  },
  detailIcon: {
    color: COLORS.primary,
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.lightText,
    flexShrink: 1,
    flex: 1,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginTop: 20,
    marginBottom: 10,
    borderTopColor: COLORS.background,
    borderTopWidth: 1,
    paddingTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    color: COLORS.darkText,
    lineHeight: 24,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  funFact: {
    fontSize: 16,
    color: '#16a085',
    fontStyle: 'italic',
    lineHeight: 22,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#2ecc71',
  },
});

export default App;
