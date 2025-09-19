import NetInfo from '@react-native-community/netinfo';

/**
 * Network connectivity service to detect internet connection type and quality
 * and determine the appropriate data fetching method
 */
class NetworkService {
  /**
   * Check network connection type and quality
   * @returns {Promise<Object>} Network connection info with type, isConnected, and fetchMethod
   */
  static async checkConnection() {
    try {
      const netInfo = await NetInfo.fetch();
      
      // Default values
      let connectionInfo = {
        isConnected: netInfo.isConnected,
        type: netInfo.type,
        details: netInfo.details,
        fetchMethod: 'api' // Default to API
      };
      
      // If not connected, use SMS service
      if (!netInfo.isConnected) {
        connectionInfo.fetchMethod = 'sms';
        return connectionInfo;
      }
      
      // Check connection type
      if (netInfo.type === 'cellular') {
        // For cellular connections, check generation
        const cellularGeneration = netInfo.details?.cellularGeneration;
        
        switch (cellularGeneration) {
          case '2g':
            // For 2G connections, use SMS service
            connectionInfo.fetchMethod = 'sms';
            break;
          case '3g':
          case '4g':
          case '5g':
            // For 3G, 4G, 5G connections, use API
            connectionInfo.fetchMethod = 'api';
            break;
          default:
            // For unknown cellular generation, check effective type
            if (netInfo.details?.effectiveType) {
              if (netInfo.details.effectiveType === '2g' || 
                  netInfo.details.effectiveType === 'slow-2g') {
                connectionInfo.fetchMethod = 'sms';
              }
            }
            break;
        }
      } else if (netInfo.type === 'wifi' || netInfo.type === 'ethernet') {
        // For WiFi and Ethernet connections, use API
        connectionInfo.fetchMethod = 'api';
      }
      
      // Add timestamp for reference
      connectionInfo.timestamp = new Date().toISOString();
      
      return connectionInfo;
    } catch (error) {
      console.error('Error checking network connection:', error);
      // Default to SMS on error to be safe
      return {
        isConnected: false,
        type: 'unknown',
        fetchMethod: 'sms',
        error: error.message
      };
    }
  }
  
  /**
   * Measure internet speed (rough estimate)
   * This is a simplified version, real-world implementation would be more complex
   * @returns {Promise<Object>} Speed test results
   */
  static async measureConnectionSpeed() {
    try {
      const startTime = Date.now();
      
      // Fetch a small file to measure download speed
      // You might want to replace this with a reliable endpoint from your API
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'GET',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch test file');
      }
      
      const data = await response.blob();
      const endTime = Date.now();
      
      // Calculate time taken in seconds
      const timeTaken = (endTime - startTime) / 1000;
      
      // Calculate speed in KB/s (approximate)
      const fileSizeInKB = data.size / 1024;
      const speedInKBps = fileSizeInKB / timeTaken;
      
      // Determine connection quality based on speed
      let connectionQuality;
      if (speedInKBps < 50) {
        connectionQuality = 'poor';
      } else if (speedInKBps < 200) {
        connectionQuality = 'fair';
      } else if (speedInKBps < 1000) {
        connectionQuality = 'good';
      } else {
        connectionQuality = 'excellent';
      }
      
      return {
        speedInKBps,
        timeTakenMs: endTime - startTime,
        fileSizeInKB,
        connectionQuality,
        // Recommend fetch method based on speed
        recommendedFetchMethod: speedInKBps < 50 ? 'sms' : 'api'
      };
    } catch (error) {
      console.error('Error measuring connection speed:', error);
      return {
        error: error.message,
        recommendedFetchMethod: 'sms' // Default to SMS on error
      };
    }
  }
  
  /**
   * Get recommended fetch method based on connection quality
   * @returns {Promise<string>} 'api' or 'sms'
   */
  static async getRecommendedFetchMethod() {
    try {
      // First check basic connectivity
      const connectionInfo = await this.checkConnection();
      
      // If we've already determined to use SMS based on connectivity type, return early
      if (connectionInfo.fetchMethod === 'sms') {
        return 'sms';
      }
      
      // If connected via wifi or good cellular, measure actual speed as a double-check
      const speedTest = await this.measureConnectionSpeed();
      
      return speedTest.recommendedFetchMethod;
    } catch (error) {
      console.error('Error determining fetch method:', error);
      return 'sms'; // Default to SMS on error to be safe
    }
  }
  
  /**
   * Subscribe to network connectivity changes
   * @param {Function} callback Function to call when network state changes
   * @returns {Function} Unsubscribe function
   */
  static subscribeToNetworkChanges(callback) {
    return NetInfo.addEventListener(state => {
      const connectionInfo = {
        isConnected: state.isConnected,
        type: state.type,
        details: state.details,
        fetchMethod: 'api' // Default
      };
      
      // Determine fetch method based on connection type
      if (!state.isConnected || 
          (state.type === 'cellular' && 
           (state.details?.cellularGeneration === '2g' || 
            state.details?.effectiveType === '2g' || 
            state.details?.effectiveType === 'slow-2g'))) {
        connectionInfo.fetchMethod = 'sms';
      }
      
      callback(connectionInfo);
    });
  }
}

export default NetworkService;