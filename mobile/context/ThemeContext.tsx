import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { COLORS } from '../constants/theme';

interface UserPreferences {
  username: string;
  email: string;
  notifications: boolean;
  darkMode: boolean;
}

interface ThemeContextType {
  isDarkMode: boolean;
  colors: typeof COLORS.light | typeof COLORS.dark;
  preferences: UserPreferences;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  updateUserInfo: (data: Partial<UserPreferences>) => void;
  logout: () => void;
}

const defaultPreferences: UserPreferences = {
  username: 'Explorateur42',
  email: 'explorateur@example.com',
  notifications: true,
  darkMode: false,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedPreferences = await AsyncStorage.getItem('userPreferences');
      if (savedPreferences) {
        const parsedPreferences = JSON.parse(savedPreferences);
        setPreferences(parsedPreferences);
        setIsDarkMode(parsedPreferences.darkMode);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
    }
  };

  const savePreferences = async (newPreferences: UserPreferences) => {
    try {
      await AsyncStorage.setItem('userPreferences', JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    const newPreferences = { ...preferences, darkMode: newDarkMode };
    setPreferences(newPreferences);
    savePreferences(newPreferences);
  };

  const toggleNotifications = () => {
    const newPreferences = { ...preferences, notifications: !preferences.notifications };
    setPreferences(newPreferences);
    savePreferences(newPreferences);
  };

  const updateUserInfo = (data: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...data };
    setPreferences(newPreferences);
    savePreferences(newPreferences);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userPreferences');
      setPreferences(defaultPreferences);
      setIsDarkMode(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        colors,
        preferences,
        toggleDarkMode,
        toggleNotifications,
        updateUserInfo,
        logout,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 