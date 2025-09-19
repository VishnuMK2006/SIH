import NetworkService from './NetworkService';
import PrescriptionService from './PrescriptionService';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Service to handle automatic data synchronization based on network availability
 */
class SyncService {
  // Track whether sync is currently in progress
  static isSyncing = false;
  
  // Track whether sync interval is active
  static syncIntervalId = null;
  
  // List of pending sync operations
  static pendingSync = [];
  
  // Timestamp of last successful sync
  static lastSyncTime = null;
  
  /**
   * Initialize the sync service
   * @returns {Promise<void>}
   */
  static async initialize() {
    try {
      // Load last sync time from storage
      const lastSyncTimeStr = await AsyncStorage.getItem('lastSyncTime');
      if (lastSyncTimeStr) {
        this.lastSyncTime = new Date(JSON.parse(lastSyncTimeStr));
      }
      
      // Listen for network changes to trigger sync
      this.setupNetworkListener();
      
      // Start periodic sync check
      this.startPeriodicSync();
      
      console.log('SyncService initialized');
    } catch (error) {
      console.error('Error initializing SyncService:', error);
    }
  }
  
  /**
   * Setup network change listener to trigger sync
   */
  static setupNetworkListener() {
    // Unsubscribe from previous listener if exists
    if (this.unsubscribeNetworkListener) {
      this.unsubscribeNetworkListener();
    }
    
    // Subscribe to network changes
    this.unsubscribeNetworkListener = NetworkService.subscribeToNetworkChanges(
      async (connectionInfo) => {
        // When connected to a good network, trigger sync
        if (connectionInfo.isConnected && connectionInfo.fetchMethod === 'api') {
          console.log('Network connected, checking if sync needed');
          this.scheduleSync();
        }
      }
    );
  }
  
  /**
   * Start periodic sync check (every 15 minutes when app is open)
   */
  static startPeriodicSync() {
    // Clear existing interval if any
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }
    
    // Set interval for sync (15 minutes)
    this.syncIntervalId = setInterval(() => {
      this.scheduleSync();
    }, 15 * 60 * 1000); // 15 minutes
  }
  
  /**
   * Stop periodic sync
   */
  static stopPeriodicSync() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }
  
  /**
   * Schedule a sync if conditions are right
   * @returns {Promise<void>}
   */
  static async scheduleSync() {
    try {
      // Don't schedule if already syncing
      if (this.isSyncing) {
        return;
      }
      
      // Check network connectivity
      const networkState = await NetworkService.checkConnection();
      
      // Only sync on good connections
      if (!networkState.isConnected || networkState.fetchMethod !== 'api') {
        console.log('Network not suitable for sync, skipping');
        return;
      }
      
      // Check if we need to sync (based on time since last sync)
      const shouldSync = this.shouldSync();
      
      if (shouldSync) {
        this.performSync();
      }
    } catch (error) {
      console.error('Error scheduling sync:', error);
    }
  }
  
  /**
   * Determine if sync is needed based on time since last sync
   * @returns {boolean}
   */
  static shouldSync() {
    // If never synced, definitely sync
    if (!this.lastSyncTime) {
      return true;
    }
    
    // Check if it's been at least 30 minutes since last sync
    const now = new Date();
    const timeSinceLastSync = now.getTime() - this.lastSyncTime.getTime();
    const thirtyMinutesMs = 30 * 60 * 1000;
    
    return timeSinceLastSync >= thirtyMinutesMs;
  }
  
  /**
   * Perform the actual sync operation
   * @returns {Promise<void>}
   */
  static async performSync() {
    if (this.isSyncing) {
      return;
    }
    
    try {
      this.isSyncing = true;
      
      // Notify listeners that sync is starting
      this.notifyListeners({ status: 'started' });
      
      // Get user info (could be from auth context or storage)
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
      const userId = userInfo?.id || 'default-user';
      
      // Sync prescriptions
      await this.syncPrescriptions(userId);
      
      // Sync other data (appointments, medical records, etc.)
      // TODO: Add more sync operations as needed
      
      // Update last sync time
      this.lastSyncTime = new Date();
      await AsyncStorage.setItem('lastSyncTime', JSON.stringify(this.lastSyncTime.toISOString()));
      
      // Notify listeners that sync is complete
      this.notifyListeners({ status: 'completed', timestamp: this.lastSyncTime });
      
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Error during sync:', error);
      
      // Notify listeners of error
      this.notifyListeners({ status: 'error', error: error.message });
    } finally {
      this.isSyncing = false;
    }
  }
  
  /**
   * Sync prescriptions data
   * @param {string} userId - The user ID
   * @returns {Promise<void>}
   */
  static async syncPrescriptions(userId) {
    try {
      console.log('Syncing prescriptions for user:', userId);
      
      // Fetch latest prescriptions from API
      const result = await PrescriptionService.fetchPrescriptionsFromApi(userId);
      
      if (result && result.data) {
        // Store the fetched prescriptions in local storage
        await AsyncStorage.setItem(
          'prescriptions',
          JSON.stringify({
            data: result.data,
            lastUpdated: new Date().toISOString(),
            source: 'api'
          })
        );
        
        console.log('Prescriptions synced successfully');
      }
    } catch (error) {
      console.error('Error syncing prescriptions:', error);
      throw error;
    }
  }
  
  /**
   * Force an immediate sync regardless of timing
   * @returns {Promise<void>}
   */
  static async forceSync() {
    try {
      // Check network connectivity
      const networkState = await NetworkService.checkConnection();
      
      // Only sync on good connections
      if (!networkState.isConnected || networkState.fetchMethod !== 'api') {
        throw new Error('Network not suitable for sync');
      }
      
      await this.performSync();
    } catch (error) {
      console.error('Error during forced sync:', error);
      throw error;
    }
  }
  
  // Sync event listeners
  static listeners = [];
  
  /**
   * Add a listener for sync events
   * @param {Function} listener - Function to call with sync updates
   * @returns {Function} Function to remove the listener
   */
  static addSyncListener(listener) {
    this.listeners.push(listener);
    
    // Return function to remove listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Notify all listeners of sync events
   * @param {Object} data - Event data
   */
  static notifyListeners(data) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }
  
  /**
   * Clean up the sync service
   */
  static cleanup() {
    if (this.unsubscribeNetworkListener) {
      this.unsubscribeNetworkListener();
    }
    
    this.stopPeriodicSync();
    this.listeners = [];
  }
}

export default SyncService;