import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

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

const settings = [
  {
    icon: 'account' as const,
    title: 'Compte',
    items: [
      { icon: 'account-edit' as const, label: 'Modifier le profil', value: 'John Doe' },
      { icon: 'email' as const, label: 'Email', value: 'john.doe@example.com' },
      { icon: 'phone' as const, label: 'Téléphone', value: '+33 6 12 34 56 78' },
    ],
  },
  {
    icon: 'bell' as const,
    title: 'Notifications',
    items: [
      { icon: 'bell-ring' as const, label: 'Notifications push', value: 'Activées' },
      { icon: 'email' as const, label: 'Notifications email', value: 'Activées' },
      { icon: 'map-marker' as const, label: 'Alertes géolocalisation', value: 'Activées' },
    ],
  },
  {
    icon: 'shield' as const,
    title: 'Sécurité',
    items: [
      { icon: 'lock' as const, label: 'Mot de passe', value: '••••••••' },
      { icon: 'fingerprint' as const, label: 'Authentification biométrique', value: 'Activée' },
      { icon: 'devices' as const, label: 'Appareils connectés', value: '2 appareils' },
    ],
  },
  {
    icon: 'help-circle' as const,
    title: 'Aide et support',
    items: [
      { icon: 'information' as const, label: 'À propos', value: 'Version 1.0.0' },
      { icon: 'help' as const, label: 'Centre d\'aide', value: 'Visiter' },
      { icon: 'email' as const, label: 'Nous contacter', value: 'support@travelroot.com' },
    ],
  },
];

export default function SettingsScreen() {
  const { colors, preferences, toggleDarkMode, toggleNotifications, updateUserInfo, logout } = useTheme();
  const [username, setUsername] = useState(preferences.username);
  const [email, setEmail] = useState(preferences.email);
  const [password, setPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    if (username.trim() === '' || email.trim() === '') {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    updateUserInfo({
      username: username.trim(),
      email: email.trim(),
    });

    if (password.trim() !== '') {
      // Ici, vous devrez implémenter la logique de changement de mot de passe
      Alert.alert('Succès', 'Mot de passe changé avec succès');
      setPassword('');
    }

    setIsEditing(false);
    Alert.alert('Succès', 'Informations mises à jour avec succès');
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Account Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <MaterialCommunityIcons name="account" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Edit Profile</Text>
            <Text style={styles.settingDescription}>Change your photo and information</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <MaterialCommunityIcons name="lock" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Security</Text>
            <Text style={styles.settingDescription}>Change password</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <MaterialCommunityIcons name="bell" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>Receive notifications</Text>
          </View>
          <Switch
            trackColor={{ false: '#767577', true: COLORS.secondary }}
            thumbColor={COLORS.primary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <MaterialCommunityIcons name="email" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Email Notifications</Text>
            <Text style={styles.settingDescription}>Receive emails</Text>
          </View>
          <Switch
            trackColor={{ false: '#767577', true: COLORS.secondary }}
            thumbColor={COLORS.primary}
          />
        </View>
      </View>

      {/* Privacy Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <MaterialCommunityIcons name="eye" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Public Profile</Text>
            <Text style={styles.settingDescription}>Make your profile visible</Text>
          </View>
          <Switch
            trackColor={{ false: '#767577', true: COLORS.secondary }}
            thumbColor={COLORS.primary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <MaterialCommunityIcons name="map-marker" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Location Sharing</Text>
            <Text style={styles.settingDescription}>Allow position tracking</Text>
          </View>
          <Switch
            trackColor={{ false: '#767577', true: COLORS.secondary }}
            thumbColor={COLORS.primary}
          />
        </View>
      </View>

      {/* Help Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Help</Text>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <MaterialCommunityIcons name="help-circle" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Help Center</Text>
            <Text style={styles.settingDescription}>FAQ and support</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <MaterialCommunityIcons name="information" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>About</Text>
            <Text style={styles.settingDescription}>Version and information</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  sectionCard: {
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.7,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: COLORS.light,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
}); 