import React, { useState } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet,
  Modal,
  FlatList,
  Text,
  SafeAreaView
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

const LanguageIcon = ({ style }) => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);

  // Get current language code to display
  const getCurrentLanguageCode = () => {
    return currentLanguage.toUpperCase();
  };

  // Handle language selection
  const handleSelectLanguage = (languageCode) => {
    changeLanguage(languageCode);
    setModalVisible(false);
  };

  // Render language item
  const renderLanguageItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        currentLanguage === item.code && styles.selectedLanguageItem
      ]}
      onPress={() => handleSelectLanguage(item.code)}
    >
      <Text style={[
        styles.languageText,
        currentLanguage === item.code && styles.selectedLanguageText
      ]}>
        {t(`languages.${item.code}`)}
      </Text>
      {item.code === currentLanguage && (
        <View style={styles.checkmark} />
      )}
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity
        style={[styles.iconButton, style]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.iconText}>{getCurrentLanguageCode()}</Text>
      </TouchableOpacity>

      {/* Language Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{t('common.language')}</Text>
            
            <FlatList
              data={LANGUAGES}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.code}
              style={styles.languageList}
            />
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4B7BEC',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  iconText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  languageList: {
    width: '100%',
    maxHeight: 250,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedLanguageItem: {
    backgroundColor: '#f0f7ff',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLanguageText: {
    fontWeight: 'bold',
    color: '#4B7BEC',
  },
  checkmark: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4B7BEC',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#333',
  },
});

export default LanguageIcon;