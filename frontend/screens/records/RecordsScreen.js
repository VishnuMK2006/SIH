import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AppBar from '../../components/AppBar';
import MainLayout from '../../components/MainLayout';
import RecordsService from '../../services/RecordsService';
import { useNetworkConnectivity } from '../../hooks/useNetworkConnectivity';
import { useNavigation } from '../../context/NavigationContext';

const RecordsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { openDrawer } = useNavigation();
  const network = useNetworkConnectivity();
  
  // State variables
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showRecordDetails, setShowRecordDetails] = useState(false);
  
  // Load records on mount
  useEffect(() => {
    const loadRecords = async () => {
      try {
        setIsLoading(true);
        
        // Initialize records on first run
        await RecordsService.initializeRecords();
        
        // Load records
        const records = await RecordsService.getAllRecords();
          
        // Sort records by date (most recent first)
        const sortedRecords = [...records].sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        
        setMedicalRecords(sortedRecords);
      } catch (error) {
        console.error('Error loading medical records:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRecords();
  }, []);
  
  // View record details
  const viewRecordDetails = (record) => {
    setSelectedRecord(record);
    setShowRecordDetails(true);
  };
  
  // Format date to readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Record card component
  const RecordCard = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.recordCard}
        onPress={() => viewRecordDetails(item)}
      >
        <View style={styles.recordHeader}>
          <Text style={styles.recordType}>{item.recordType}</Text>
          <Text style={styles.recordDate}>{formatDate(item.date)}</Text>
        </View>
        
        <View style={styles.recordContent}>
          <Text style={styles.hospitalName}>{item.hospitalName}</Text>
          <Text style={styles.doctorName}>{t('records.doctor')}: {item.doctorName}</Text>
          <Text style={styles.diagnosis}>{t('records.diagnosis')}: {item.diagnosis}</Text>
        </View>
        
        <View style={styles.recordFooter}>
          <Text style={styles.viewDetails}>{t('records.viewDetails')}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Record details modal
  const RecordDetailsModal = () => {
    if (!selectedRecord) return null;
    
    return (
      <Modal
        visible={showRecordDetails}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowRecordDetails(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <AppBar 
            title={t('records.recordDetails')}
            showBackButton={true}
            onBackPress={() => setShowRecordDetails(false)}
          />
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{t('records.generalInfo')}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('records.date')}:</Text>
                <Text style={styles.infoValue}>{formatDate(selectedRecord.date)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('records.hospital')}:</Text>
                <Text style={styles.infoValue}>{selectedRecord.hospitalName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('records.doctor')}:</Text>
                <Text style={styles.infoValue}>{selectedRecord.doctorName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('records.recordType')}:</Text>
                <Text style={styles.infoValue}>{selectedRecord.recordType}</Text>
              </View>
            </View>
            
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{t('records.medicalDetails')}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('records.diagnosis')}:</Text>
                <Text style={styles.infoValue}>{selectedRecord.diagnosis}</Text>
              </View>
              
              <Text style={styles.subSectionTitle}>{t('records.symptoms')}:</Text>
              <View style={styles.listContainer}>
                {selectedRecord.symptoms.map((symptom, index) => (
                  <Text key={index} style={styles.listItem}>• {symptom}</Text>
                ))}
              </View>
              
              <Text style={styles.subSectionTitle}>{t('records.vitals')}:</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('records.temperature')}:</Text>
                <Text style={styles.infoValue}>{selectedRecord.vitals.temperature}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('records.bloodPressure')}:</Text>
                <Text style={styles.infoValue}>{selectedRecord.vitals.bloodPressure}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('records.heartRate')}:</Text>
                <Text style={styles.infoValue}>{selectedRecord.vitals.heartRate}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('records.respiratoryRate')}:</Text>
                <Text style={styles.infoValue}>{selectedRecord.vitals.respiratoryRate}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('records.oxygenSaturation')}:</Text>
                <Text style={styles.infoValue}>{selectedRecord.vitals.oxygenSaturation}</Text>
              </View>
            </View>
            
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{t('records.medications')}</Text>
              {selectedRecord.medications.map((medication, index) => (
                <View key={index} style={styles.medicationCard}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  <Text style={styles.medicationDetail}>{t('records.dosage')}: {medication.dosage}</Text>
                  <Text style={styles.medicationDetail}>{t('records.frequency')}: {medication.frequency}</Text>
                  <Text style={styles.medicationDetail}>{t('records.duration')}: {medication.duration}</Text>
                </View>
              ))}
            </View>
            
            {selectedRecord.labTests && selectedRecord.labTests.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{t('records.labTests')}</Text>
                {selectedRecord.labTests.map((test, index) => (
                  <View key={index} style={styles.labTestCard}>
                    <Text style={styles.labTestName}>{test.name}</Text>
                    <Text style={styles.labTestDate}>{t('records.date')}: {new Date(test.date).toLocaleDateString()}</Text>
                    <Text style={styles.labTestResults}>{t('records.results')}: {test.results}</Text>
                  </View>
                ))}
              </View>
            )}
            
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{t('records.notes')}</Text>
              <Text style={styles.notesText}>{selectedRecord.notes}</Text>
            </View>
            
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{t('records.followUp')}</Text>
              <Text style={styles.followUpText}>
                {selectedRecord.followUp === 'PRN' 
                  ? t('records.asNeeded') 
                  : new Date(selectedRecord.followUp).toLocaleDateString()}
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };
  
  // Empty state component
  const EmptyRecords = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t('records.noRecords')}</Text>
    </View>
  );
  
  return (
    <MainLayout navigation={navigation}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4B7BEC" translucent={true} />
        
        <AppBar 
          title={t('records.title')}
          showMenuButton={true}
          onMenuPress={openDrawer}
        />
        
        <View style={styles.content}>
          {/* Network Status */}
          <View style={styles.networkStatusContainer}>
            <View style={styles.networkStatusRow}>
              <View style={[styles.networkIndicator, { 
                backgroundColor: network.isConnected ? '#4CAF50' : '#F44336' 
              }]} />
              <Text style={styles.networkStatusText}>
                {network.isConnected ? t('common.online') : t('common.offline')}
              </Text>
            </View>
          </View>
          
          {/* Content */}
          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#4B7BEC" />
            </View>
          ) : (
            <>
              <Text style={styles.sectionHeader}>{t('records.yourMedicalHistory')}</Text>
              
              <FlatList
                data={medicalRecords}
                renderItem={({ item }) => <RecordCard item={item} />}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.recordsList}
                ListEmptyComponent={<EmptyRecords />}
              />
            </>
          )}
        </View>
        
        {/* Record details modal */}
        <RecordDetailsModal />
      </SafeAreaView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  networkStatusContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  networkStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  networkStatusText: {
    fontSize: 14,
    color: '#333',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1A2C55',
  },
  recordsList: {
    flexGrow: 1,
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  recordType: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 12,
    color: '#1976D2',
  },
  recordDate: {
    fontSize: 12,
    color: '#666',
  },
  recordContent: {
    marginBottom: 10,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  doctorName: {
    fontSize: 14,
    marginBottom: 3,
    color: '#555',
  },
  diagnosis: {
    fontSize: 14,
    color: '#555',
  },
  recordFooter: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  viewDetails: {
    fontSize: 14,
    color: '#4B7BEC',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  modalContent: {
    flex: 1,
    padding: 15,
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1A2C55',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 8,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: '40%',
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  listContainer: {
    marginBottom: 15,
  },
  listItem: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    marginBottom: 5,
  },
  medicationCard: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  medicationDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  labTestCard: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  labTestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  labTestDate: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  labTestResults: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  followUpText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B7BEC',
  },
});

export default RecordsScreen;