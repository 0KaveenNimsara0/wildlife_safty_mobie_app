import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import AuthService, { Role } from '../../services/AuthService';

const COLORS = {
  primary: '#15803D',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  darkText: '#0F172A',
  mediumText: '#475569',
  lightText: '#94A3B8',
  error: '#EF4444',
  border: '#E2E8F0',
  white: '#FFFFFF',
};

const AuthScreen = () => {
  const navigation = useNavigation<any>();
  const { login } = useContext(AuthContext);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [role, setRole] = useState<Role>('user');
  
  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // Medical Officer extra fields
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [hospital, setHospital] = useState('');
  const [securityKey, setSecurityKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // OTP State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const isMedicalOfficer = role === 'medical-officer';

  const handleToggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrorMsg('');
    setEmail('');
    setPassword('');
    setDisplayName('');
    setSpecialization('');
    setLicenseNumber('');
    setPhoneNumber('');
    setHospital('');
    setSecurityKey('');
  };

  const validateFields = (): boolean => {
    if (!email || !password) {
      setErrorMsg('Email and Password are required.');
      return false;
    }
    if (!isLoginMode) {
      if (!displayName) {
        setErrorMsg('Full Name is required.');
        return false;
      }
      if (isMedicalOfficer) {
        if (!specialization || !licenseNumber || !phoneNumber || !hospital || !securityKey) {
          setErrorMsg('All Medical Officer fields are required.');
          return false;
        }
      }
    }
    return true;
  };

  const handleAuthAction = async () => {
    if (!validateFields()) return;
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLoginMode) {
        const res = await AuthService.login(email, password, role);
        if (res.requiresOtp) {
          setShowOtpModal(true);
          setLoading(false);
        } else if (res.token && res.user) {
          await login(res.user, res.token, role);
          navigation.goBack();
        }
      } else {
        // Register mode: must send OTP first
        await AuthService.sendRegistrationOtp(email);
        setShowOtpModal(true);
        setLoading(false);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('Error', 'Please enter a valid OTP code.');
      return;
    }
    setOtpLoading(true);
    setErrorMsg('');

    try {
      if (isLoginMode) {
        const res = await AuthService.login(email, password, role, otp);
        if (res.token) {
          const userData = res.user || (res as any).medicalOfficer;
          if (userData) {
            setShowOtpModal(false);
            await login(userData, res.token, role);
            navigation.goBack();
          }
        }
      } else {
        const extraFields = isMedicalOfficer
          ? { specialization, licenseNumber, phoneNumber, hospital, securityKey }
          : undefined;
        const res = await AuthService.register(email, password, displayName, role, otp, extraFields);
        if (res.token) {
          const userData = res.user || (res as any).medicalOfficer;
          if (userData) {
            setShowOtpModal(false);
            await login(userData, res.token, role);
            navigation.goBack();
          }
        }
      }
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpLoading(true);
    try {
      if (isLoginMode) {
        // Re-run login to trigger OTP
        await AuthService.login(email, password, role);
      } else {
        await AuthService.sendRegistrationOtp(email);
      }
      Alert.alert('Success', 'A new verification code has been sent to your email.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header / Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={COLORS.darkText} />
          </TouchableOpacity>
        </View>

        <Animatable.View animation="fadeInUp" duration={800} style={styles.formContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{isLoginMode ? 'Welcome Back' : 'Create Account'}</Text>
            <Text style={styles.subtitle}>
              {isLoginMode ? 'Log in to continue to your dashboard.' : 'Sign up to access all features.'}
            </Text>
          </View>

          {/* Role Selector */}
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'user' && styles.roleButtonActive]}
              onPress={() => setRole('user')}
            >
              <Icon name="person-outline" size={16} color={role === 'user' ? COLORS.primary : COLORS.mediumText} style={{marginRight: 4}} />
              <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>User</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'medical-officer' && styles.roleButtonActive]}
              onPress={() => setRole('medical-officer')}
            >
              <Icon name="medkit-outline" size={16} color={role === 'medical-officer' ? COLORS.primary : COLORS.mediumText} style={{marginRight: 4}} />
              <Text style={[styles.roleText, role === 'medical-officer' && styles.roleTextActive]}>Medical Officer</Text>
            </TouchableOpacity>
          </View>

          {/* Common Fields */}
          {!isLoginMode && (
            <InputField icon="person-outline" placeholder="Full Name" value={displayName} onChangeText={setDisplayName} />
          )}

          <InputField icon="mail-outline" placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <InputField icon="lock-closed-outline" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

          {/* Medical Officer Extra Fields (Registration Only) */}
          {!isLoginMode && isMedicalOfficer && (
            <Animatable.View animation="fadeInDown" duration={400}>
              <View style={styles.sectionDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Medical Officer Details</Text>
                <View style={styles.dividerLine} />
              </View>

              <InputField icon="school-outline" placeholder="Specialization (e.g., Toxicology)" value={specialization} onChangeText={setSpecialization} />
              <InputField icon="card-outline" placeholder="License Number" value={licenseNumber} onChangeText={setLicenseNumber} />
              <InputField icon="call-outline" placeholder="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
              <InputField icon="business-outline" placeholder="Hospital / Institution" value={hospital} onChangeText={setHospital} />
              <InputField icon="key-outline" placeholder="Security Key" value={securityKey} onChangeText={setSecurityKey} secureTextEntry />
            </Animatable.View>
          )}

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          {/* Submit Button */}
          <TouchableOpacity 
             style={styles.submitButtonContainer}
             onPress={handleAuthAction}
             disabled={loading}
          >
             <LinearGradient
               colors={loading ? ['#86EFAC', '#4ADE80'] : ['#16A34A', '#15803D']}
               style={styles.submitGradient}
               start={{x: 0, y: 0}} end={{x: 1, y: 0}}>
               {loading ? (
                 <ActivityIndicator color={COLORS.white} />
               ) : (
                 <Text style={styles.submitText}>{isLoginMode ? 'Login' : 'Register'}</Text>
               )}
             </LinearGradient>
          </TouchableOpacity>

          {/* Toggle Mode */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={handleToggleMode}>
              <Text style={styles.toggleLink}>{isLoginMode ? 'Sign Up' : 'Log In'}</Text>
            </TouchableOpacity>
          </View>

          {/* Social Login Options */}
          <View style={styles.socialContainer}>
            <View style={styles.socialDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.socialDividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtonsRow}>
              <TouchableOpacity 
                style={styles.socialButton} 
                onPress={() => Alert.alert('Google Login', 'Google SDK integration is coming soon to mobile. Please use email/password for now.')}
              >
                <Icon name="logo-google" size={20} color="#EA4335" />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => Alert.alert('Github Login', 'Github integration is coming soon to mobile. Please use email/password for now.')}
              >
                <Icon name="logo-github" size={20} color="#333" />
                <Text style={styles.socialButtonText}>Github</Text>
              </TouchableOpacity>
            </View>
          </View>

        </Animatable.View>
      </ScrollView>

      {/* OTP Modal */}
      <Modal visible={showOtpModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowOtpModal(false)}>
              <Icon name="close" size={24} color={COLORS.darkText} />
            </TouchableOpacity>
            <Icon name="shield-checkmark" size={48} color={COLORS.primary} style={{marginBottom: 16}} />
            <Text style={styles.modalTitle}>Verification Required</Text>
            <Text style={styles.modalSubtitle}>Please enter the OTP sent to {email}</Text>
            
            <View style={[styles.inputContainer, { backgroundColor: COLORS.background, marginBottom: 24 }]}>
              <Icon name="key-outline" size={20} color={COLORS.mediumText} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                placeholderTextColor={COLORS.lightText}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                textAlign="center"
                letterSpacing={4}
                style={{ fontSize: 20, fontWeight: '800' }}
              />
            </View>

            <TouchableOpacity 
               style={styles.modalSubmitButton}
               onPress={handleVerifyOtp}
               disabled={otpLoading}
            >
               <LinearGradient
                 colors={otpLoading ? ['#86EFAC', '#4ADE80'] : ['#16A34A', '#15803D']}
                 style={styles.submitGradient}
                 start={{x: 0, y: 0}} end={{x: 1, y: 0}}>
                 {otpLoading ? (
                   <ActivityIndicator color={COLORS.white} />
                 ) : (
                   <Text style={styles.submitText}>Verify & Continue</Text>
                 )}
               </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.resendButton} 
              onPress={handleResendOtp}
              disabled={otpLoading}
            >
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
};

