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
import { patientInfo } from '../data/patientData';
import AppBar from '../components/AppBar';
import MainLayout from '../components/MainLayout';
import LanguageSelector from '../components/LanguageSelector';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { openDrawer } = useAppNavigation();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
  };

  const goBackToDashboard = () => {
    navigation.goBack();
  };

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
          rightContent={
            <View style={styles.headerButtons}>
              <LanguageSelector />
            </View>
          }
        />
      
      <View style={styles.content}>
        <Text style={styles.welcomeText}>{t('profile.welcome')}, {patientInfo.name}!</Text>
        
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('profile.patientProfile')}</Text>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>{t('profile.patientId')}:</Text>
              <Text style={styles.profileValue}>{patientInfo.patient_id}</Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>{t('profile.name')}:</Text>
              <Text style={styles.profileValue}>{patientInfo.name}</Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>{t('profile.gender')}:</Text>
              <Text style={styles.profileValue}>{patientInfo.gender.charAt(0).toUpperCase() + patientInfo.gender.slice(1)}</Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>{t('profile.age')}:</Text>
              <Text style={styles.profileValue}>{patientInfo.age}</Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>{t('profile.district')}:</Text>
              <Text style={styles.profileValue}>{patientInfo.district}</Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>{t('profile.country')}:</Text>
              <Text style={styles.profileValue}>{patientInfo.country}</Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>{t('profile.email')}:</Text>
              <Text style={styles.profileValue}>{patientInfo.email}</Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>{t('profile.phone')}:</Text>
              <Text style={styles.profileValue}>{patientInfo.phoneNumber}</Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>{t('profile.lastLogin')}:</Text>
              <Text style={styles.profileValue}>
                {new Date(patientInfo.lastLogin).toLocaleString()}
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
});

export default HomeScreen;