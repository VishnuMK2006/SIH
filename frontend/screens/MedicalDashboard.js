import React, { useState, useCallback, memo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { prescriptions, patientHistory, patientMedicalInfo } from '../data/mockData';
import { patientInfo } from '../data/patientData';
import { useAuth } from '../context/AuthContext';
import { useNavigation as useAppNavigation } from '../context/NavigationContext';
import { useNetworkConnectivity } from '../hooks/useNetworkConnectivity';
import { useSync } from '../hooks/useSync';
import PrescriptionService from '../services/PrescriptionService';
import AppBar from '../components/AppBar';
import MainLayout from '../components/MainLayout';

// Optimized component for prescription cards - using memo for performance
const PrescriptionCard = memo(({ item }) => {
  const { t } = useTranslation();
  const isToday = item.remainingDays === 0;
  const statusColor = isToday ? '#FF6B6B' : (item.remainingDays === 1 ? '#FFAA2B' : item.color);
  
  return (
    <TouchableOpacity style={[styles.prescriptionCard, { borderLeftColor: statusColor }]}>
      <View style={styles.prescriptionHeader}>
        <Text style={styles.medicineName}>{item.medicineName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>
            {isToday ? t('common.today') : `${item.remainingDays} ${t('common.days')}`}
          </Text>
        </View>
      </View>
      <Text style={styles.dosage}>{item.dosage}</Text>
      <Text style={styles.nextDate}>
        {t('common.next')}: {new Date(item.nextDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </Text>
    </TouchableOpacity>
  );
});

// Optimized component for history items - using memo for performance
const HistoryItem = memo(({ item }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  
  return (
    <TouchableOpacity 
      style={styles.historyItem}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.historyHeader}>
        <View>
          <Text style={styles.historyDate}>
            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
          <Text style={styles.historyTreatment}>{item.treatment}</Text>
        </View>
        <Text style={styles.doctorName}>{item.doctorName}</Text>
      </View>
      
      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          
          <View style={styles.vitalsContainer}>
            <View style={styles.vitalItem}>
              <Text style={styles.vitalLabel}>{t('dashboard.bp')}</Text>
              <Text style={styles.vitalValue}>{item.vitals.bloodPressure}</Text>
            </View>
            <View style={styles.vitalItem}>
              <Text style={styles.vitalLabel}>{t('dashboard.hr')}</Text>
              <Text style={styles.vitalValue}>{item.vitals.heartRate}</Text>
            </View>
            <View style={styles.vitalItem}>
              <Text style={styles.vitalLabel}>{t('dashboard.temp')}</Text>
              <Text style={styles.vitalValue}>{item.vitals.temperature}</Text>
            </View>
          </View>
          
          <View style={styles.diagnosisContainer}>
            <Text style={styles.diagnosisLabel}>{t('dashboard.diagnosis')}:</Text>
            <Text style={styles.diagnosisText}>{item.diagnosis}</Text>
          </View>
          
          <Text style={styles.notesLabel}>{t('dashboard.notes')}:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

// Empty list components for better UX
const EmptyPrescriptions = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t('dashboard.noPrescriptions')}</Text>
    </View>
  );
};

const EmptyHistory = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t('dashboard.noHistory')}</Text>
    </View>
  );
};

