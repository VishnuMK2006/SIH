import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_ENDPOINTS, getHeaders } from '../config/api';

// Create the Authentication Context
const AuthContext = createContext();

// Token storage key
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Provider component that wraps the app and makes auth object available
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    user: null,
    isLoading: true,
    isSignout: false,
  });

  // Check if the user is already logged in
  useEffect(() => {
    const loadTokenAndUserData = async () => {
      try {
        // Load token from secure storage
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        
        if (token) {
          // Load user data
          const userDataString = await SecureStore.getItemAsync(USER_KEY);
          const userData = userDataString ? JSON.parse(userDataString) : null;
          
          // Verify token with the backend (optional)
          // You could make an API call here to verify the token is still valid
          
          setAuthState({
            token,
            user: userData,
            isLoading: false,
            isSignout: false,
          });
        } else {
          setAuthState({
            token: null,
            user: null,
            isLoading: false,
            isSignout: false,
          });
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        setAuthState({
          token: null,
          user: null,
          isLoading: false,
          isSignout: false,
        });
      }
    };

    loadTokenAndUserData();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.AUTH.LOGIN, 
        { email, password },
        { headers: getHeaders() }
      );

      const { token, user } = response.data;

      // Save token and user data to secure storage
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

      // Update auth state
      setAuthState({
        token,
        user,
        isLoading: false,
        isSignout: false,
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Login error:', error);
      
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.AUTH.SIGNUP, 
        userData,
        { headers: getHeaders() }
      );

      const { token, user } = response.data;

      // Save token and user data to secure storage
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

      // Update auth state
      setAuthState({
        token,
        user,
        isLoading: false,
        isSignout: false,
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Signup error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Signup failed. Please try again.';
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear token and user data from secure storage
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);

      // Update auth state
      setAuthState({
        token: null,
        user: null,
        isLoading: false,
        isSignout: true,
      });

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  };

  // Get user profile
  const getUserProfile = async () => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.USER.PROFILE,
        { headers: getHeaders(authState.token) }
      );

      const updatedUser = response.data.user;

      // Update user data in secure storage
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));

      // Update auth state
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));

      return { success: true, data: updatedUser };
    } catch (error) {
      console.error('Get profile error:', error);
      
      if (error.response?.status === 401) {
        // Token expired or invalid, logout
        logout();
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to get profile' 
      };
    }
  };

  // Update user profile
  const updateUserProfile = async (updatedData) => {
    try {
      const response = await axios.put(
        API_ENDPOINTS.USER.UPDATE_PROFILE,
        updatedData,
        { headers: getHeaders(authState.token) }
      );

      const updatedUser = response.data.user;

      // Update user data in secure storage
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));

      // Update auth state
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));

      return { success: true, data: updatedUser };
    } catch (error) {
      console.error('Update profile error:', error);
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update profile' 
      };
    }
  };

  // Create the auth context value object
  const authContext = {
    ...authState,
    login,
    signup,
    logout,
    getUserProfile,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};