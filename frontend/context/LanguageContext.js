import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the language context
const LanguageContext = createContext();

// Available languages
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'hi', name: 'हिन्दी' }
];

// Provider component
export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  // Change language function
  const changeLanguage = async (languageCode) => {
    try {
      // Change language in i18n
      await i18n.changeLanguage(languageCode);
      
      // Update state
      setCurrentLanguage(languageCode);
      
      // Store in AsyncStorage
      await AsyncStorage.setItem('user-language', languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Load saved language on mount
  useEffect(() => {
    const loadStoredLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('user-language');
        
        if (storedLanguage && storedLanguage !== currentLanguage) {
          changeLanguage(storedLanguage);
        }
      } catch (error) {
        console.error('Error loading stored language:', error);
      }
    };

    loadStoredLanguage();
  }, []);

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};