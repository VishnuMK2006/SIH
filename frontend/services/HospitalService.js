import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

class HospitalService {
  // Get all hospitals with optional filtering and pagination
  static async getAllHospitals(filters = {}) {
    try {
      const {
        district,
        type,
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'asc'
      } = filters;

      const params = new URLSearchParams();
      if (district) params.append('district', district);
      if (type) params.append('type', type);
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await axios.get(`${API_ENDPOINTS.HOSPITAL.GET_ALL}?${params}`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.error || 'Failed to fetch hospitals');
      }
    } catch (error) {
      console.error('Error in getAllHospitals:', error);
      
      if (error.response?.data) {
        return {
          success: false,
          error: error.response.data.error || 'Server error',
          details: error.response.data.details
        };
      }
      
      return {
        success: false,
        error: error.message || 'Network error while fetching hospitals'
      };
    }
  }

  // Get specific hospital by hospital ID
  static async getHospitalById(hospitalId) {
    try {
      if (!hospitalId) {
        throw new Error('Hospital ID is required');
      }

      const response = await axios.get(API_ENDPOINTS.HOSPITAL.GET_BY_ID(hospitalId));

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data.hospital,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.error || 'Failed to fetch hospital details');
      }
    } catch (error) {
      console.error('Error in getHospitalById:', error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Hospital not found',
          notFound: true
        };
      }
      
      if (error.response?.data) {
        return {
          success: false,
          error: error.response.data.error || 'Server error',
          details: error.response.data.details
        };
      }
      
      return {
        success: false,
        error: error.message || 'Network error while fetching hospital details'
      };
    }
  }

  // Get hospitals by district
  static async getHospitalsByDistrict(district, filters = {}) {
    try {
      if (!district) {
        throw new Error('District is required');
      }

      const { type, sortBy = 'name', sortOrder = 'asc' } = filters;
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const url = `${API_ENDPOINTS.HOSPITAL.GET_BY_DISTRICT(district)}?${params}`;
      const response = await axios.get(url);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.error || 'Failed to fetch hospitals by district');
      }
    } catch (error) {
      console.error('Error in getHospitalsByDistrict:', error);
      
      if (error.response?.data) {
        return {
          success: false,
          error: error.response.data.error || 'Server error',
          details: error.response.data.details
        };
      }
      
      return {
        success: false,
        error: error.message || 'Network error while fetching hospitals by district'
      };
    }
  }

  // Get hospital statistics
  static async getHospitalStats() {
    try {
      const response = await axios.get(API_ENDPOINTS.HOSPITAL.GET_STATS);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.error || 'Failed to fetch hospital statistics');
      }
    } catch (error) {
      console.error('Error in getHospitalStats:', error);
      
      if (error.response?.data) {
        return {
          success: false,
          error: error.response.data.error || 'Server error',
          details: error.response.data.details
        };
      }
      
      return {
        success: false,
        error: error.message || 'Network error while fetching hospital statistics'
      };
    }
  }

  // Helper method to validate hospital ID format (if needed)
  static validateHospitalId(hospitalId) {
    if (!hospitalId || typeof hospitalId !== 'string') {
      return { valid: false, error: 'Hospital ID must be a non-empty string' };
    }
    
    // Add any specific validation rules for hospital IDs here
    if (hospitalId.trim().length === 0) {
      return { valid: false, error: 'Hospital ID cannot be empty' };
    }
    
    return { valid: true };
  }

  // Helper method to get unique districts from hospitals (if needed for dropdowns)
  static async getDistrictsList() {
    try {
      const result = await this.getHospitalStats();
      if (result.success && result.data.hospitalsByDistrict) {
        return {
          success: true,
          data: result.data.hospitalsByDistrict.map(item => ({
            district: item._id,
            hospitalCount: item.count,
            totalBedCapacity: item.totalBedCapacity
          }))
        };
      }
      throw new Error('Failed to get districts list');
    } catch (error) {
      console.error('Error in getDistrictsList:', error);
      return {
        success: false,
        error: 'Failed to fetch districts list'
      };
    }
  }

  // Helper method to get unique hospital types
  static async getHospitalTypes() {
    try {
      const result = await this.getHospitalStats();
      if (result.success && result.data.hospitalsByType) {
        return {
          success: true,
          data: result.data.hospitalsByType.map(item => ({
            type: item._id,
            hospitalCount: item.count,
            totalBedCapacity: item.totalBedCapacity,
            totalMonthlyCapacity: item.totalMonthlyCapacity
          }))
        };
      }
      throw new Error('Failed to get hospital types');
    } catch (error) {
      console.error('Error in getHospitalTypes:', error);
      return {
        success: false,
        error: 'Failed to fetch hospital types'
      };
    }
  }
}

export default HospitalService;