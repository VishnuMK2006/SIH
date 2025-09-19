import { useState, useEffect, useCallback } from 'react';
import NetworkService from '../services/NetworkService';

/**
 * Custom hook to handle network connectivity and determine the appropriate 
 * data fetching method based on connection quality
 * 
 * @returns {Object} Network state and methods
 */
export const useNetworkConnectivity = () => {
  const [networkState, setNetworkState] = useState({
    isConnected: true,
    type: 'unknown',
    fetchMethod: 'api',
    isLoading: true,
    details: null
  });
  
  // Function to check connection and update state
  const checkConnection = useCallback(async () => {
    try {
      setNetworkState(prevState => ({ ...prevState, isLoading: true }));
      const connectionInfo = await NetworkService.checkConnection();
      
      setNetworkState({
        isConnected: connectionInfo.isConnected,
        type: connectionInfo.type,
        fetchMethod: connectionInfo.fetchMethod,
        details: connectionInfo.details,
        isLoading: false
      });
      
      return connectionInfo;
    } catch (error) {
      console.error('Error in useNetworkConnectivity:', error);
      setNetworkState({
        isConnected: false,
        type: 'unknown',
        fetchMethod: 'sms', // Default to SMS on error
        isLoading: false,
        error: error.message
      });
    }
  }, []);
  
  // Measure connection speed
  const measureSpeed = useCallback(async () => {
    try {
      setNetworkState(prevState => ({ ...prevState, isLoading: true }));
      const speedResult = await NetworkService.measureConnectionSpeed();
      
      setNetworkState(prevState => ({
        ...prevState,
        speedTest: speedResult,
        isLoading: false,
        // Update fetch method if speed test recommends a different method
        fetchMethod: speedResult.recommendedFetchMethod
      }));
      
      return speedResult;
    } catch (error) {
      console.error('Error measuring speed in useNetworkConnectivity:', error);
      setNetworkState(prevState => ({
        ...prevState,
        isLoading: false,
        speedTest: { error: error.message }
      }));
    }
  }, []);
  
  // Subscribe to network changes on component mount
  useEffect(() => {
    // Initial check
    checkConnection();
    
    // Subscribe to network changes
    const unsubscribe = NetworkService.subscribeToNetworkChanges(connectionInfo => {
      setNetworkState(prevState => ({
        ...prevState,
        isConnected: connectionInfo.isConnected,
        type: connectionInfo.type,
        fetchMethod: connectionInfo.fetchMethod,
        details: connectionInfo.details,
        isLoading: false
      }));
    });
    
    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [checkConnection]);
  
  return {
    ...networkState,
    checkConnection,
    measureSpeed,
    // Utility methods for easy checks
    shouldUseApi: networkState.fetchMethod === 'api',
    shouldUseSms: networkState.fetchMethod === 'sms',
  };
};