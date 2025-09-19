import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation as useAppNavigation } from '../context/NavigationContext';
import AppBar from '../components/AppBar';
import MainLayout from '../components/MainLayout';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { openDrawer } = useAppNavigation();

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
          title="Profile" 
          showBackButton={true}
          showMenuButton={true}
          onBackPress={goBackToDashboard}
          onMenuPress={openDrawer}
        />
      
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome, {user?.fullName || 'User'}!</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Profile</Text>
          
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>Name:</Text>
            <Text style={styles.profileValue}>{user?.fullName || 'Not available'}</Text>
          </View>
          
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>Email:</Text>
            <Text style={styles.profileValue}>{user?.email || 'Not available'}</Text>
          </View>
          
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>Phone:</Text>
            <Text style={styles.profileValue}>{user?.phoneNumber || 'Not available'}</Text>
          </View>
          
          {user?.lastLogin && (
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Last Login:</Text>
              <Text style={styles.profileValue}>
                {new Date(user.lastLogin).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.dashboardButton}
          onPress={goBackToDashboard}
        >
          <Text style={styles.dashboardButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
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