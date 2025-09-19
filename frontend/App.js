import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider } from './context/NavigationContext';
import { LanguageProvider } from './context/LanguageContext';
import SideMenu from './components/SideMenu';
import SyncService from './services/SyncService';

// Import i18n configuration
import './i18n/i18n';

// Import screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import MedicalDashboard from './screens/MedicalDashboard';
import AppointmentsScreen from './screens/appointments/AppointmentsScreen';
import RecordsScreen from './screens/records/RecordsScreen';
import RulesAndRegulationsScreen from './screens/rules/RulesAndRegulationsScreen';

// Create stack navigators
const AuthStack = createStackNavigator();
const AppStack = createStackNavigator();

// Authentication flow navigator
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Signup" component={SignupScreen} />
  </AuthStack.Navigator>
);

// Main app navigator (after authentication)
const AppNavigator = () => (
  <AppStack.Navigator
    screenOptions={{
      headerShown: false, // Hide default headers for all screens as we're using our custom AppBar
    }}
  >
    <AppStack.Screen 
      name="MedicalDashboard" 
      component={MedicalDashboard} 
    />
    <AppStack.Screen 
      name="Home" 
      component={HomeScreen} 
    />
    <AppStack.Screen 
      name="Appointments" 
      component={AppointmentsScreen} 
    />
    <AppStack.Screen 
      name="Records" 
      component={RecordsScreen} 
    />
    <AppStack.Screen 
      name="RulesAndRegulations" 
      component={RulesAndRegulationsScreen} 
    />
  </AppStack.Navigator>
);

// Root navigator that decides which flow to show based on auth state
const RootNavigator = () => {
  const { token, isLoading } = useAuth();
  
  // Initialize SyncService when authenticated
  useEffect(() => {
    if (token) {
      // Initialize the sync service
      SyncService.initialize();
      
      // Clean up on unmount
      return () => {
        SyncService.cleanup();
      };
    }
  }, [token]);
  
  if (isLoading) {
    // Show a loading screen while checking authentication
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4B7BEC" />
      </View>
    );
  }
  
  return (
    <NavigationContainer>
      {token ? (
        <NavigationProvider>
          <AppNavigator />
        </NavigationProvider>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

// Main App component that wraps everything with the AuthProvider
export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </AuthProvider>
    </LanguageProvider>
  );
}
