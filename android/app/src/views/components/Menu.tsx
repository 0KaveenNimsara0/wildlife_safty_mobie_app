// components/Menu.tsx
import React, { useContext } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config/api';

// --- Enhanced Color Palette ---
const COLORS = {
  primary: '#15803D', // Forest Green
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  white: '#FFFFFF',
  darkText: '#0F172A', // Slate 900
  mediumText: '#475569', // Slate 600
  lightText: '#64748B', // Slate 500
  border: '#E2E8F0', // Slate 200
  overlay: 'rgba(15, 23, 42, 0.4)',
  error: '#EF4444',
};

interface MenuProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: 'Home' | 'About' | 'Settings' | 'Directory' | 'Emergency' | 'Auth' | 'Profile' | 'Community' | 'ChatList' | 'Articles' | 'Notifications' | 'Discoveries' | 'History') => void;
}

const Menu: React.FC<MenuProps> = ({ visible, onClose, onNavigate }) => {
    const { user, role } = useContext(AuthContext);
  
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        {/* Use an outer TouchableOpacity to close the menu when tapping the overlay */}
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
          {/* Add a nested TouchableOpacity that does nothing to prevent taps inside the menu from closing it */}
          <TouchableOpacity style={styles.menuContainer} activeOpacity={1}>
            <SafeAreaView style={styles.safeArea}>
  
              {/* Profile / Auth Section */}
              {user ? (
                <TouchableOpacity style={styles.profileSection} onPress={() => onNavigate('Profile')}>
                  <View style={styles.avatarSmall}>
                    {user.photoURL ? (
                      <Image 
                        source={{ uri: user.photoURL.startsWith('http') ? user.photoURL : `${API_URL.replace('/api', '')}${user.photoURL.startsWith('/') ? '' : '/'}${user.photoURL}` }} 
                        style={styles.avatarSmallImage} 
                      />
                    ) : (
                      <Text style={styles.avatarSmallText}>
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                      </Text>
                    )}
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.profileName} numberOfLines={1}>{user.displayName || user.name}</Text>
                    <Text style={styles.profileEmail} numberOfLines={1}>{user.email}</Text>
                  </View>
                  <Icon name="chevron-forward" size={20} color={COLORS.lightText} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.loginSection} onPress={() => onNavigate('Auth')}>
                  <View style={styles.loginIconBg}>
                    <Icon name="log-in-outline" size={24} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.loginTitle}>Login / Register</Text>
                    <Text style={styles.loginSubtitle}>Access all features</Text>
                  </View>
                  <Icon name="chevron-forward" size={20} color={COLORS.lightText} style={{marginLeft: 'auto'}} />
                </TouchableOpacity>
              )}
  
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Menu</Text>
                <TouchableOpacity style={styles.closeIconContainer} onPress={onClose}>
                  <Icon name="close-outline" size={32} color={COLORS.darkText} />
                </TouchableOpacity>
              </View>
  
              <View style={styles.menuItemsGroup}>
                <MenuItem icon="home-outline" text="Home" onPress={() => onNavigate('Home')} />
                <MenuItem icon="people-outline" text="Community Feed" onPress={() => onNavigate('Community')} />
                <MenuItem icon="chatbubbles-outline" text="Medical Support" onPress={() => onNavigate('ChatList')} />
                <MenuItem icon="book-outline" text="Knowledge Center" onPress={() => onNavigate('Articles')} />
                <MenuItem icon="notifications-outline" text="Notifications" onPress={() => onNavigate('Notifications')} />
                
                {role === 'medical-officer' ? (
                  <MenuItem icon="eye-outline" text="Check Discoveries" onPress={() => onNavigate('Discoveries' as any)} />
                ) : (
                  <MenuItem icon="time-outline" text="My History" onPress={() => onNavigate('History')} />
                )}

                <MenuItem icon="list-outline" text="Snake Details" onPress={() => onNavigate('Directory')} />
                <MenuItem icon="medkit-outline" text="Emergency Info" onPress={() => onNavigate('Emergency')} />
                <MenuItem icon="information-circle-outline" text="About Us" onPress={() => onNavigate('About')} />
              </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Wildlife Safety v1.0</Text>
            </View>
          </SafeAreaView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// A reusable MenuItem component to keep the code clean
const MenuItem: React.FC<{icon: string, text: string, onPress: () => void}> = ({ icon, text, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      {/* --- Updated Icon Color --- */}
      <Icon name={icon} size={24} color={COLORS.primary} style={styles.menuItemIcon} />
      <Text style={styles.menuItemText}>{text}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  menuContainer: {
    width: '80%',
    height: '100%',
    backgroundColor: COLORS.background,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  safeArea: {
    flex: 1,
  },
  // Profile/Auth Section at top of menu
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#ECFDF5',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarSmallText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  avatarSmallImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  profileEmail: {
    fontSize: 13,
    color: COLORS.mediumText,
  },
  loginSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  loginIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  loginTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  loginSubtitle: {
    fontSize: 13,
    color: COLORS.mediumText,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.darkText,
    letterSpacing: 0.5,
  },
  closeIconContainer: {
    padding: 5,
  },
  menuItemsGroup: {
    paddingTop: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 25,
  },
  menuItemIcon: {
    marginRight: 20,
  },
  menuItemText: {
    fontSize: 17,
    color: COLORS.darkText,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.lightText,
    fontWeight: '500',
  }
});

export default Menu;
