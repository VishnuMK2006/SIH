import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigation as useAppNavigation } from '../context/NavigationContext';
import AppBar from '../components/AppBar';
import MainLayout from '../components/MainLayout';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { openDrawer } = useAppNavigation();
  const { t } = useTranslation();

  // Helper function to safely get patient data with fallbacks
  const getPatientData = () => {
    if (!user) return null;
    
    return {
      name: user.name || user.patient_name || 'N/A',
      patient_id: user.patient_id || 'N/A',
      gender: user.gender || user.demographics?.gender || 'N/A',
      age: user.age || user.demographics?.age || 'N/A',
      district: user.district || user.location?.district || 'N/A',
      country: user.country || user.location?.country || 'India',
      email: user.email || user.contact?.email || 'N/A',
      phone: user.phone_number || user.contact?.phone_number || 'N/A',
      aadhaar: user.contact?.masked_aadhaar || user.aadhaar_number || 'N/A',
      lastLogin: user.last_login || user.last_refresh || new Date().toISOString()
    };
  };

  const patientData = getPatientData();

  const handleLogout = async () => {
    await logout();
  };

  const goBackToDashboard = () => {
    navigation.goBack();
  };

  // Show loading or error state if no user data
  if (!user || !patientData) {
    return (
      <MainLayout navigation={navigation}>
        <SafeAreaView style={styles.container}>
          <AppBar 
            title={t('profile.profile')}
            showBackButton={true}
            showMenuButton={true}
            onBackPress={goBackToDashboard}
            onMenuPress={openDrawer}
          />
          <View style={[styles.content, styles.centerContent]}>
            <Text style={styles.errorText}>{t('common.loading')}</Text>
          </View>
        </SafeAreaView>
      </MainLayout>
    );
  }

  return (
    <MainLayout navigation={navigation}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4B7BEC" translucent={true} />
        <AppBar 
          title={t('profile.profile')}
          showBackButton={true}
          showMenuButton={true}
          onBackPress={goBackToDashboard}
          onMenuPress={openDrawer}
        />
      
      <View style={styles.content}>
        <Text style={styles.welcomeText}>{t('profile.welcome')}, {patientData.name}!</Text>
        
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('profile.patientProfile')}</Text>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>{t('profile.patientId')}:</Text>
              <Text style={styles.profileValue}>{patientData.patient_id}</Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>{t('profile.name')}:</Text>
              <Text style={styles.profileValue}>{patientData.name}</Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>{t('profile.gender')}:</Text>
              <Text style={styles.profileValue}>{patientData.gender.charAt(0).toUpperCase() + patientData.gender.slice(1)}</Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>{t('profile.age')}:</Text>
              <Text style={styles.profileValue}>{patientData.age}</Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>{t('profile.district')}:</Text>
              <Text style={styles.profileValue}>{patientData.district}</Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>{t('profile.country')}:</Text>
              <Text style={styles.profileValue}>{patientData.country}</Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>{t('profile.email')}:</Text>
              <Text style={styles.profileValue}>{patientData.email}</Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>{t('profile.phone')}:</Text>
              <Text style={styles.profileValue}>{patientData.phone}</Text>
            </View>

            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>{t('profile.aadhaar')}:</Text>
              <Text style={styles.profileValue}>{patientData.aadhaar}</Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>{t('profile.lastLogin')}:</Text>
              <Text style={styles.profileValue}>
                {new Date(patientData.lastLogin).toLocaleString()}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.dashboardButton}
            onPress={goBackToDashboard}
          >
            <Text style={styles.dashboardButtonText}>{t('dashboard.backToDashboard')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>{t('auth.logout')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  profileItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileLabel: {
    width: '30%',
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  profileValue: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  dashboardButton: {
    backgroundColor: '#4B7BEC',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  dashboardButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;