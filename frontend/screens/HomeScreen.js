import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const HomeScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
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

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  logoutButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;