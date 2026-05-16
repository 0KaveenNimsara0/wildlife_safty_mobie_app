// screens/SnakeDirectoryScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';
// Corrected the import path assuming snake_data.json is in the root
import snakeData from '../assets/snakes details/sri_lanka_snakes_data.json';
import { UnsplashService } from '../../services/UnsplashService';

// --- Enhanced Color Palette ---
const COLORS = {
  primary: '#15803D', // Forest Green
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9', // Slate 100
  white: '#FFFFFF',
  darkText: '#0F172A', // Slate 900
  mediumText: '#475569', // Slate 600
  lightText: '#64748B', // Slate 500
  border: '#E2E8F0', // Slate 200
  overlay: 'rgba(15, 23, 42, 0.4)',
};

// --- TypeScript Interface for our Snake Data ---
interface Snake {
  'Family': string;
  'Scientific Name & Authority': string;
  'Common English Name(s)': string;
  'Local Name(s) (Sinhala/Tamil)': string;
  'Endemic Status': string;
  'Venom & Medical Significance': string;
  'Global IUCN Red List Status': string;
  'A detailed description': string;
  'how to find(recognize)': string;
  'foods they eat': string;
  'Contagion (Reproduction)': string;
  'Areas spread across Sri Lanka': string;
}

// --- Helper Function to get Image Path ---
const getSnakeImageFolderName = (scientificName: string): string => {
  return scientificName
    .split('(')[0]
    .trim()
    .replace(/\s+/g, '_');
};

// --- Detail Screen Component ---
const SnakeDetailScreen: React.FC<{snake: Snake; onGoBack: () => void; images: {[key: string]: string | null}}> = ({
  snake,
  onGoBack,
  images,
}) => {
  const imageUrl = images[snake['Scientific Name & Authority']];

  return (
    <SafeAreaView style={styles.detailContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
          <Icon name="arrow-back-outline" size={28} color={COLORS.darkText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {snake['Common English Name(s)']}
        </Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Animatable.Image
          animation="fadeIn"
          duration={800}
          source={imageUrl ? {uri: imageUrl} : {uri: 'https://via.placeholder.com/400x300?text=No+Image'}}
          style={styles.detailImage}
        />
        <View style={styles.detailContent}>
          <Text style={styles.detailTitle}>{snake['Common English Name(s)']}</Text>
          <Text style={styles.detailScientificName}>{snake['Scientific Name & Authority']}</Text>

          <DetailRow label='Local Names' value={snake['Local Name(s) (Sinhala/Tamil)']} icon="information-circle-outline"/>
          <DetailRow label="Venom" value={snake['Venom & Medical Significance']} icon="warning-outline" />
          <DetailRow label="Description" value={snake['A detailed description']} icon="information-circle-outline"/>
          <DetailRow label="How to Recognize" value={snake['how to find(recognize)']} icon="eye-outline" />
          <DetailRow label="Diet" value={snake['foods they eat']} icon="restaurant-outline" />
          <DetailRow label="Reproduction" value={snake['Contagion (Reproduction)']} icon="leaf-outline"/>
          <DetailRow label="Distribution" value={snake['Areas spread across Sri Lanka']} icon="map-outline"/>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable component for displaying a row of details
const DetailRow: React.FC<{label: string, value: string, icon: string}> = ({ label, value, icon }) => (
    <View style={styles.detailRow}>
        <Icon name={icon} size={24} color={COLORS.primary} style={styles.detailIcon} />
        <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    </View>
);

// --- List Screen Component ---
const SnakeListScreen: React.FC<{
  snakes: Snake[];
  onSelectSnake: (snake: Snake) => void;
  onClose: () => void;
  images: {[key: string]: string | null};
}> = ({
  snakes,
  onSelectSnake,
  onClose,
  images,
}) => {
  const renderItem = ({ item }: { item: Snake }) => {
    if (item['Endemic Status'].toLowerCase().includes('not found in sri lanka') || item['A detailed description'].toLowerCase().includes('not recorded from sri lanka')) {
      return null;
    }
    const imageUrl = images[item['Scientific Name & Authority']];

    return (
      <Animatable.View animation="fadeInUp" duration={600}>
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => onSelectSnake(item)}>
          <Image source={imageUrl ? {uri: imageUrl} : {uri: 'https://via.placeholder.com/60x60?text=No+Image'}} style={styles.listImage} />
          <View style={styles.listItemTextContainer}>
            <Text style={styles.listItemTitle}>{item['Common English Name(s)']}</Text>
            <Text style={styles.listItemSubtitle}>{item['Scientific Name & Authority']}</Text>
          </View>
          <Icon name="chevron-forward-outline" size={22} color="#bdc3c7" />
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  return (
    <SafeAreaView style={styles.listContainer}>
      <View style={styles.header}>
        <Text style={styles.directoryTitle}>Snake Directory</Text>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Icon name="close-outline" size={32} color={COLORS.darkText} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={snakes}
        renderItem={renderItem}
        keyExtractor={item => item['Scientific Name & Authority']}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}
      />
    </SafeAreaView>
  );
};

// --- Main Directory Screen (Parent Component) ---
const SnakeDirectoryScreen: React.FC<{onClose: () => void}> = ({ onClose }) => {
  const [selectedSnake, setSelectedSnake] = React.useState<Snake | null>(null);
  const [images, setImages] = React.useState<{[key: string]: string | null}>({});

  React.useEffect(() => {
    const fetchImages = async () => {
      const imagePromises = (snakeData as Snake[]).map(async (snake) => {
        const query = snake['Common English Name(s)'] || snake['Scientific Name & Authority'].split('(')[0].trim();
        const imageUrl = await UnsplashService.searchImages(query);
        return { key: snake['Scientific Name & Authority'], url: imageUrl };
      });
      const results = await Promise.all(imagePromises);
      const newImages: {[key: string]: string | null} = {};
      results.forEach(({key, url}) => newImages[key] = url);
      setImages(newImages);
    };
    fetchImages();
  }, []);

  if (selectedSnake) {
    return (
      <SnakeDetailScreen
        snake={selectedSnake}
        onGoBack={() => setSelectedSnake(null)}
        images={images}
      />
    );
  }

  return (
    <SnakeListScreen
      snakes={snakeData as Snake[]}
      onSelectSnake={snake => setSelectedSnake(snake)}
      onClose={onClose}
      images={images}
    />
  );
};

// --- Styles ---
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  directoryTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.darkText,
    letterSpacing: 0.5,
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  listImage: {
    width: 65,
    height: 65,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceVariant,
  },
  listItemTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 13,
    color: COLORS.lightText,
    fontStyle: 'italic',
  },
  detailContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkText,
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  detailImage: {
    width: width,
    height: width * 0.75,
    backgroundColor: COLORS.surfaceVariant,
  },
  detailContent: {
    padding: 20,
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.darkText,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  detailScientificName: {
    fontSize: 16,
    color: COLORS.primary,
    fontStyle: 'italic',
    marginBottom: 30,
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailIcon: {
      marginRight: 15,
      marginTop: 2,
  },
  detailTextContainer: {
      flex: 1,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkText,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 15,
    color: COLORS.mediumText,
    lineHeight: 24,
  },
});

export default SnakeDirectoryScreen;
