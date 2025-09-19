import React, { createContext, useState, useContext, useCallback } from 'react';

// Create navigation context
const NavigationContext = createContext();

/**
 * Navigation context provider to handle custom drawer state
 */
export const NavigationProvider = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Toggle drawer state with useCallback to prevent unnecessary re-renders
  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen(prevState => !prevState);
  }, []);
  
  // Open drawer with useCallback
  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);
  
  // Close drawer with useCallback
  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    isDrawerOpen,
    toggleDrawer,
    openDrawer,
    closeDrawer,
  }), [isDrawerOpen, toggleDrawer, openDrawer, closeDrawer]);
  
  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

// Custom hook to use navigation context
export const useNavigation = () => useContext(NavigationContext);