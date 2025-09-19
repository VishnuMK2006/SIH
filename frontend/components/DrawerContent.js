import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Side Drawer Menu Component
 * 
 * @param {object} navigation - React Navigation object
 * @param {function} closeDrawer - Function to close the drawer
 */
const DrawerContent = ({ navigation, closeDrawer }) => {
  const { user, logout } = useAuth();
  
  // Handle menu item press
  const handleMenuItemPress = (screenName) => {
    closeDrawer();
    navigation.navigate(screenName);
  };
  
  // Handle logout
  const handleLogout = async () => {
    closeDrawer();
    await logout();
  };
  
  return (
    <View style={styles.container}>
      {/* Header - User Info */}
      <View style={styles.header}>
        <View style={styles.profileImage}>
          <Text style={styles.profileInitial}>{user?.fullName?.charAt(0) || 'U'}</Text>
        </View>
        <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
      </View>
      
      <ScrollView style={styles.menuItems}>
        {/* Menu Items */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handleMenuItemPress('MedicalDashboard')}
        >
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={styles.menuText}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handleMenuItemPress('Home')}
        >
          <Text style={styles.menuIcon}>👤</Text>
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
        >
          <Text style={styles.menuIcon}>💊</Text>
          <Text style={styles.menuText}>Medications</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
        >
          <Text style={styles.menuIcon}>📅</Text>
          <Text style={styles.menuText}>Appointments</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
        >
          <Text style={styles.menuIcon}>📝</Text>
          <Text style={styles.menuText}>Records</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
        >
          <Text style={styles.menuIcon}>🔔</Text>
          <Text style={styles.menuText}>Notifications</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
        >
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>
        
        {/* Divider */}
        <View style={styles.divider} />
        
        {/* Logout */}
        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>App Version 1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#4B7BEC',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#3867D6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileInitial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  menuItems: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  logoutItem: {
    marginTop: 10,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF6B6B',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#888',
  },
});

export default DrawerContent;