// components/Header.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface HeaderProps {
  title: string;
  onMenuPress: () => void;
  onEmergencyPress: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuPress, onEmergencyPress }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBackground}>
        <View style={styles.headerContainer}>
          {/* Menu Button with nature-inspired styling */}
          <TouchableOpacity 
            onPress={onMenuPress} 
            style={styles.menuButton}
            activeOpacity={0.7}
          >
            <View style={styles.buttonBackground}>
              <Icon name="menu-outline" size={28} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          
          {/* Title with wildlife styling */}
          <View style={styles.titleContainer}>
            <View style={styles.titleWrapper}>
              <Icon name="paw-outline" size={20} color="#A5D6A7" style={styles.titleIcon} />
              <Text style={styles.headerTitle}>{title}</Text>
              <Icon name="paw-outline" size={20} color="#A5D6A7" style={styles.titleIcon} />
            </View>
            <View style={styles.titleUnderline} />
          </View>
          
          {/* Emergency Button with enhanced styling */}
          <TouchableOpacity 
            onPress={onEmergencyPress} 
            style={styles.emergencyButton}
            activeOpacity={0.8}
          >
            <View style={styles.emergencyBackground}>
              <Icon name="medkit-outline" size={26} color="#FFFFFF" />
            </View>
            <View style={styles.emergencyIndicator} />
          </TouchableOpacity>
        </View>
        
        {/* Decorative nature elements using pure CSS */}
        <View style={styles.decorativeLeaf1} />
        <View style={styles.decorativeLeaf2} />
        <View style={styles.decorativeLeaf3} />
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#2E7D32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
  },
  headerBackground: {
    backgroundColor: '#388E3C',
    position: 'relative',
    overflow: 'hidden',
    // Create a subtle pattern effect
    borderBottomWidth: 3,
    borderBottomColor: '#2E7D32',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: Platform.OS === 'android' ? 70 : 60,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  menuButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleIcon: {
    marginHorizontal: 8,
    opacity: 0.8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  titleUnderline: {
    width: 50,
    height: 3,
    backgroundColor: '#81C784',
    marginTop: 6,
    borderRadius: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  emergencyButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emergencyBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  emergencyIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF5722',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  // Decorative nature elements using pure CSS shapes
  decorativeLeaf1: {
    position: 'absolute',
    top: 8,
    left: 70,
    width: 16,
    height: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    opacity: 0.4,
    transform: [{ rotate: '45deg' }],
  },
  decorativeLeaf2: {
    position: 'absolute',
    top: 12,
    right: 80,
    width: 12,
    height: 20,
    backgroundColor: '#66BB6A',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    opacity: 0.3,
    transform: [{ rotate: '-25deg' }],
  },
  decorativeLeaf3: {
    position: 'absolute',
    bottom: 5,
    left: '42%',
    width: 14,
    height: 8,
    backgroundColor: '#81C784',
    borderRadius: 7,
    opacity: 0.3,
    transform: [{ rotate: '20deg' }],
  },
  decorativeCircle1: {
    position: 'absolute',
    top: 20,
    left: 120,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(165, 214, 167, 0.4)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: 15,
    right: 110,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(129, 199, 132, 0.3)',
  },
});

export default Header;