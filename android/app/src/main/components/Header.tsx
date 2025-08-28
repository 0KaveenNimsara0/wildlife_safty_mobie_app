// components/Header.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Using Ionicons for a clean look

interface HeaderProps {
  title: string;
  onMenuPress: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuPress }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
          <Icon name="menu-outline" size={32} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        {/* This placeholder view ensures the title is perfectly centered */}
        <View style={styles.rightPlaceholder} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF', // A clean, modern white background
    // Subtle shadow for iOS to create depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Elevation for Android shadow
    elevation: 4,
    zIndex: 1, // Ensures shadow is visible over screen content
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Adjust height based on platform for better consistency
    height: Platform.OS === 'android' ? 60 : 50,
    paddingHorizontal: 10,
  },
  iconButton: {
    padding: 10, // Creates a larger, more accessible touch area
    borderRadius: 30, // For a circular ripple effect on press (Android)
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600', // Using '600' (semi-bold) for a more refined look
    color: '#121212', // A slightly off-black for better readability
  },
  rightPlaceholder: {
    // This should match the width of the iconButton to center the title
    // Icon size (32) + padding (10 * 2) = 52
    width: 52,
  },
});

export default Header;