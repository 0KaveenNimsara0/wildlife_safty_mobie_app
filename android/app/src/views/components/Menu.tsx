// components/Menu.tsx
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

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
};

interface MenuProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: 'Home' | 'About' | 'Settings' | 'Directory' | 'Emergency') => void;
}

const Menu: React.FC<MenuProps> = ({ visible, onClose, onNavigate }) => {
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
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity style={styles.closeIconContainer} onPress={onClose}>
                <Icon name="close-outline" size={32} color={COLORS.darkText} />
              </TouchableOpacity>
            </View>

            <View style={styles.menuItemsGroup}>
              <MenuItem icon="home-outline" text="Home" onPress={() => onNavigate('Home')} />
              <MenuItem icon="list-outline" text="Snake Details" onPress={() => onNavigate('Directory')} />
              <MenuItem icon="medkit-outline" text="Emergency Info" onPress={() => onNavigate('Emergency')} />
              <MenuItem icon="information-circle-outline" text="About Us" onPress={() => onNavigate('About')} />
              <MenuItem icon="settings-outline" text="Settings" onPress={() => onNavigate('Settings')} />
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
