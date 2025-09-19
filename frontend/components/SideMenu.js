import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  TouchableWithoutFeedback,
  Dimensions,
  BackHandler,
  Platform
} from 'react-native';
import DrawerContent from './DrawerContent';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.8;

/**
 * Custom side menu component with animation that avoids the sticking issue
 */
const SideMenu = ({ navigation, isOpen, onClose }) => {
  // Animation values
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);
  
  // Handle animations
  useEffect(() => {
    // When drawer should be open
    if (isOpen) {
      setVisible(true); // Make component visible first
      
      // Then start animations
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
      
      // Handle back button press to close the drawer
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (isOpen) {
            onClose();
            return true;
          }
          return false;
        }
      );
      
      return () => backHandler.remove();
    } 
    // When drawer should be closed
    else if (visible) {
      // Start animations
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start(({ finished }) => {
        // Only hide after animation finishes
        if (finished) {
          setVisible(false);
        }
      });
    }
  }, [isOpen]);
  
  // Don't render anything if not visible
  if (!visible && !isOpen) {
    return null;
  }
  
  return (
    <View style={styles.container} pointerEvents={visible ? "auto" : "none"}>
      {/* Background overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>
      
      {/* Drawer content */}
      <Animated.View 
        style={[
          styles.drawer, 
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        <DrawerContent 
          navigation={navigation} 
          closeDrawer={onClose} 
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  }
});

export default SideMenu;