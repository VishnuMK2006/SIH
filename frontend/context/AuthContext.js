import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_ENDPOINTS, getHeaders } from '../config/api';
import PatientService from '../services/PatientService';

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

  // Login function for patient authentication
  const login = async (mobileNumber, aadhaarNumber) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.AUTH.LOGIN, 
        { 
          mobile_number: mobileNumber, 
          aadhaar_number: aadhaarNumber 
        },
        { headers: getHeaders() }
      );

      const { token, patient } = response.data;

      // Fetch detailed patient information using the Aadhaar number
      console.log('Fetching detailed patient information...');
      const detailedPatientResult = await PatientService.getPatientDetails(aadhaarNumber, token);
      
      let finalPatientData = patient; // Fallback to basic patient data
      
      if (detailedPatientResult.success) {
        // Use detailed patient data if available
        finalPatientData = {
          ...patient,
          ...detailedPatientResult.data.patient,
          // Preserve any additional data from login response
          login_timestamp: new Date().toISOString()
        };
        console.log('Detailed patient information fetched successfully');
      } else {
        console.warn('Could not fetch detailed patient information:', detailedPatientResult.error);
        // Continue with basic patient data from login response
      }

      // Save token and detailed patient data to secure storage
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(finalPatientData));

      // Update auth state with detailed patient data
      setAuthState({
        token,
        user: finalPatientData,
        isLoading: false,
        isSignout: false,
      });

      return { 
        success: true, 
        data: {
          ...response.data,
          patient: finalPatientData // Return the enhanced patient data
        }
      };
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

  // Refresh patient details using stored Aadhaar number
  const refreshPatientDetails = async () => {
    try {
      if (!authState.user?.contact?.aadhaar_number && !authState.user?.aadhaar_number) {
        throw new Error('No Aadhaar number available for refresh');
      }

      // Get Aadhaar number from stored user data
      const aadhaarNumber = authState.user.contact?.aadhaar_number || 
                           authState.user.aadhaar_number;

      console.log('Refreshing patient details for Aadhaar:', aadhaarNumber);
      
      const detailedPatientResult = await PatientService.getPatientDetails(aadhaarNumber, authState.token);
      
      if (detailedPatientResult.success) {
        const updatedPatientData = {
          ...authState.user,
          ...detailedPatientResult.data.patient,
          last_refresh: new Date().toISOString()
        };

        // Update user data in secure storage
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedPatientData));

        // Update auth state
        setAuthState(prev => ({
          ...prev,
          user: updatedPatientData,
        }));

        return { success: true, data: updatedPatientData };
      } else {
        throw new Error(detailedPatientResult.error);
      }
    } catch (error) {
      console.error('Refresh patient details error:', error);
      
      return { 
        success: false, 
        error: error.message || 'Failed to refresh patient details' 
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
    refreshPatientDetails, // Add the new function
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