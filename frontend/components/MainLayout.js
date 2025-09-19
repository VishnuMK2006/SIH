import React, { useEffect } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { useNavigation } from '../context/NavigationContext';
import SideMenu from './SideMenu';

/**
 * Main layout component that includes the SideMenu
 */
const MainLayout = ({ children, navigation }) => {
  const { isDrawerOpen, closeDrawer } = useNavigation();
  
  // Handle back button press to close drawer if open
  useEffect(() => {
    const backAction = () => {
      if (isDrawerOpen) {
        closeDrawer();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [isDrawerOpen, closeDrawer]);
  
  return (
    <View style={styles.container}>
      {children}
      
      <SideMenu 
        navigation={navigation}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainLayout;