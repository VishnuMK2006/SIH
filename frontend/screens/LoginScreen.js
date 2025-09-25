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
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AppBar from '../components/AppBar';

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [mobileNumber, setMobileNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();

  // Validation function
  const validateForm = () => {
    let tempErrors = {};
    
    if (!mobileNumber) {
      tempErrors.mobileNumber = t('auth.fillAllFields');
    } else if (!/^\d{10}$/.test(mobileNumber)) {
      tempErrors.mobileNumber = t('auth.invalidMobileNumber');
    }
    
    if (!aadhaarNumber) {
      tempErrors.aadhaarNumber = t('auth.fillAllFields');
    } else if (!/^\d{12}$/.test(aadhaarNumber)) {
      tempErrors.aadhaarNumber = t('auth.invalidAadhaarNumber');
    }
    
    setErrors(tempErrors);
    
    return Object.keys(tempErrors).length === 0;
  };

  // Handle login
  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const result = await login(mobileNumber, aadhaarNumber);
      
      if (!result.success) {
        Alert.alert(t('auth.loginError'), result.error);
      }
      
    } catch (error) {
      Alert.alert(t('common.error'), t('auth.loginError'));
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <AppBar title={t('auth.login')} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>{t('common.appName')}</Text>
          <Text style={styles.subtitle}>{t('auth.login')}</Text>

          {/* Mobile Number Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('auth.mobileNumber')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.enterMobileNumber')}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="numeric"
              maxLength={10}
              autoCapitalize="none"
            />
            {errors.mobileNumber ? (
              <Text style={styles.errorText}>{errors.mobileNumber}</Text>
            ) : null}
          </View>

          {/* Aadhaar Number Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('auth.aadhaarNumber')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.enterAadhaarNumber')}
              value={aadhaarNumber}
              onChangeText={setAadhaarNumber}
              keyboardType="numeric"
              maxLength={12}
              autoCapitalize="none"
            />
            {errors.aadhaarNumber ? (
              <Text style={styles.errorText}>{errors.aadhaarNumber}</Text>
            ) : null}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>{t('auth.noAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>{t('auth.signup')}</Text>
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
    justifyContent: 'center',
  },
  formContainer: {
    padding: 20,
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
  loginButton: {
    backgroundColor: '#4B7BEC',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#666',
    fontSize: 16,
  },
  signupLink: {
    color: '#4B7BEC',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;