import { useState, useEffect, useCallback } from 'react';
import SyncService from '../services/SyncService';
import NetworkService from '../services/NetworkService';

/**
 * Custom hook to use the sync service in components
 * @returns {Object} Sync state and methods
 */
export const useSync = () => {
  const [syncState, setSyncState] = useState({
    isSyncing: false,
    lastSyncTime: null,
    syncError: null,
    networkStatus: 'unknown',
    isAutoSyncEnabled: true
  });
  
  // Handle sync events
  const handleSyncUpdate = useCallback((data) => {
    if (data.status === 'started') {
      setSyncState(prevState => ({
        ...prevState,
        isSyncing: true,
        syncError: null
      }));
    } else if (data.status === 'completed') {
      setSyncState(prevState => ({
        ...prevState,
        isSyncing: false,
        lastSyncTime: data.timestamp,
        syncError: null
      }));
    } else if (data.status === 'error') {
      setSyncState(prevState => ({
        ...prevState,
        isSyncing: false,
        syncError: data.error
      }));
    }
  }, []);
  
  // Handle network status changes
  const handleNetworkChange = useCallback((connectionInfo) => {
    setSyncState(prevState => ({
      ...prevState,
      networkStatus: connectionInfo.isConnected ? 
        (connectionInfo.fetchMethod === 'api' ? 'online' : 'limited') : 
        'offline'
    }));
  }, []);
  
  // Trigger a manual sync
  const syncNow = useCallback(async () => {
    try {
      await SyncService.forceSync();
      return true;
    } catch (error) {
      console.error('Manual sync failed:', error);
      setSyncState(prevState => ({
        ...prevState,
        syncError: error.message
      }));
      return false;
    }
  }, []);
  
  // Toggle auto sync
  const toggleAutoSync = useCallback((enabled) => {
    setSyncState(prevState => ({
      ...prevState,
      isAutoSyncEnabled: enabled !== undefined ? enabled : !prevState.isAutoSyncEnabled
    }));
    
    if (enabled !== undefined ? enabled : !syncState.isAutoSyncEnabled) {
      SyncService.startPeriodicSync();
    } else {
      SyncService.stopPeriodicSync();
    }
  }, [syncState.isAutoSyncEnabled]);
  
  // Initialize sync service and listeners
  useEffect(() => {
    // Register sync listener
    const unsubscribeSyncListener = SyncService.addSyncListener(handleSyncUpdate);
    
    // Register network listener
    const unsubscribeNetworkListener = NetworkService.subscribeToNetworkChanges(handleNetworkChange);
    
    // Initialize sync service if not already initialized
    SyncService.initialize();
    
    // Get initial network status
    NetworkService.checkConnection().then(handleNetworkChange);
    
    // Cleanup on unmount
    return () => {
      unsubscribeSyncListener();
      unsubscribeNetworkListener();
    };
  }, [handleSyncUpdate, handleNetworkChange]);
  
  return {
    ...syncState,
    syncNow,
    toggleAutoSync,
    // Utility method to format the last sync time
    getLastSyncFormatted: () => {
      if (!syncState.lastSyncTime) return 'Never';
      
      // Format the date for display
      const date = new Date(syncState.lastSyncTime);
      return date.toLocaleString();
    }
  };
};