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
      <View style={styles.headerContainer}>
        {/* Menu Button */}
        <TouchableOpacity 
          onPress={onMenuPress} 
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Icon name="menu-outline" size={24} color="#333333" />
        </TouchableOpacity>
        
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        
        {/* Emergency Button */}
        <TouchableOpacity 
          onPress={onEmergencyPress} 
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Icon name="warning-outline" size={24} color="#D32F2F" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: Platform.OS === 'android' ? 60 : 50,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: 0.2,
  },
});

export default Header;