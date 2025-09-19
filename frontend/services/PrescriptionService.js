import { API_URL } from '../config/api';
import NetworkService from './NetworkService';

/**
 * Service for fetching medical prescriptions with network-aware functionality
 */
class PrescriptionService {
  /**
   * Fetch prescriptions with automatic method selection based on network
   * @param {string} userId The user ID to fetch prescriptions for
   * @returns {Promise<Object>} The prescriptions data
   */
  static async fetchPrescriptions(userId) {
    try {
      // Check network connection to determine fetch method
      const fetchMethod = await NetworkService.getRecommendedFetchMethod();
      
      if (fetchMethod === 'api') {
        return await this.fetchPrescriptionsFromApi(userId);
      } else {
        return await this.fetchPrescriptionsFromSms(userId);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      throw error;
    }
  }
  
  /**
   * Fetch prescriptions from API
   * @param {string} userId The user ID to fetch prescriptions for
   * @returns {Promise<Object>} The prescriptions data from API
   */
  static async fetchPrescriptionsFromApi(userId) {
    try {
      const response = await fetch(`${API_URL}/prescriptions/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any auth headers as needed
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        source: 'api',
        data: data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching prescriptions from API:', error);
      // If API fails, try SMS as fallback
      return this.fetchPrescriptionsFromSms(userId);
    }
  }
  
  /**
   * Fetch prescriptions from SMS service
   * This is a placeholder for the SMS-based fetch implementation
   * @param {string} userId The user ID to fetch prescriptions for
   * @returns {Promise<Object>} The prescriptions data from SMS
   */
  static async fetchPrescriptionsFromSms(userId) {
    try {
      // This is a placeholder - you'll need to implement the actual SMS-based fetch
      // For now, return a mock response
      console.log('Fetching prescriptions via SMS service for user:', userId);
      
      return {
        source: 'sms',
        data: {
          message: 'Prescriptions fetched via SMS service',
          prescriptions: [] // This would be populated with real data from SMS
        },
        timestamp: new Date().toISOString()
      };
      
      // TODO: Implement actual SMS-based fetch
      // This will be implemented later as mentioned in the requirements
    } catch (error) {
      console.error('Error fetching prescriptions from SMS:', error);
      throw new Error('Failed to fetch prescriptions via SMS: ' + error.message);
    }
  }
}

export default PrescriptionService;