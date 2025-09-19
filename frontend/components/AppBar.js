import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, SafeAreaView } from 'react-native';
import LanguageIcon from './LanguageIcon';

/**
 * A reusable app bar component that displays the current screen name and action buttons
 * 
 * @param {string} title - The title to display in the app bar
 * @param {function} onBackPress - Optional function to call when back button is pressed
 * @param {function} onMenuPress - Optional function to call when menu button is pressed
 * @param {boolean} showBackButton - Whether to show the back button (default: false)
 * @param {boolean} showMenuButton - Whether to show the menu button (default: false)
 * @param {boolean} showLanguageIcon - Whether to show the language icon (default: true)
 * @param {React.ReactNode} rightContent - Optional content to display on the right side of the app bar
 * @param {object} style - Additional styles to apply to the app bar container
 */
const AppBar = ({ 
  title, 
  onBackPress, 
  onMenuPress,
  showBackButton = false,
  showMenuButton = false,
  showLanguageIcon = true,
  rightContent,
  style 
}) => {
  // Get the status bar height for different platforms
  const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
  
  return (
    <View style={[styles.container, style]}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#4B7BEC"
        translucent={true}
      />
      
      {/* Add a spacer with the height of the status bar */}
      <View style={{ height: STATUS_BAR_HEIGHT }} />
      
      <View style={styles.appBarContent}>
        <View style={styles.leftSection}>
          {showMenuButton && (
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={onMenuPress}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <View style={styles.menuIconLine} />
              <View style={styles.menuIconLine} />
              <View style={styles.menuIconLine} />
            </TouchableOpacity>
          )}
          
          {showBackButton && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={onBackPress}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}
          
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        </View>
        
        <View style={styles.rightSection}>
          {showLanguageIcon && <LanguageIcon />}
          {rightContent}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4B7BEC',
    width: '100%',
  },
  appBarContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 16,
    padding: 4,
    width: 24,
    height: 24,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  menuIconLine: {
    width: '100%',
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    maxWidth: 200,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default AppBar;