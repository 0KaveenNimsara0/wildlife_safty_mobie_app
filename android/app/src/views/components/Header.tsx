import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config/api';

const COLORS = {
  primary: '#15803D', // Forest Green
  background: '#F8FAFC', // Slate 50
  darkText: '#0F172A', // Slate 900
  white: '#FFFFFF',
};

interface HeaderProps {
  title: string;
  onMenuPress: () => void;
  onProfilePress: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuPress, onProfilePress }) => {
  const { user } = useContext(AuthContext);

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
        
        {/* Right Side: Login icon OR Profile Avatar */}
        <TouchableOpacity 
          onPress={onProfilePress} 
          style={user ? styles.avatarButton : styles.iconButton}
          activeOpacity={0.7}
        >
          {user ? (
            user.photoURL ? (
              <Image 
                source={{ uri: user.photoURL.startsWith('http') ? user.photoURL : `${API_URL.replace('/api', '')}${user.photoURL.startsWith('/') ? '' : '/'}${user.photoURL}` }} 
                style={styles.avatarImage} 
              />
            ) : (
              <Text style={styles.avatarText}>
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </Text>
            )
          ) : (
            <Icon name="person-circle-outline" size={30} color={COLORS.primary} />
          )}
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
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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