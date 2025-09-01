// screens/HomeScreen.tsx
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
  Dimensions,
  Modal,
} from 'react-native';
import {Asset} from 'react-native-image-picker';
import {NativeModules} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import HapticFeedback from 'react-native-haptic-feedback';

// Import controllers
import {ImageController} from '../../controllers/ImageController';
import {IdentificationController} from '../../controllers/IdentificationController';

// Import models
import {AnimalDetails} from '../../models/AnimalDetails';

// Import components
import Header from '../components/Header';
import Menu from '../components/Menu';
import AboutScreen from './AboutScreen';
import SnakeDirectoryScreen from './SnakeDirectoryScreen';
import EmergencyScreen from './EmergencyScreen';

// Import snake data
import snakeData from '../../assets/snake_data.json';

const {ImageClassifier} = NativeModules;
const {width, height} = Dimensions.get('window');

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const [image, setImage] = useState<Asset | null>(null);
  const [resultData, setResultData] = useState<Partial<AnimalDetails> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnlineMode, setIsOnlineMode] = useState(true);
  const [selectionMode, setSelectionMode] = useState<'camera' | 'gallery'>('gallery');
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isAboutVisible, setAboutVisible] = useState(false);
  const [isDirectoryVisible, setDirectoryVisible] = useState(false);
  const [isEmergencyVisible, setEmergencyVisible] = useState(false);
  const resultCardRef = useRef<Animatable.View & View>(null);

  React.useEffect(() => {
    if (ImageClassifier && ImageClassifier.getModelFileName) {
      ImageClassifier.getModelFileName()
        .then((modelFileName: string) => {
          console.log('🐍 Loaded model file:', modelFileName);
        })
        .catch((error: any) => {
          console.error('Error fetching model file name:', error);
        });
    } else {
      console.warn('ImageClassifier.getModelFileName method not available');
    }
  }, []);

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

  const handleImageSelection = () => {
    if (selectionMode === 'camera') {
      ImageController.captureImage((asset) => {
        if (asset) {
          setImage(asset);
          setResultData(null);
          setError(null);
          hapticTrigger();
        }
      });
    } else {
      ImageController.pickImage((asset) => {
        if (asset) {
          setImage(asset);
          setResultData(null);
          setError(null);
          hapticTrigger();
        }
      });
    }
  };

  const handleNavigation = (screen: 'Home' | 'About' | 'Settings' | 'Directory' | 'Emergency') => {
    setMenuVisible(false);
    if (screen === 'About') {
      setTimeout(() => setAboutVisible(true), 300);
    }
    if (screen === 'Directory') {
      setTimeout(() => setDirectoryVisible(true), 300);
    }
    if (screen === 'Emergency') {
      setTimeout(() => setEmergencyVisible(true), 300);
    }
    if (screen === 'Settings') {
      Alert.alert('Settings', 'Settings screen is not yet implemented.');
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
      const result = await IdentificationController.identifyOnline(image);
      if (result.error) {
        setError(result.error);
      } else {
        setResultData(result);
      }
    } else {
      const result = await IdentificationController.identifyOffline(image.uri);
      if (result.error) {
        setError(result.error);
      } else {
        setResultData(result);
      }
    }
    setLoading(false);
    if (resultCardRef.current && typeof resultCardRef.current.fadeInUp === 'function') {
      resultCardRef.current.fadeInUp(800);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Wildlife Safety"
        onMenuPress={() => setMenuVisible(true)}
        onEmergencyPress={() => setEmergencyVisible(true)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}>

        {/* Hero Section */}
        <Animatable.View animation="fadeInDown" duration={800} delay={200} style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Icon name="leaf-outline" size={32} color={COLORS.primary} style={styles.heroIcon} />
            <Text style={styles.heroTitle}>Identify Wildlife Safely</Text>
            <Text style={styles.heroSubtitle}>
              Get instant identification and safety information for animals you encounter
            </Text>
          </View>

          {/* Mode Selector Card */}
          <View style={styles.modeCard}>
            <View style={styles.modeHeader}>
              <Icon name="settings-outline" size={20} color={COLORS.primary} />
              <Text style={styles.modeCardTitle}>Detection Mode</Text>
            </View>

            <View style={styles.modeSelector}>
              <View style={styles.modeOption}>
                <Icon name="flash-off-outline" size={16} color={!isOnlineMode ? COLORS.primary : COLORS.lightText} />
                <Text style={[styles.modeText, !isOnlineMode && styles.modeTextActive]}>
                  Offline
                </Text>
              </View>

              <Switch
                trackColor={{false: COLORS.switchTrack, true: COLORS.switchTrackActive}}
                thumbColor={isOnlineMode ? COLORS.primary : COLORS.switchThumb}
                onValueChange={handleModeChange}
                value={isOnlineMode}
                style={styles.switch}
              />

              <View style={styles.modeOption}>
                <Icon name="wifi-outline" size={16} color={isOnlineMode ? COLORS.primary : COLORS.lightText} />
                <Text style={[styles.modeText, isOnlineMode && styles.modeTextActive]}>
                  Online
                </Text>
              </View>
            </View>

            <Text style={styles.modeDescription}>
              {isOnlineMode
                ? 'Enhanced accuracy with detailed server analysis'
                : 'Quick on-device identification without internet'}
            </Text>
          </View>
        </Animatable.View>

        {/* Image Selection Section */}
        <Animatable.View
          animation="fadeIn"
          duration={800}
          delay={400}
          style={styles.selectionSection}>

          <Text style={styles.sectionTitle}>Choose Image Source</Text>

          <View style={styles.selectionTabs}>
            <TouchableOpacity
              style={[styles.tabButton, selectionMode === 'camera' && styles.tabButtonActive]}
              onPress={() => handleSelectionModeChange('camera')}
              activeOpacity={0.8}>
              <Icon
                name="camera"
                size={22}
                color={selectionMode === 'camera' ? COLORS.white : COLORS.primary}
              />
              <Text style={[styles.tabText, selectionMode === 'camera' && styles.tabTextActive]}>
                Camera
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, selectionMode === 'gallery' && styles.tabButtonActive]}
              onPress={() => handleSelectionModeChange('gallery')}
              activeOpacity={0.8}>
              <Icon
                name="images"
                size={22}
                color={selectionMode === 'gallery' ? COLORS.white : COLORS.primary}
              />
              <Text style={[styles.tabText, selectionMode === 'gallery' && styles.tabTextActive]}>
                Gallery
              </Text>
            </TouchableOpacity>
          </View>

          {/* Image Container */}
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={handleImageSelection}
            activeOpacity={0.9}>
            {image ? (
              <View style={styles.imageWrapper}>
                <Image source={{uri: image.uri}} style={styles.image} />
                <View style={styles.imageOverlay}>
                  <TouchableOpacity
                    style={styles.changeImageButton}
                    onPress={handleImageSelection}>
                    <Icon name="refresh" size={20} color={COLORS.white} />
                    <Text style={styles.changeImageText}>Change Image</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <View style={styles.placeholderIconContainer}>
                  <Icon
                    name={selectionMode === 'camera' ? 'camera' : 'images'}
                    size={48}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.placeholderTitle}>
                  {selectionMode === 'camera'
                    ? 'Take a Photo'
                    : 'Select from Gallery'}
                </Text>
                <Text style={styles.placeholderSubtitle}>
                  {selectionMode === 'camera'
                    ? 'Capture an animal photo for identification'
                    : 'Choose an image from your photo library'}
                </Text>
                <View style={styles.placeholderButton}>
                  <Text style={styles.placeholderButtonText}>Tap to {selectionMode === 'camera' ? 'Capture' : 'Browse'}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </Animatable.View>

        {/* Identify Button */}
        {image && (
          <Animatable.View animation="fadeInUp" duration={600} delay={100} style={styles.identifySection}>
            <TouchableOpacity
              style={[styles.identifyButton, loading && styles.identifyButtonDisabled]}
              onPress={identifyAnimal}
              disabled={loading}
              activeOpacity={0.8}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.white} />
                  <Text style={styles.loadingText}>Analyzing...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Icon name="search" size={22} color={COLORS.white} />
                  <Text style={styles.identifyButtonText}>Identify Animal</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animatable.View>
        )}

        {/* Error Display */}
        {error && (
          <Animatable.View animation="shake" duration={600} style={styles.errorContainer}>
            <Icon name="alert-circle" size={20} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </Animatable.View>
        )}

        {/* Results Card */}
        {resultData && (
          <Animatable.View
            ref={resultCardRef}
            style={styles.resultCard}
            animation="fadeInUp"
            duration={800}>

            <View style={styles.resultHeader}>
              <Icon name="checkmark-circle" size={28} color={COLORS.success} />
              <Text style={styles.resultBadge}>Identified</Text>
            </View>

            <Text style={styles.resultTitle}>{resultData.Animal}</Text>
            <Text style={styles.scientificName}>{resultData.ScientificName}</Text>

            <View style={styles.quickInfo}>
              <View style={styles.infoChip}>
                <Icon name="shield-checkmark" size={16} color={COLORS.primary} />
                <Text style={styles.infoChipText} numberOfLines={1}>
                  {resultData.ConservationStatus}
                </Text>
              </View>

              {resultData.LocalNames && (
                <View style={styles.infoChip}>
                  <Icon name="language" size={16} color={COLORS.primary} />
                  <Text style={styles.infoChipText} numberOfLines={7}>
                    {resultData.LocalNames}
                  </Text>
                </View>
              )}
            </View>

            {resultData.Venom && (
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <Icon name="warning" size={20} color={COLORS.warning} />
                  <Text style={styles.detailTitle}>Venom & Medical Significance</Text>
                </View>
                <Text style={styles.detailContent}>{resultData.Venom}</Text>
              </View>
            )}

            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                <Icon name="information-circle" size={20} color={COLORS.info} />
                <Text style={styles.detailTitle}>Description</Text>
              </View>
              <Text style={styles.detailContent}>{resultData.Description}</Text>
            </View>

            {resultData.FunFact && (
              <View style={styles.funFactSection}>
                <View style={styles.detailHeader}>
                  <Icon name="bulb" size={20} color={COLORS.accent} />
                  <Text style={styles.detailTitle}>Did You Know?</Text>
                </View>
                <Text style={styles.funFactText}>{resultData.FunFact}</Text>
              </View>
            )}
          </Animatable.View>
        )}
      </ScrollView>

      {/* Menu Modal */}
      <Modal
        visible={isMenuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}>
        <Menu
          visible={isMenuVisible}
          onClose={() => setMenuVisible(false)}
          onNavigate={handleNavigation}
        />
      </Modal>

      {/* About Modal */}
      <Modal
        visible={isAboutVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setAboutVisible(false)}>
        <AboutScreen onClose={() => setAboutVisible(false)} />
      </Modal>

      {/* Directory Modal */}
      <Modal
        visible={isDirectoryVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDirectoryVisible(false)}>
        <SnakeDirectoryScreen onClose={() => setDirectoryVisible(false)} />
      </Modal>

      {/* Emergency Modal */}
      <Modal
        visible={isEmergencyVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setEmergencyVisible(false)}>
        <EmergencyScreen onClose={() => setEmergencyVisible(false)} />
      </Modal>
    </View>
  );
};