// Main Dashboard Component
const MedicalDashboard = ({ navigation }) => {
  const { logout, user } = useAuth();
  const { openDrawer } = useAppNavigation();
  const { t } = useTranslation();
  const network = useNetworkConnectivity();
  const sync = useSync();
  
  // State for prescriptions data
  const [userPrescriptions, setUserPrescriptions] = useState(prescriptions);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState('mock'); // 'mock', 'api', or 'sms'
  
  // Fetch prescriptions based on network connectivity
  useEffect(() => {
    const fetchUserPrescriptions = async () => {
      try {
        setIsLoading(true);
        
        // If we have a real user ID, use it; otherwise use a placeholder
        const userId = user?.id || 'mock-user-id';
        
        if (network.isConnected) {
          // Fetch prescriptions with automatic method selection based on network quality
          const result = await PrescriptionService.fetchPrescriptions(userId);
          
          if (result && result.data) {
            // If real data exists, use it
            if (result.data.prescriptions && result.data.prescriptions.length > 0) {
              setUserPrescriptions(result.data.prescriptions);
              setDataSource(result.source);
            }
          }
        } else {
          console.log('No network connection, using local data');
          // We're already using mock data as the default
          setDataSource('offline');
        }
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        // Keep using mock data on error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserPrescriptions();
    
    // Refresh when network state changes
    if (network.isConnected !== undefined) {
      fetchUserPrescriptions();
    }
  }, [network.isConnected, user?.id]);
  
  // Optimized rendering with useCallback
  const renderPrescriptionCard = useCallback(({ item }) => (
    <PrescriptionCard item={item} />
  ), []);
  
  const renderHistoryItem = useCallback(({ item }) => (
    <HistoryItem item={item} />
  ), []);
  
  // Optimized key extraction
  const keyExtractorPrescriptions = useCallback((item) => `prescription-${item.id}`, []);
  const keyExtractorHistory = useCallback((item) => `history-${item.id}`, []);

  const goToProfile = () => {
    navigation.navigate('Home');
  };
  
  const handleLogout = async () => {
    Alert.alert(
      t('auth.logout'),
      t('auth.logoutConfirmation'),
      [
        {
          text: t('common.cancel'),
          style: "cancel"
        },
        { 
          text: t('auth.logout'), 
          onPress: async () => await logout()
        }
      ]
    );
  };

  return (
    <MainLayout navigation={navigation}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4B7BEC" translucent={true} />
        
        {/* App Bar */}
        <AppBar 
          title={t('dashboard.title')}
          showMenuButton={true}
          onMenuPress={openDrawer}
          rightContent={
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.profileButton} onPress={goToProfile}>
              <View style={styles.profileImage}>
                <Text style={styles.profileInitial}>{patientInfo.name.charAt(0)}</Text>
              </View>
            </TouchableOpacity>
          </View>
        }
      />
      
      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Network Status Indicator */}
        <View style={styles.networkStatusContainer}>
          <View style={styles.networkStatusRow}>
            <View style={[styles.networkIndicator, { 
              backgroundColor: network.isConnected ? 
                (network.fetchMethod === 'api' ? '#4CAF50' : '#FF9800') : 
                '#F44336' 
            }]} />
            <Text style={styles.networkStatusText}>
              {network.isConnected ? 
                (network.fetchMethod === 'api' ? 
                  t('common.onlineMode') : 
                  t('common.limitedMode')) : 
                t('common.offlineMode')}
            </Text>
            <Text style={styles.dataSourceText}>
              {t('common.dataSource')}: {dataSource === 'api' ? 
                t('common.server') : 
                (dataSource === 'sms' ? 
                  t('common.sms') : 
                  t('common.local'))}
            </Text>
          </View>
          
          {/* Sync Status and Button */}
          <View style={styles.syncStatusRow}>
            <Text style={styles.lastSyncText}>
              {t('common.lastSync')}: {sync.lastSyncTime ? 
                new Date(sync.lastSyncTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                t('common.never')}
            </Text>
            
            <TouchableOpacity 
              style={[
                styles.syncButton, 
                sync.isSyncing && styles.syncButtonDisabled
              ]}
              onPress={sync.syncNow}
              disabled={sync.isSyncing || !network.isConnected || network.fetchMethod !== 'api'}
            >
              {sync.isSyncing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.syncButtonText}>{t('common.sync')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Patient Summary */}
        <View style={styles.patientSummary}>
          <View style={styles.patientDetail}>
            <Text style={styles.detailLabel}>{t('dashboard.age')}</Text>
            <Text style={styles.detailValue}>{patientMedicalInfo.age}</Text>
        </View>
        <View style={styles.patientDetail}>
          <Text style={styles.detailLabel}>{t('dashboard.blood')}</Text>
          <Text style={styles.detailValue}>{patientMedicalInfo.bloodType}</Text>
        </View>
        <View style={styles.patientDetail}>
          <Text style={styles.detailLabel}>{t('dashboard.weight')}</Text>
          <Text style={styles.detailValue}>{patientMedicalInfo.weight}</Text>
        </View>
        <View style={styles.patientDetail}>
          <Text style={styles.detailLabel}>{t('dashboard.height')}</Text>
          <Text style={styles.detailValue}>{patientMedicalInfo.height}</Text>
        </View>
      </View>
      
      {/* Prescriptions Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('dashboard.upcomingMedications')}</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>{t('common.seeAll')}</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={prescriptions}
          renderItem={renderPrescriptionCard}
          keyExtractor={keyExtractorPrescriptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.prescriptionsList}
          ListEmptyComponent={EmptyPrescriptions}
          // Performance optimizations
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={3}
          removeClippedSubviews={true}
        />
      </View>
      
      {/* Medical History Section */}
      <View style={styles.historySectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('dashboard.medicalHistory')}</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>{t('common.seeAll')}</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={patientHistory}
          renderItem={renderHistoryItem}
          keyExtractor={keyExtractorHistory}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.historyList}
          ListEmptyComponent={EmptyHistory}
          // Performance optimizations
          initialNumToRender={5}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews={true}
        />
      </View>
      </View>
    </SafeAreaView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 10,
  },
  welcomeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f7f9fc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  welcomeText: {
    fontSize: 14,
    color: '#8896AB',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A2C55',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EDF2F7',
    borderRadius: 16,
    marginRight: 10,
  },
  headerButtonText: {
    color: '#4B7BEC',
    fontWeight: '600',
    fontSize: 12,
  },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4B7BEC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  patientSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#A0C1D1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  patientDetail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#8896AB',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2C55',
  },
  sectionContainer: {
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A2C55',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4B7BEC',
    fontWeight: '500',
  },
  prescriptionsList: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  prescriptionCard: {
    width: 170,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderLeftWidth: 4,
    shadowColor: '#A0C1D1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2C55',
    flex: 1,
    marginRight: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  dosage: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  nextDate: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8896AB',
  },
  historySectionContainer: {
    flex: 1,
  },
  historyList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  historyItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#A0C1D1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B7BEC',
    marginBottom: 4,
  },
  historyTreatment: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2C55',
  },
  doctorName: {
    fontSize: 14,
    color: '#64748B',
  },
  expandedContent: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  vitalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vitalItem: {
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  vitalLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  vitalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2C55',
  },
  diagnosisContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  diagnosisLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2C55',
    marginRight: 4,
  },
  diagnosisText: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2C55',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8896AB',
    fontSize: 14,
  },
  networkStatusContainer: {
    marginHorizontal: 20,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#1A2C55',
  },
  dataSourceText: {
    fontSize: 10,
    color: '#8896AB',
    marginLeft: 'auto',
  },
  syncStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  lastSyncText: {
    fontSize: 10,
    color: '#8896AB',
  },
  syncButton: {
    backgroundColor: '#4B7BEC',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    height: 24,
  },
  syncButtonDisabled: {
    backgroundColor: '#A0BEF8',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default MedicalDashboard;