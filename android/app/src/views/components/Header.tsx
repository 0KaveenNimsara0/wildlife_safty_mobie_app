import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const COLORS = {
  primary: '#15803D', // Forest Green
  error: '#DC2626', // Red 600
  background: '#F8FAFC', // Slate 50
  darkText: '#0F172A', // Slate 900
};

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
          <Icon name="menu" size={28} color={COLORS.primary} />
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
          <Icon name="warning" size={26} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    zIndex: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: Platform.OS === 'android' ? 70 : 60,
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.darkText,
    letterSpacing: 0.5,
  },
});

export default Header;