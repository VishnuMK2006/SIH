import axios from 'axios';
import { API_ENDPOINTS, getHeaders } from '../config/api';

/**
 * Patient Service
 * Handles all patient-related API calls
 */
export class PatientService {
  /**
   * Fetch patient details using Aadhaar number
   * @param {string} aadhaarNumber - 12-digit Aadhaar number
   * @param {string} token - JWT token for authentication (optional)
   * @returns {Promise} Patient details response
   */
  static async getPatientDetails(aadhaarNumber, token = null) {
    try {
      console.log('Fetching patient details for Aadhaar:', aadhaarNumber);
      
      const response = await axios.post(
        API_ENDPOINTS.PATIENT.DETAILS,
        { aadhaar_number: aadhaarNumber },
        { headers: getHeaders(token) }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Patient details fetch error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          'Failed to fetch patient details';
      
      return {
        success: false,
        error: errorMessage,
        details: error.response?.data
      };
    }
  }

  /**
   * Fetch patient details using GET endpoint (alternative method)
   * @param {string} aadhaarNumber - 12-digit Aadhaar number
   * @param {string} token - JWT token for authentication (optional)
   * @returns {Promise} Patient details response
   */
  static async getPatientDetailsByGet(aadhaarNumber, token = null) {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.PATIENT.DETAILS}/${aadhaarNumber}`,
        { headers: getHeaders(token) }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Patient details fetch error (GET):', error);
      
      const errorMessage = error.response?.data?.message || 
                          'Failed to fetch patient details';
      
      return {
        success: false,
        error: errorMessage,
        details: error.response?.data
      };
    }
  }

  /**
   * Validate Aadhaar number format
   * @param {string} aadhaarNumber - Aadhaar number to validate
   * @returns {boolean} True if valid, false otherwise
   */
  static validateAadhaarNumber(aadhaarNumber) {
    if (!aadhaarNumber) return false;
    return /^\d{12}$/.test(aadhaarNumber.toString());
  }

  /**
   * Mask Aadhaar number for display (show only last 4 digits)
   * @param {string} aadhaarNumber - Full Aadhaar number
   * @returns {string} Masked Aadhaar number
   */
  static maskAadhaarNumber(aadhaarNumber) {
    if (!aadhaarNumber || aadhaarNumber.length !== 12) return '****';
    return aadhaarNumber.replace(/\d(?=\d{4})/g, '*');
  }
}

export default PatientService;