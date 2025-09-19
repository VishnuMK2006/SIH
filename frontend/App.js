import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';

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
  <AppStack.Navigator>
    <AppStack.Screen 
      name="Home" 
      component={HomeScreen} 
      options={{
        title: 'Migrant App',
        headerStyle: {
          backgroundColor: '#4B7BEC',
        },
        headerTintColor: '#fff',
      }}
    />
  </AppStack.Navigator>
);

// Root navigator that decides which flow to show based on auth state
const RootNavigator = () => {
  const { token, isLoading } = useAuth();
  
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
      {token ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

// Main App component that wraps everything with the AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <RootNavigator />
    </AuthProvider>
  );
}
