// screens/EmergencyScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';

const COLORS = {
  primary: '#c0392b', // Red for emergency
  secondary: '#2E7D32', // Green from your theme
  background: '#F9F9F9',
  white: '#FFFFFF',
  darkText: '#1B2021',
  lightText: '#5F7A61',
};

const EmergencyScreen: React.FC<{navigation?: any; onClose?: () => void}> = ({navigation, onClose}) => {
  const handlePhoneCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency Info</Text>
        <TouchableOpacity onPress={() => onClose ? onClose() : navigation?.goBack()} style={styles.closeButton}>
          <Icon name="close-outline" size={32} color={COLORS.darkText} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{flex:1}} contentContainerStyle={styles.scrollView}>
        {/* Emergency Contacts Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={200}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <View style={styles.card}>
            <ContactItem
              icon="call-outline"
              title="National Emergency Hotline"
              number="119"
              onPress={() => handlePhoneCall('119')}
            />
            <ContactItem
              icon="business-outline"
              title="National Hospital (Colombo)"
              number="0112691111"
              onPress={() => handlePhoneCall('0112691111')}
            />
            <ContactItem
              icon="medkit-outline"
              title="Suwa Seriya Ambulance"
              number="1990"
              onPress={() => handlePhoneCall('1990')}
            />
          </View>
        </Animatable.View>

        {/* First Aid Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={400}>
          <Text style={styles.sectionTitle}>Snakebite First Aid</Text>
          <View style={styles.card}>
            <FirstAidStep
              number="1"
              icon="shield-checkmark-outline"
              text="Move away from the snake to a safe location."
            />
            <FirstAidStep
              number="2"
              icon="calm-outline"
              text="Stay calm and still. Panic increases blood flow and spreads venom faster."
            />
            <FirstAidStep
              number="3"
              icon="watch-outline"
              text="Remove any tight clothing, jewelry, or watches from the bitten limb."
            />
            <FirstAidStep
              number="4"
              icon="trending-down-outline"
              text="Keep the bitten limb below the level of the heart if possible."
            />
            <FirstAidStep
              number="5"
              icon="walk-outline"
              text="Do NOT cut the wound, suck out venom, or apply a tight tourniquet."
            />
            <FirstAidStep
              number="6"
              icon="bandage-outline"
              text="Apply a firm pressure bandage over the bite area, but not too tight."
            />
            <FirstAidStep
              number="7"
              icon="help-buoy-outline"
              text="Get to the nearest hospital with antivenom facilities immediately."
            />
          </View>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ContactItem: React.FC<{icon: string, title: string, number: string, onPress: () => void}> = ({ icon, title, number, onPress }) => (
  <TouchableOpacity style={styles.contactItem} onPress={onPress}>
    <Icon name={icon} size={28} color={COLORS.secondary} />
    <View style={styles.contactTextContainer}>
      <Text style={styles.contactTitle}>{title}</Text>
      <Text style={styles.contactNumber}>{number}</Text>
    </View>
    <Icon name="chevron-forward-outline" size={22} color="#bdc3c7" />
  </TouchableOpacity>
);

const FirstAidStep: React.FC<{icon: string, number: string, text: string}> = ({ icon, number, text }) => (
  <View style={styles.firstAidStep}>
    <View style={styles.stepNumberContainer}>
        <Text style={styles.stepNumber}>{number}</Text>
    </View>
    <Icon name={icon} size={28} color={COLORS.primary} style={styles.stepIcon} />
    <Text style={styles.stepText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    color: COLORS.darkText,
    fontWeight: '700',
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 15,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 10,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  contactTitle: {
    fontSize: 16,
    color: COLORS.darkText,
    fontWeight: '600',
  },
  contactNumber: {
    fontSize: 16,
    color: COLORS.secondary,
  },
  firstAidStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  stepNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumber: {
      color: COLORS.white,
      fontWeight: 'bold',
  },
  stepIcon: {
      marginRight: 15,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkText,
    lineHeight: 22,
  },
});

export default EmergencyScreen;
