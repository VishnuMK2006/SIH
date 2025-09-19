import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import medicalRecordsData from '../data/records/medicalRecords.json';

/**
 * Service to handle medical records storage and retrieval
 */
class RecordsService {
  // Storage keys
  static RECORDS_STORAGE_KEY = '@medical_records';
  
  /**
   * Initialize medical records on first app run
   */
  static async initializeRecords() {
    try {
      // Check if records already exist in storage
      const existingRecords = await AsyncStorage.getItem(this.RECORDS_STORAGE_KEY);
      
      if (!existingRecords) {
        // If no records exist, initialize with sample data
        await AsyncStorage.setItem(
          this.RECORDS_STORAGE_KEY, 
          JSON.stringify(medicalRecordsData.records)
        );
        console.log('Medical records initialized with sample data');
      }
    } catch (error) {
      console.error('Error initializing medical records:', error);
    }
  }
  
  /**
   * Get all medical records
   */
  static async getAllRecords() {
    try {
      const records = await AsyncStorage.getItem(this.RECORDS_STORAGE_KEY);
      return records ? JSON.parse(records) : [];
    } catch (error) {
      console.error('Error getting medical records:', error);
      return [];
    }
  }
  
  /**
   * Get a single medical record by ID
   */
  static async getRecordById(recordId) {
    try {
      const records = await this.getAllRecords();
      return records.find(record => record.id === recordId);
    } catch (error) {
      console.error(`Error getting medical record with ID ${recordId}:`, error);
      return null;
    }
  }
}

export default RecordsService;