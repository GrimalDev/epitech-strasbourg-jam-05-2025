import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';

// Palette de couleurs
const COLORS = {
  primary: '#2C5F2D',    // Vert foncé pour les éléments principaux
  secondary: '#97BC62',  // Vert clair pour les éléments secondaires
  background: '#F5F5F5', // Gris très clair pour le fond
  text: '#1A1A1A',      // Noir pour le texte principal
  light: '#FFFFFF',     // Blanc pour les cartes
  accent: '#97BC62',    // Vert clair pour les accents
  error: '#E57373',     // Rouge pour les erreurs
};

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [location, setLocation] = useState(true);

  return (
    <View className="flex-1 bg-[#F5F5F5] p-4">
      {/* Account Settings */}
      <View className="mb-8">
        <Text className="text-lg font-bold text-[#2C5F2D] mb-4">Account Settings</Text>
        <View className="space-y-4">
          <TouchableOpacity 
            className="flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm"
          >
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="account-edit" size={24} color={COLORS.primary} />
              <Text className="ml-4 text-base text-[#1A1A1A]">Edit Profile</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm"
          >
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="lock" size={24} color={COLORS.primary} />
              <Text className="ml-4 text-base text-[#1A1A1A]">Change Password</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* App Settings */}
      <View className="mb-8">
        <Text className="text-lg font-bold text-[#2C5F2D] mb-4">App Settings</Text>
        <View className="space-y-4">
          <View className="flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="bell" size={24} color={COLORS.primary} />
              <Text className="ml-4 text-base text-[#1A1A1A]">Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: COLORS.primary }}
              thumbColor={notifications ? COLORS.secondary : '#f4f3f4'}
            />
          </View>

          <View className="flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="theme-light-dark" size={24} color={COLORS.primary} />
              <Text className="ml-4 text-base text-[#1A1A1A]">Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#767577', true: COLORS.primary }}
              thumbColor={darkMode ? COLORS.secondary : '#f4f3f4'}
            />
          </View>

          <View className="flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="map-marker" size={24} color={COLORS.primary} />
              <Text className="ml-4 text-base text-[#1A1A1A]">Location Services</Text>
            </View>
            <Switch
              value={location}
              onValueChange={setLocation}
              trackColor={{ false: '#767577', true: COLORS.primary }}
              thumbColor={location ? COLORS.secondary : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      {/* Support */}
      <View>
        <Text className="text-lg font-bold text-[#2C5F2D] mb-4">Support</Text>
        <View className="space-y-4">
          <TouchableOpacity 
            className="flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm"
          >
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="help-circle" size={24} color={COLORS.primary} />
              <Text className="ml-4 text-base text-[#1A1A1A]">Help & Support</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm"
          >
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="information" size={24} color={COLORS.primary} />
              <Text className="ml-4 text-base text-[#1A1A1A]">About</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
} 