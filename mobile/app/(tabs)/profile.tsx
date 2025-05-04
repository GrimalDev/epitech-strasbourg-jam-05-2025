import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

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

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-[#F5F5F5] p-4">
      {/* Header */}
      <View className="items-center mb-8">
        <Image
          source={require('../../assets/images/logo.png')}
          className="w-32 h-32 rounded-full mb-4"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-[#2C5F2D]">John Doe</Text>
        <Text className="text-base text-[#1A1A1A]">john.doe@example.com</Text>
      </View>

      {/* Stats */}
      <View className="flex-row justify-around mb-8">
        <View className="items-center">
          <Text className="text-2xl font-bold text-[#2C5F2D]">12</Text>
          <Text className="text-base text-[#1A1A1A]">Trips</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-[#2C5F2D]">8</Text>
          <Text className="text-base text-[#1A1A1A]">Codes</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-[#2C5F2D]">4</Text>
          <Text className="text-base text-[#1A1A1A]">Friends</Text>
        </View>
      </View>

      {/* Actions */}
      <View className="space-y-4">
        <TouchableOpacity 
          className="flex-row items-center bg-white p-4 rounded-xl shadow-sm"
          onPress={() => router.push('/settings')}
        >
          <MaterialCommunityIcons name="cog" size={24} color={COLORS.primary} />
          <Text className="ml-4 text-base text-[#1A1A1A]">Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center bg-white p-4 rounded-xl shadow-sm"
          onPress={() => router.push('/help')}
        >
          <MaterialCommunityIcons name="help-circle" size={24} color={COLORS.primary} />
          <Text className="ml-4 text-base text-[#1A1A1A]">Help & Support</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center bg-white p-4 rounded-xl shadow-sm"
          onPress={() => router.push('/about')}
        >
          <MaterialCommunityIcons name="information" size={24} color={COLORS.primary} />
          <Text className="ml-4 text-base text-[#1A1A1A]">About</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center bg-white p-4 rounded-xl shadow-sm"
          onPress={() => router.push('/logout')}
        >
          <MaterialCommunityIcons name="logout" size={24} color={COLORS.error} />
          <Text className="ml-4 text-base text-[#E57373]">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 