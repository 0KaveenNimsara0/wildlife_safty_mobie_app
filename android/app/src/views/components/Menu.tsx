// components/Menu.tsx
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

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
                <Icon name="close-outline" size={32} color="#333" />
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
      <Icon name={icon} size={24} color="#2E7D32" style={styles.menuItemIcon} />
      <Text style={styles.menuItemText}>{text}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    width: '80%',
    height: '100%',
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  safeArea: {
    flex: 1,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
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
    fontSize: 18,
    color: '#34495e',
    fontWeight: '500',
  },
  footer: {
    marginTop: 'auto',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
  }
});

export default Menu;
