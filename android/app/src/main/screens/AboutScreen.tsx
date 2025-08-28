// screens/AboutScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';

// --- App Colors ---
const COLORS = {
  primary: '#3498db',
  background: '#ecf0f1',
  white: '#ffffff',
  darkText: '#2c3e50',
  lightText: '#7f8c8d',
};

interface AboutScreenProps {
  onClose: () => void;
}

const AboutScreen: React.FC<AboutScreenProps> = ({ onClose }) => {
  const handleEmailPress = () => {
    Linking.openURL('mailto:contact@wildlifesafetysrilanka.org?subject=App Feedback');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>About Wildlife Safety</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close-outline" size={32} color={COLORS.darkText} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Animatable.View animation="fadeInUp" duration={800} delay={200}>
          <InfoCard
            icon="shield-checkmark-outline"
            title="Our Mission"
            text="Our primary goal is to promote harmony between humans and wildlife in Sri Lanka. By providing a fast and accurate identification tool, we aim to reduce negative encounters, protect our precious biodiversity, and provide crucial safety information to the public."
          />
        </Animatable.View>

        <Animatable.View animation="fadeInUp" duration={800} delay={400}>
          <InfoCard
            icon="people-outline"
            title="Who We Are"
            text="We are a team of passionate developers, wildlife enthusiasts, and conservationists based in Sri Lanka. This application is a culmination of our dedication to leveraging technology for the betterment of our local communities and ecosystems."
          />
        </Animatable.View>

        <Animatable.View animation="fadeInUp" duration={800} delay={600}>
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Icon name="mail-outline" size={40} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Contact Us</Text>
              <Text style={styles.cardText}>
                Have questions, feedback, or suggestions? We'd love to hear from you.
              </Text>
              <TouchableOpacity onPress={handleEmailPress} style={styles.contactButton}>
                <Text style={styles.contactButtonText}>Send us an Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable InfoCard component
const InfoCard: React.FC<{icon: string, title: string, text: string}> = ({ icon, title, text }) => (
  <View style={styles.card}>
    <View style={styles.cardContent}>
      <Icon name={icon} size={40} color={COLORS.primary} />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardText}>{text}</Text>
    </View>
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
    borderBottomColor: '#dfe6e9',
  },
  headerTitle: {
    color: COLORS.darkText,
    fontWeight: '700',
    fontSize: 20,
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    padding: 20,
  },
  card: {
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardContent: {
    alignItems: 'center',
    padding: 25,
  },
  cardTitle: {
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginVertical: 15,
    fontSize: 22,
  },
  cardText: {
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 16,
    color: COLORS.lightText,
  },
  contactButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  contactButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AboutScreen;