// Reusable Input Field Component
const InputField: React.FC<{
  icon: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: any;
  autoCapitalize?: any;
  secureTextEntry?: boolean;
}> = ({ icon, placeholder, value, onChangeText, keyboardType, autoCapitalize, secureTextEntry }) => (
  <View style={styles.inputContainer}>
    <Icon name={icon} size={20} color={COLORS.mediumText} style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={COLORS.lightText}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      secureTextEntry={secureTextEntry}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formContainer: {
    flex: 1,
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.darkText,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.mediumText,
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.border,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  roleButtonActive: {
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.mediumText,
  },
  roleTextActive: {
    color: COLORS.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 14,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.darkText,
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 13,
    color: COLORS.lightText,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  submitButtonContainer: {
    height: 56,
    borderRadius: 28,
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  submitGradient: {
    flex: 1,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  toggleText: {
    fontSize: 15,
    color: COLORS.mediumText,
  },
  toggleLink: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '700',
  },
  socialContainer: {
    marginTop: 30,
  },
  socialDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  socialDividerText: {
    fontSize: 12,
    color: COLORS.lightText,
    fontWeight: '700',
    marginHorizontal: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkText,
    marginLeft: 8,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  closeModalButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.darkText,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: COLORS.mediumText,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalSubmitButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resendButton: {
    flexDirection: 'row',
    marginTop: 20,
    padding: 10,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.mediumText,
  },
  resendLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default AuthScreen;
