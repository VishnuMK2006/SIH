import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert
} from 'react-native';
import { prescriptions, patientHistory, patientInfo } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useNavigation as useAppNavigation } from '../context/NavigationContext';
import AppBar from '../components/AppBar';
import MainLayout from '../components/MainLayout';

// Optimized component for prescription cards - using memo for performance
const PrescriptionCard = memo(({ item }) => {
  const isToday = item.remainingDays === 0;
  const statusColor = isToday ? '#FF6B6B' : (item.remainingDays === 1 ? '#FFAA2B' : item.color);
  
  return (
    <TouchableOpacity style={[styles.prescriptionCard, { borderLeftColor: statusColor }]}>
      <View style={styles.prescriptionHeader}>
        <Text style={styles.medicineName}>{item.medicineName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>
            {isToday ? 'Today' : `${item.remainingDays} days`}
          </Text>
        </View>
      </View>
      <Text style={styles.dosage}>{item.dosage}</Text>
      <Text style={styles.nextDate}>
        Next: {new Date(item.nextDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </Text>
    </TouchableOpacity>
  );
});

// Optimized component for history items - using memo for performance
const HistoryItem = memo(({ item }) => {
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
              <Text style={styles.vitalLabel}>BP</Text>
              <Text style={styles.vitalValue}>{item.vitals.bloodPressure}</Text>
            </View>
            <View style={styles.vitalItem}>
              <Text style={styles.vitalLabel}>HR</Text>
              <Text style={styles.vitalValue}>{item.vitals.heartRate}</Text>
            </View>
            <View style={styles.vitalItem}>
              <Text style={styles.vitalLabel}>Temp</Text>
              <Text style={styles.vitalValue}>{item.vitals.temperature}</Text>
            </View>
          </View>
          
          <View style={styles.diagnosisContainer}>
            <Text style={styles.diagnosisLabel}>Diagnosis:</Text>
            <Text style={styles.diagnosisText}>{item.diagnosis}</Text>
          </View>
          
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

// Empty list components for better UX
const EmptyPrescriptions = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>No upcoming prescriptions</Text>
  </View>
);

const EmptyHistory = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>No medical history available</Text>
  </View>
);

// Main Dashboard Component
const MedicalDashboard = ({ navigation }) => {
  const { logout } = useAuth();
  const { openDrawer } = useAppNavigation();
  
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
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
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
          title="Medical Dashboard" 
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
        {/* Patient Summary */}
        <View style={styles.patientSummary}>
          <View style={styles.patientDetail}>
            <Text style={styles.detailLabel}>Age</Text>
            <Text style={styles.detailValue}>{patientInfo.age}</Text>
        </View>
        <View style={styles.patientDetail}>
          <Text style={styles.detailLabel}>Blood</Text>
          <Text style={styles.detailValue}>{patientInfo.bloodType}</Text>
        </View>
        <View style={styles.patientDetail}>
          <Text style={styles.detailLabel}>Weight</Text>
          <Text style={styles.detailValue}>{patientInfo.weight}</Text>
        </View>
        <View style={styles.patientDetail}>
          <Text style={styles.detailLabel}>Height</Text>
          <Text style={styles.detailValue}>{patientInfo.height}</Text>
        </View>
      </View>
      
      {/* Prescriptions Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Medications</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
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
          <Text style={styles.sectionTitle}>Medical History</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
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
});

export default MedicalDashboard;