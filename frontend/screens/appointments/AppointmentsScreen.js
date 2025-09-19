import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Linking,
  Platform,
  Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import AppBar from '../../components/AppBar';
import { useNetworkConnectivity } from '../../hooks/useNetworkConnectivity';
import hospitals from '../../data/hospitals/hospitals.json';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

const AppointmentsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const network = useNetworkConnectivity();
  const webViewRef = useRef(null);
  
  // State variables
  const [userLocation, setUserLocation] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitalList, setHospitalList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    reason: ''
  });
  const [appointments, setAppointments] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);

  // Function to get user's current location
  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationPermission(false);
        Alert.alert(
          t('appointments.permissionDenied'),
          t('appointments.locationPermissionMessage')
        );
        setIsLoading(false);
        return;
      }
      
      setLocationPermission(true);
      
      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });
      
      // Calculate distance and sort hospitals
      calculateDistances(latitude, longitude);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        t('common.error'),
        t('appointments.locationError')
      );
      setIsLoading(false);
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  // Calculate distances to all hospitals and sort by distance
  const calculateDistances = (latitude, longitude) => {
    if (!latitude || !longitude) return;
    
    const hospitalsWithDistance = hospitals.hospitals.map(hospital => {
      const distance = calculateDistance(
        latitude,
        longitude,
        hospital.latitude,
        hospital.longitude
      );
      
      return {
        ...hospital,
        distance: distance,
        distanceText: distance < 1 ? 
          `${Math.round(distance * 1000)} m` : 
          `${distance.toFixed(1)} km`
      };
    });
    
    // Sort by distance
    const sortedHospitals = hospitalsWithDistance.sort((a, b) => a.distance - b.distance);
    setHospitalList(sortedHospitals);
  };

  // Handle selecting a hospital
  const selectHospital = (hospital) => {
    setSelectedHospital(hospital);
    
    // Send message to WebView to focus on this marker
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        selectMarker(${hospital.latitude}, ${hospital.longitude});
        true;
      `);
    }
  };

  // Handle call hospital
  const callHospital = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  // Handle booking appointment
  const bookAppointment = () => {
    setShowBookingForm(true);
  };

  // Submit appointment request
  const submitAppointment = async () => {
    // Validate form
    if (!appointmentData.name || !appointmentData.phone || !appointmentData.date || 
        !appointmentData.time || !appointmentData.reason) {
      Alert.alert(
        t('common.error'),
        t('appointments.fillAllFields')
      );
      return;
    }
    
    // Create new appointment object
    const newAppointment = {
      id: Date.now().toString(),
      hospitalId: selectedHospital.id,
      hospitalName: selectedHospital.name,
      status: network.isConnected ? 'processing' : 'pending',
      timestamp: new Date().toISOString(),
      ...appointmentData
    };
    
    try {
      // Add to appointments list
      const updatedAppointments = [...appointments, newAppointment];
      setAppointments(updatedAppointments);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      
      // If online, submit now, otherwise add to pending
      if (network.isConnected) {
        // In a real app, you would make an API call here
        // For now, simulate successful submission
        setTimeout(() => {
          updateAppointmentStatus(newAppointment.id, 'confirmed');
        }, 2000);
      } else {
        // Add to pending appointments
        const updatedPending = [...pendingAppointments, newAppointment];
        setPendingAppointments(updatedPending);
        await AsyncStorage.setItem('pendingAppointments', JSON.stringify(updatedPending));
      }
      
      // Close form and reset
      setShowBookingForm(false);
      setAppointmentData({
        name: '',
        phone: '',
        date: '',
        time: '',
        reason: ''
      });
      
      Alert.alert(
        t('appointments.requestSent'),
        network.isConnected ? 
          t('appointments.processingRequest') : 
          t('appointments.savedOffline')
      );
    } catch (error) {
      console.error('Error saving appointment:', error);
      Alert.alert(
        t('common.error'),
        t('appointments.savingError')
      );
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (id, status) => {
    try {
      const updatedAppointments = appointments.map(app => 
        app.id === id ? { ...app, status } : app
      );
      
      setAppointments(updatedAppointments);
      await AsyncStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  // Sync pending appointments
  const syncPendingAppointments = async () => {
    if (!network.isConnected || pendingAppointments.length === 0) return;
    
    try {
      // Process each pending appointment
      for (const appointment of pendingAppointments) {
        // Update status to processing
        updateAppointmentStatus(appointment.id, 'processing');
        
        // In a real app, you would make an API call here
        // For now, simulate successful submission
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update status to confirmed
        updateAppointmentStatus(appointment.id, 'confirmed');
      }
      
      // Clear pending appointments
      setPendingAppointments([]);
      await AsyncStorage.setItem('pendingAppointments', JSON.stringify([]));
    } catch (error) {
      console.error('Error syncing appointments:', error);
    }
  };

  // Load saved appointments
  const loadAppointments = async () => {
    try {
      const savedAppointments = await AsyncStorage.getItem('appointments');
      const savedPending = await AsyncStorage.getItem('pendingAppointments');
      
      if (savedAppointments) {
        setAppointments(JSON.parse(savedAppointments));
      }
      
      if (savedPending) {
        setPendingAppointments(JSON.parse(savedPending));
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  // Initialize when component mounts
  useEffect(() => {
    getCurrentLocation();
    loadAppointments();
  }, []);

  // Sync when connectivity changes
  useEffect(() => {
    if (network.isConnected) {
      syncPendingAppointments();
    }
  }, [network.isConnected]);

  // HTML content for the WebView map
  const generateMapHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <style>
          html, body, #map {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Initialize map
          var map = L.map('map').setView([${userLocation?.latitude || 13.0827}, ${userLocation?.longitude || 80.2707}], 11);
          
          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
          
          // Add user location marker if available
          ${userLocation ? `
            var userIcon = L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34]
            });
            
            var userMarker = L.marker([${userLocation.latitude}, ${userLocation.longitude}], {icon: userIcon})
              .addTo(map)
              .bindPopup('${t('appointments.yourLocation')}');
          ` : ''}
          
          // Add hospital markers
          var markers = {};
          ${hospitalList.map(hospital => `
            var hospitalIcon = L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34]
            });
            
            markers['${hospital.id}'] = L.marker([${hospital.latitude}, ${hospital.longitude}], {icon: hospitalIcon})
              .addTo(map)
              .bindPopup('${hospital.name}<br>${hospital.address}');
              
            markers['${hospital.id}'].on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'marker_click',
                hospital: ${JSON.stringify(hospital)}
              }));
            });
          `).join('')}
          
          // Function to focus on a marker
          function selectMarker(lat, lng) {
            map.setView([lat, lng], 14);
            ${hospitalList.map(hospital => `
              if(${hospital.latitude} === lat && ${hospital.longitude} === lng) {
                markers['${hospital.id}'].openPopup();
              }
            `).join('')}
          }
        </script>
      </body>
      </html>
    `;
  };

  // Handle WebView messages
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'marker_click') {
        selectHospital(data.hospital);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Render hospital item
  const renderHospitalItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.hospitalItem, 
        selectedHospital?.id === item.id && styles.selectedHospital
      ]}
      onPress={() => selectHospital(item)}
    >
      <View style={styles.hospitalItemContent}>
        <Text style={styles.hospitalName}>{item.name}</Text>
        <Text style={styles.hospitalAddress}>{item.address}</Text>
        <View style={styles.hospitalDetails}>
          <Text style={styles.distanceText}>
            {item.distanceText} • {item.specialties.slice(0, 2).join(', ')}
          </Text>
          <Text style={styles.operatingHours}>{item.operatingHours}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppBar 
        title={t('appointments.title')} 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4B7BEC" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      )}
      
      {/* Main content */}
      {!isLoading && (
        <View style={styles.content}>
          {/* Map container */}
          <View style={styles.mapContainer}>
            {userLocation ? (
              <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: generateMapHTML() }}
                style={styles.map}
                onMessage={handleWebViewMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
              />
            ) : (
              <View style={styles.noLocationContainer}>
                <Text style={styles.noLocationText}>
                  {locationPermission ? 
                    t('appointments.locationLoading') : 
                    t('appointments.locationPermissionRequired')}
                </Text>
                {!locationPermission && (
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={getCurrentLocation}
                  >
                    <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
          
          {/* Network status */}
          <View style={styles.networkStatusContainer}>
            <View style={[styles.networkIndicator, { 
              backgroundColor: network.isConnected ? '#4CAF50' : '#F44336' 
            }]} />
            <Text style={styles.networkStatusText}>
              {network.isConnected ? 
                t('common.onlineMode') : 
                t('common.offlineMode')}
            </Text>
            {pendingAppointments.length > 0 && (
              <Text style={styles.pendingText}>
                {t('appointments.pendingSync', {count: pendingAppointments.length})}
              </Text>
            )}
          </View>
          
          {/* Hospital list header */}
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>
              {t('appointments.nearbyHospitals')} ({hospitalList.length})
            </Text>
            <TouchableOpacity onPress={getCurrentLocation}>
              <Text style={styles.refreshText}>{t('common.refresh')}</Text>
            </TouchableOpacity>
          </View>
          
          {/* Hospital list */}
          <FlatList
            data={hospitalList}
            renderItem={renderHospitalItem}
            keyExtractor={item => item.id}
            style={styles.hospitalList}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
          
          {/* Selected hospital card */}
          {selectedHospital && (
            <View style={styles.selectedHospitalCard}>
              <View style={styles.selectedHospitalInfo}>
                <Text style={styles.selectedHospitalName}>{selectedHospital.name}</Text>
                <Text style={styles.selectedHospitalDistance}>
                  {selectedHospital.distanceText} • {selectedHospital.specialties.slice(0, 2).join(', ')}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.callButton]}
                  onPress={() => callHospital(selectedHospital.phone)}
                >
                  <Text style={styles.actionButtonText}>{t('appointments.call')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.bookButton]}
                  onPress={bookAppointment}
                >
                  <Text style={styles.actionButtonText}>{t('appointments.book')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
      
      {/* Booking form modal */}
      <Modal
        visible={showBookingForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookingForm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('appointments.bookAppointment')}</Text>
            <Text style={styles.modalSubtitle}>{selectedHospital?.name}</Text>
            
            <ScrollView style={styles.formContainer}>
              {/* Name field */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('appointments.name')}</Text>
                <TextInput
                  style={styles.input}
                  value={appointmentData.name}
                  onChangeText={(text) => setAppointmentData({...appointmentData, name: text})}
                  placeholder={t('appointments.enterName')}
                />
              </View>
              
              {/* Phone field */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('appointments.phone')}</Text>
                <TextInput
                  style={styles.input}
                  value={appointmentData.phone}
                  onChangeText={(text) => setAppointmentData({...appointmentData, phone: text})}
                  placeholder={t('appointments.enterPhone')}
                  keyboardType="phone-pad"
                />
              </View>
              
              {/* Date field */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('appointments.date')}</Text>
                <TextInput
                  style={styles.input}
                  value={appointmentData.date}
                  onChangeText={(text) => setAppointmentData({...appointmentData, date: text})}
                  placeholder={t('appointments.enterDate')}
                />
              </View>
              
              {/* Time field */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('appointments.time')}</Text>
                <TextInput
                  style={styles.input}
                  value={appointmentData.time}
                  onChangeText={(text) => setAppointmentData({...appointmentData, time: text})}
                  placeholder={t('appointments.enterTime')}
                />
              </View>
              
              {/* Reason field */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('appointments.reason')}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={appointmentData.reason}
                  onChangeText={(text) => setAppointmentData({...appointmentData, reason: text})}
                  placeholder={t('appointments.enterReason')}
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowBookingForm(false)}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={submitAppointment}
              >
                <Text style={styles.submitButtonText}>{t('common.submit')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: height * 0.35,
    width: '100%',
    backgroundColor: '#e0e0e0',
  },
  map: {
    flex: 1,
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noLocationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#4B7BEC',
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  networkStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  networkIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  networkStatusText: {
    fontSize: 12,
    color: '#666',
  },
  pendingText: {
    fontSize: 12,
    color: '#FF9800',
    marginLeft: 'auto',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  refreshText: {
    fontSize: 14,
    color: '#4B7BEC',
  },
  hospitalList: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 10,
  },
  hospitalItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedHospital: {
    borderWidth: 2,
    borderColor: '#4B7BEC',
  },
  hospitalItemContent: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  hospitalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    color: '#4B7BEC',
  },
  operatingHours: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  selectedHospitalCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedHospitalInfo: {
    marginBottom: 12,
  },
  selectedHospitalName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedHospitalDistance: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  callButton: {
    backgroundColor: '#FF9800',
  },
  bookButton: {
    backgroundColor: '#4B7BEC',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: height * 0.8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  formContainer: {
    maxHeight: height * 0.5,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4B7BEC',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AppointmentsScreen;