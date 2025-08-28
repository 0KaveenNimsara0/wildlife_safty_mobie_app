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
const SnakeDetailScreen: React.FC<{snake: Snake; onGoBack: () => void}> = ({
  snake,
  onGoBack,
}) => {
  const folderName = getSnakeImageFolderName(snake['Scientific Name & Authority']);
  // This path assumes your assets are linked correctly.
  const imagePath = `../assets/snakes details/${folderName}/000001.jpg`;

  return (
    <SafeAreaView style={styles.detailContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
          <Icon name="arrow-back-outline" size={28} color="#333" />
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
          source={{ uri: imagePath }}
          style={styles.detailImage}
        />
        <View style={styles.detailContent}>
          <Text style={styles.detailTitle}>{snake['Common English Name(s)']}</Text>
          <Text style={styles.detailScientificName}>{snake['Scientific Name & Authority']}</Text>

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
        <Icon name={icon} size={24} color="#2E7D32" style={styles.detailIcon} />
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
}> = ({
  snakes,
  onSelectSnake,
  onClose,
}) => {
  const renderItem = ({ item }: { item: Snake }) => {
    if (item['Endemic Status'].toLowerCase().includes('not found in sri lanka') || item['A detailed description'].toLowerCase().includes('not recorded from sri lanka')) {
      return null;
    }
    const folderName = getSnakeImageFolderName(item['Scientific Name & Authority']);
    const imagePath = `../assets/snakes_details/${folderName}/000001.jpg`;

    return (
      <Animatable.View animation="fadeInUp" duration={600}>
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => onSelectSnake(item)}>
          <Image source={{ uri: imagePath }} style={styles.listImage} />
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
          <Icon name="close-outline" size={32} color="#333" />
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

  if (selectedSnake) {
    return (
      <SnakeDetailScreen
        snake={selectedSnake}
        onGoBack={() => setSelectedSnake(null)}
      />
    );
  }

  return (
    <SnakeListScreen
      snakes={snakeData as Snake[]}
      onSelectSnake={snake => setSelectedSnake(snake)}
      onClose={onClose}
    />
  );
};

// --- Styles ---
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: '#F0F4F0',
  },
  directoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B2021',
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  listImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#ecf0f1',
  },
  listItemTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B2021',
  },
  listItemSubtitle: {
    fontSize: 12,
    color: '#5F7A61',
    fontStyle: 'italic',
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  detailImage: {
    width: width,
    height: width * 0.75,
    backgroundColor: '#ecf0f1',
  },
  detailContent: {
    padding: 20,
  },
  detailTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1B2021',
    marginBottom: 5,
  },
  detailScientificName: {
    fontSize: 16,
    color: '#5F7A61',
    fontStyle: 'italic',
    marginBottom: 25,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F9FBF9',
    padding: 15,
    borderRadius: 12,
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
    fontWeight: 'bold',
    color: '#1B2021',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
});

export default SnakeDirectoryScreen;
