import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Dimensions,
  RefreshControl
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import AppBar from '../../components/AppBar';
import HospitalService from '../../services/HospitalService';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const HospitalSelectionScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [hospitalTypes, setHospitalTypes] = useState([]);
  
  // Get callback function from navigation params if selecting for appointment
  const { onHospitalSelect, title = 'Select Hospital' } = route.params || {};

  useEffect(() => {
    initializeScreen();
  }, []);

  useEffect(() => {
    filterHospitals();
  }, [searchQuery, selectedDistrict, selectedType, hospitals]);

  const initializeScreen = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadHospitals(),
        getUserLocation(),
        loadHospitalStats()
      ]);
    } catch (error) {
      console.error('Error initializing screen:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHospitals = async () => {
    try {
      const result = await HospitalService.getAllHospitals({
        limit: 200, // Get more hospitals
        sortBy: 'name',
        sortOrder: 'asc'
      });

      if (result.success && result.data && result.data.hospitals) {
        let hospitalsWithCoordinates = result.data.hospitals.filter(hospital => 
          hospital && 
          hospital.coordinates && 
          hospital.coordinates.lat && 
          hospital.coordinates.lon &&
          hospital.hospital_id
        );

        // If we have user location, calculate distances
        if (userLocation) {
          hospitalsWithCoordinates = calculateDistances(hospitalsWithCoordinates);
        }

        setHospitals(hospitalsWithCoordinates);
        setFilteredHospitals(hospitalsWithCoordinates);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error loading hospitals:', error);
      Alert.alert(
        t('common.error'),
        error.message || t('appointments.errorLoadingHospitals')
      );
    }
  };

  const loadHospitalStats = async () => {
    try {
      const result = await HospitalService.getHospitalStats();
      if (result.success && result.data) {
        const districtList = (result.data.hospitalsByDistrict || []).map(item => ({
          label: item._id || 'Unknown',
          value: item._id || 'unknown',
          count: item.count || 0
        }));
        
        const typeList = (result.data.hospitalsByType || []).map(item => ({
          label: item._id || 'Unknown',
          value: item._id || 'unknown',
          count: item.count || 0
        }));

        setDistricts(districtList);
        setHospitalTypes(typeList);
      }
    } catch (error) {
      console.error('Error loading hospital stats:', error);
    }
  };

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      // Don't show error as location is optional for hospital selection
    }
  };

  const calculateDistances = (hospitalList) => {
    if (!userLocation) return hospitalList;

    return hospitalList.map(hospital => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        hospital.coordinates.lat,
        hospital.coordinates.lon
      );

      return {
        ...hospital,
        distance,
        distanceText: distance < 1 ? 
          `${Math.round(distance * 1000)} m` : 
          `${distance.toFixed(1)} km`
      };
    }).sort((a, b) => a.distance - b.distance);
  };

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
    return R * c;
  };

  const filterHospitals = () => {
    let filtered = [...hospitals];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by district
    if (selectedDistrict) {
      filtered = filtered.filter(hospital =>
        hospital.district.toLowerCase() === selectedDistrict.toLowerCase()
      );
    }

    // Filter by type
    if (selectedType) {
      filtered = filtered.filter(hospital =>
        hospital.type.toLowerCase() === selectedType.toLowerCase()
      );
    }

    setFilteredHospitals(filtered);
  };

  const handleHospitalSelect = (hospital) => {
    if (onHospitalSelect) {
      // If called from appointment booking, pass the hospital back
      onHospitalSelect(hospital);
      navigation.goBack();
    } else {
      // Show hospital details
      showHospitalDetails(hospital);
    }
  };

  const showHospitalDetails = (hospital) => {
    Alert.alert(
      hospital.name,
      `District: ${hospital.district}\nType: ${hospital.type}\nBed Capacity: ${hospital.bed_capacity}\n${hospital.distance ? `Distance: ${hospital.distanceText}` : ''}`,
      [
        {
          text: 'Book Appointment',
          onPress: () => {
            // Navigate to appointment booking with this hospital
            navigation.navigate('Appointments', { selectedHospital: hospital });
          }
        },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHospitals();
    setRefreshing(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDistrict('');
    setSelectedType('');
  };

  const renderFilterChips = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity 
          style={[styles.filterChip, !selectedDistrict && !selectedType && !searchQuery && styles.activeChip]}
          onPress={clearFilters}
        >
          <Text style={styles.chipText}>All</Text>
        </TouchableOpacity>
        
        {districts.map((district) => (
          <TouchableOpacity
            key={district.value}
            style={[styles.filterChip, selectedDistrict === district.value && styles.activeChip]}
            onPress={() => setSelectedDistrict(selectedDistrict === district.value ? '' : district.value)}
          >
            <Text style={styles.chipText}>{district.label} ({district.count})</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeFilters}>
        {hospitalTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[styles.filterChip, selectedType === type.value && styles.activeChip]}
            onPress={() => setSelectedType(selectedType === type.value ? '' : type.value)}
          >
            <Text style={styles.chipText}>{type.label} ({type.count})</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderHospitalItem = ({ item: hospital }) => (
    <TouchableOpacity style={styles.hospitalCard} onPress={() => handleHospitalSelect(hospital)}>
      <View style={styles.hospitalHeader}>
        <Text style={styles.hospitalName} numberOfLines={2}>{hospital.name}</Text>
        {hospital.distanceText && (
          <Text style={styles.distanceText}>{hospital.distanceText}</Text>
        )}
      </View>
      
      <View style={styles.hospitalDetails}>
        <Text style={styles.hospitalDistrict}>{hospital.district}</Text>
        <Text style={styles.hospitalType}>{hospital.type}</Text>
      </View>
      
      <View style={styles.hospitalStats}>
        <Text style={styles.statText}>Beds: {hospital.bed_capacity}</Text>
        <Text style={styles.statText}>Monthly Capacity: {hospital.monthly_capacity}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppBar
          title={title}
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4B7BEC" />
          <Text style={styles.loadingText}>{t('appointments.loadingHospitals')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppBar
        title={title}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search') + ' hospitals...'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Chips */}
        {renderFilterChips()}

        {/* Results Counter */}
        <Text style={styles.resultsText}>
          {filteredHospitals.length} hospital{filteredHospitals.length !== 1 ? 's' : ''} found
        </Text>

        {/* Hospital List */}
        <FlatList
          data={filteredHospitals}
          keyExtractor={(item) => item.hospital_id}
          renderItem={renderHospitalItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hospitals found</Text>
              <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
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
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  typeFilters: {
    marginTop: 8,
  },
  filterChip: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeChip: {
    backgroundColor: '#4B7BEC',
    borderColor: '#4B7BEC',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  hospitalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hospitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  hospitalName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  distanceText: {
    fontSize: 14,
    color: '#4B7BEC',
    fontWeight: '600',
  },
  hospitalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  hospitalDistrict: {
    fontSize: 14,
    color: '#666',
  },
  hospitalType: {
    fontSize: 14,
    color: '#4B7BEC',
    fontWeight: '600',
  },
  hospitalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4B7BEC',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HospitalSelectionScreen;