// --- Enhanced Color Palette ---
const COLORS = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceVariant: '#F8F9FA',
  white: '#FFFFFF',
  darkText: '#212121',
  mediumText: '#424242',
  lightText: '#757575',
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#F57C00',
  info: '#1976D2',
  accent: '#7B1FA2',
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  switchTrack: '#E0E0E0',
  switchTrackActive: '#A5D6A7',
  switchThumb: '#FAFAFA',
  overlay: 'rgba(0, 0, 0, 0.3)',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Hero Section
  heroSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroIcon: {
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.mediumText,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },

  // Mode Card
  modeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modeCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkText,
    marginLeft: 8,
  },
  modeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modeText: {
    fontSize: 16,
    marginLeft: 8,
    color: COLORS.lightText,
    fontWeight: '500',
  },
  modeTextActive: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  switch: {
    transform: [{scaleX: 1.1}, {scaleY: 1.1}],
    marginHorizontal: 20,
  },
  modeDescription: {
    fontSize: 14,
    color: COLORS.mediumText,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Selection Section
  selectionSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 16,
    textAlign: 'center',
  },
  selectionTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
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

  // Image Container
  imageContainer: {
    width: '100%',
    height: 280,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  imageWrapper: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeImageText: {
    color: COLORS.darkText,
    marginLeft: 8,
    fontWeight: '600',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  placeholderIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: COLORS.mediumText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  placeholderButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  placeholderButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Identify Section
  identifySection: {
    marginBottom: 30,
  },
  identifyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  identifyButtonDisabled: {
    backgroundColor: COLORS.lightText,
    shadowOpacity: 0.1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  identifyButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.white,
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '600',
  },

  // Error Container
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },

  // Results Card
  resultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultBadge: {
    backgroundColor: COLORS.success,
    color: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 4,
    textAlign: 'center',
  },
  scientificName: {
    fontSize: 16,
    fontStyle: 'italic',
    color: COLORS.mediumText,
    marginBottom: 20,
    textAlign: 'center',
  },
  quickInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    justifyContent: 'center',
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
    maxWidth: width * 0.4,
  },
  infoChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.mediumText,
    marginLeft: 4,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginLeft: 8,
  },
  detailContent: {
    fontSize: 16,
    color: COLORS.mediumText,
    lineHeight: 24,
    backgroundColor: COLORS.surfaceVariant,
    padding: 16,
    borderRadius: 12,
  },
  funFactSection: {
    backgroundColor: 'rgba(123, 31, 162, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  funFactText: {
    fontSize: 16,
    color: COLORS.darkText,
    lineHeight: 24,
    fontStyle: 'italic',
  },
});

export default HomeScreen;
