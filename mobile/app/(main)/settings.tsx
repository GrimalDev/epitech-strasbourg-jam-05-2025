import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Informations utilisateur */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations personnelles</Text>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Pseudo</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
            value={username}
            onChangeText={setUsername}
            editable={isEditing}
            placeholder="Votre pseudo"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
            value={email}
            onChangeText={setEmail}
            editable={isEditing}
            placeholder="Votre email"
            placeholderTextColor={colors.textLight}
            keyboardType="email-address"
          />
        </View>

        {isEditing && (
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Nouveau mot de passe</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Nouveau mot de passe"
              placeholderTextColor={colors.textLight}
              secureTextEntry
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={isEditing ? handleSave : () => setIsEditing(true)}
        >
          <Text style={styles.buttonText}>{isEditing ? 'Enregistrer' : 'Modifier'}</Text>
        </TouchableOpacity>
      </View>

      {/* Préférences */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Préférences</Text>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <MaterialCommunityIcons name="bell" size={24} color={colors.text} />
            <Text style={[styles.preferenceLabel, { color: colors.text }]}>Notifications</Text>
          </View>
          <Switch
            value={preferences.notifications}
            onValueChange={toggleNotifications}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <MaterialCommunityIcons name="theme-light-dark" size={24} color={colors.text} />
            <Text style={[styles.preferenceLabel, { color: colors.text }]}>Mode sombre</Text>
          </View>
          <Switch
            value={preferences.darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      {/* Déconnexion */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.card }]}
        onPress={handleLogout}
      >
        <MaterialCommunityIcons name="logout" size={24} color={colors.text} />
        <Text style={[styles.logoutText, { color: colors.text }]}>Déconnexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: SIZES.inputHeight,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: SIZES.buttonHeight,
    borderRadius: SIZES.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  preferenceText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: SIZES.borderRadius,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 