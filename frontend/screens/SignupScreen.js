import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import AppBar from '../components/AppBar';
import { useTranslation } from 'react-i18next';

const SignupScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { signup } = useAuth();

  // Handle input change
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error when user types
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      });
    }
  };

  // Validation function
  const validateForm = () => {
    let tempErrors = {};
    
    // Full Name validation
    if (!formData.fullName) {
      tempErrors.fullName = t('auth.nameRequired');
    } else if (formData.fullName.length < 2 || formData.fullName.length > 50) {
      tempErrors.fullName = t('auth.nameLength');
    }
    
    // Email validation
    if (!formData.email) {
      tempErrors.email = t('auth.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = t('auth.invalidEmail');
    }
    
    // Phone number validation
    if (!formData.phoneNumber) {
      tempErrors.phoneNumber = t('auth.phoneRequired');
    } else if (!/^\d{10,15}$/.test(formData.phoneNumber.replace(/[^0-9]/g, ''))) {
      tempErrors.phoneNumber = t('auth.invalidPhone');
    }
    
    // Password validation
    if (!formData.password) {
      tempErrors.password = t('auth.passwordRequired');
    } else if (formData.password.length < 6) {
      tempErrors.password = t('auth.passwordLength');
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = t('auth.passwordMismatch');
    }
    
    setErrors(tempErrors);
    
    return Object.keys(tempErrors).length === 0;
  };

  // Handle signup
  const handleSignup = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = formData;
      
      const result = await signup(userData);
      
      if (!result.success) {
        Alert.alert(t('auth.signupError'), result.error);
      }
      
    } catch (error) {
      Alert.alert(t('common.error'), t('auth.unexpectedError'));
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <AppBar 
        title={t('auth.signUp')} 
        showBackButton={true}
        onBackPress={() => navigation.navigate('Login')}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>{t('auth.createAccount')}</Text>
          <Text style={styles.subtitle}>{t('auth.getStarted')}</Text>

          {/* Full Name Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('auth.fullName')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.enterFullName')}
              value={formData.fullName}
              onChangeText={(value) => handleChange('fullName', value)}
            />
            {errors.fullName ? (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            ) : null}
          </View>

          {/* Email Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('auth.email')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.enterEmail')}
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          {/* Phone Number Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('auth.phoneNumber')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.enterPhone')}
              value={formData.phoneNumber}
              onChangeText={(value) => handleChange('phoneNumber', value)}
              keyboardType="phone-pad"
            />
            {errors.phoneNumber ? (
              <Text style={styles.errorText}>{errors.phoneNumber}</Text>
            ) : null}
          </View>

          {/* Password Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('auth.password')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.createPassword')}
              secureTextEntry
              value={formData.password}
              onChangeText={(value) => handleChange('password', value)}
            />
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          {/* Confirm Password Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('auth.confirmPassword')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.confirmYourPassword')}
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(value) => handleChange('confirmPassword', value)}
            />
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.signupButtonText}>{t('auth.signUp')}</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>{t('auth.alreadyHaveAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>{t('auth.login')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
  signupButton: {
    backgroundColor: '#4B7BEC',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  loginText: {
    color: '#666',
    fontSize: 16,
  },
  loginLink: {
    color: '#4B7BEC',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SignupScreen;