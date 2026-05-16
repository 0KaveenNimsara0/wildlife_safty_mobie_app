// screens/HomeScreen.tsx
import React, {useState, useRef, useContext} from 'react';
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
import LinearGradient from 'react-native-linear-gradient';

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
import { AuthContext } from '../../context/AuthContext';

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
  const { user, token } = useContext(AuthContext);
  const [image, setImage] = useState<Asset | null>(null);
  const [resultData, setResultData] = useState<Partial<AnimalDetails> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnlineMode, setIsOnlineMode] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'camera' | 'gallery'>('camera');
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

  const handleImageCapture = () => {
    ImageController.captureImage((asset) => {
      if (asset) {
        setImage(asset);
        setResultData(null);
        setError(null);
        hapticTrigger();
      }
    });
  };

  const handleGallerySelection = () => {
    ImageController.pickImage((asset) => {
      if (asset) {
        setImage(asset);
        setResultData(null);
        setError(null);
        hapticTrigger();
      }
    });
  };

  const handleNavigation = (screen: 'Home' | 'About' | 'Settings' | 'Directory' | 'Emergency' | 'Auth' | 'Profile' | 'Community' | 'ChatList' | 'Articles' | 'Notifications' | 'Discoveries' | 'History') => {
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
    if (screen === 'Auth') {
      setTimeout(() => navigation.navigate('Auth'), 300);
    }
    if (screen === 'Profile') {
      setTimeout(() => navigation.navigate('Profile'), 300);
    }
    if (screen === 'Community') {
      setTimeout(() => navigation.navigate('Community'), 300);
    }
    if (screen === 'ChatList') {
      setTimeout(() => navigation.navigate('ChatList'), 300);
    }
    if (screen === 'Articles') {
      setTimeout(() => navigation.navigate('Articles'), 300);
    }
    if (screen === 'Notifications') {
      setTimeout(() => navigation.navigate('Notifications'), 300);
    }
    if (screen === 'Discoveries') {
      setTimeout(() => navigation.navigate('Discoveries'), 300);
    }
    if (screen === 'History') {
      setTimeout(() => navigation.navigate('History'), 300);
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

    let result: any;
    if (isOnlineMode) {
      result = await IdentificationController.identifyOnline(image);
    } else {
      result = await IdentificationController.identifyOffline(image.uri);
    }

    if (result.error) {
      setError(result.error);
    } else {
      setResultData(result);
      
      // Auto-save to history if user is logged in
      if (user && token) {
        try {
          const saveRes = await IdentificationController.savePrediction(
            image, 
            result, 
            user.uid || user._id, 
            token
          );
          console.log('Prediction synced to history:', saveRes.success);
        } catch (saveErr) {
          console.error('Failed to sync prediction:', saveErr);
        }
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
        onProfilePress={() => {
          if (user) {
            navigation.navigate('Profile');
          } else {
            navigation.navigate('Auth');
          }
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}>

        {/* Action Centric Main Screen (When no image is selected) */}
        {!image ? (
          <Animatable.View animation="fadeIn" duration={800} style={styles.actionContainer}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Identify Wildlife</Text>
              <Text style={styles.welcomeSubtitle}>What do you see right now?</Text>
            </View>

            {/* Subtle Online/Offline Switch */}
            <View style={styles.compactModeToggle}>
              <Text style={[styles.compactModeText, !isOnlineMode && styles.compactModeTextActive]}>Offline</Text>
              <Switch
                trackColor={{false: COLORS.switchTrack, true: COLORS.switchTrackActive}}
                thumbColor={isOnlineMode ? COLORS.primary : COLORS.switchThumb}
                onValueChange={handleModeChange}
                value={isOnlineMode}
                style={styles.compactSwitch}
              />
              <Text style={[styles.compactModeText, isOnlineMode && styles.compactModeTextActive]}>Online</Text>
            </View>

            {/* Massive Camera Button */}
            <TouchableOpacity 
               style={styles.massiveCameraButton}
               onPress={handleImageCapture}
               activeOpacity={0.9}
            >
               <LinearGradient
                 colors={['#16A34A', '#15803D']}
                 style={styles.massiveCameraGradient}
                 start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
                 <Icon name="camera" size={64} color={COLORS.white} />
                 <Text style={styles.massiveCameraText}>Take Photo</Text>
               </LinearGradient>
            </TouchableOpacity>

            {/* Secondary Gallery Button */}
            <TouchableOpacity 
               style={styles.galleryButton}
               onPress={handleGallerySelection}
               activeOpacity={0.7}
            >
               <Icon name="images" size={24} color={COLORS.primary} style={{marginRight: 10}} />
               <Text style={styles.galleryButtonText}>Upload from Gallery</Text>
            </TouchableOpacity>

            {/* Quick Access Cards */}
            <View style={styles.quickAccessRow}>
              <TouchableOpacity style={styles.quickCard} onPress={() => setEmergencyVisible(true)}>
                <View style={styles.quickCardIconBgError}>
                  <Icon name="warning" size={24} color={COLORS.error} />
                </View>
                <Text style={styles.quickCardText}>Emergency</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickCard} onPress={() => setDirectoryVisible(true)}>
                <View style={styles.quickCardIconBgPrimary}>
                  <Icon name="book" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.quickCardText}>Directory</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickAccessRow}>
              <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('Community')}>
                <View style={[styles.quickCardIconBgPrimary, { backgroundColor: '#DBEAFE' }]}>
                  <Icon name="people" size={24} color="#2563EB" />
                </View>
                <Text style={styles.quickCardText}>Community</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('ChatList')}>
                <View style={[styles.quickCardIconBgPrimary, { backgroundColor: '#FEF3C7' }]}>
                  <Icon name="chatbubbles" size={24} color="#D97706" />
                </View>
                <Text style={styles.quickCardText}>Support</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        ) : (
          <Animatable.View animation="fadeIn" duration={600} style={styles.imageReviewContainer}>
            <View style={styles.imageReviewHeader}>
               <Text style={styles.sectionTitle}>Review Image</Text>
               <TouchableOpacity onPress={() => setImage(null)} style={styles.cancelButton}>
                 <Icon name="close" size={24} color={COLORS.darkText} />
               </TouchableOpacity>
            </View>

            <View style={styles.imageContainer}>
              <View style={styles.imageWrapper}>
                <Image source={{uri: image.uri}} style={styles.image} />
                <View style={styles.imageOverlay}>
                  <TouchableOpacity
                    style={styles.changeImageButton}
                    onPress={handleGallerySelection}>
                    <Icon name="refresh" size={20} color={COLORS.darkText} />
                    <Text style={styles.changeImageText}>Change Image</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Animatable.View animation="fadeInUp" duration={600} delay={100} style={styles.identifySection}>
              <TouchableOpacity
                onPress={identifyAnimal}
                disabled={loading}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={loading ? ['#86EFAC', '#4ADE80'] : ['#16A34A', '#15803D']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={[styles.identifyButton, loading && styles.identifyButtonDisabled]}>
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={COLORS.white} />
                      <Text style={styles.loadingText}>Analyzing...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Icon name="search" size={24} color={COLORS.white} />
                      <Text style={styles.identifyButtonText}>Identify Animal</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
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

              {resultData.Family && (
                <View style={styles.infoChip}>
                  <Icon name="leaf" size={16} color={COLORS.primary} />
                  <Text style={styles.infoChipText} numberOfLines={1}>
                    {resultData.Family}
                  </Text>
                </View>
              )}

              {resultData.EndemicStatus && (
                <View style={styles.infoChip}>
                  <Icon name="location" size={16} color={COLORS.primary} />
                  <Text style={styles.infoChipText} numberOfLines={1}>
                    {resultData.EndemicStatus}
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

            {resultData.Treatment && (
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <Icon name="medkit" size={20} color={COLORS.error} />
                  <Text style={styles.detailTitle}>Treatment</Text>
                </View>
                <Text style={styles.detailContent}>{resultData.Treatment}</Text>
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
  primary: '#15803D', // Deep Forest Green (easier on the eyes)
  secondary: '#166534', 
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9', // Slate 100
  white: '#FFFFFF',
  darkText: '#0F172A', // Slate 900
  mediumText: '#475569', // Slate 600
  lightText: '#94A3B8', // Slate 400
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  accent: '#8B5CF6',
  border: '#E2E8F0', // Slate 200
  borderLight: '#F1F5F9',
  switchTrack: '#E2E8F0',
  switchTrackActive: '#A7F3D0', // Emerald 200
  switchThumb: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.4)',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },

  // Action Container
  actionContainer: {
    flex: 1,
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.darkText,
    letterSpacing: 0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.mediumText,
    marginTop: 4,
  },
  compactModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceVariant,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 30,
  },
  compactModeText: {
    fontSize: 14,
    color: COLORS.lightText,
    fontWeight: '600',
  },
  compactModeTextActive: {
    color: COLORS.primary,
  },
  compactSwitch: {
    marginHorizontal: 10,
    transform: [{scaleX: 0.9}, {scaleY: 0.9}],
  },
  massiveCameraButton: {
    width: 240,
    height: 240,
    borderRadius: 120,
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  massiveCameraGradient: {
    flex: 1,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  massiveCameraText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 12,
    letterSpacing: 0.5,
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  galleryButtonText: {
    color: COLORS.darkText,
    fontSize: 16,
    fontWeight: '700',
  },
  quickAccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  quickCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  quickCardIconBgError: {
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  quickCardIconBgPrimary: {
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  quickCardText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkText,
  },

  // Image Review Section
  imageReviewContainer: {
    width: '100%',
  },
  imageReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.darkText,
  },
  cancelButton: {
    padding: 6,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 16,
  },
  imageContainer: {
    width: '100%',
    height: 320,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: 24,
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
    bottom: 16,
    right: 16,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  changeImageText: {
    color: COLORS.darkText,
    marginLeft: 8,
    fontWeight: '700',
  },

  // Identify Section
  identifySection: {
    marginBottom: 30,
  },
  identifyButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  identifyButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  identifyButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.white,
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '700',
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
