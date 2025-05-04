import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const LEVEL_POINTS = [50, 100, 150, 200, 250];

const GEOBOXES = [
  {
    id: 'HCBX-001',
    title: 'HackBox #001',
    difficulty: 1, // 1 à 5
    tags: ['crypto'],
    description: 'A basic cryptography challenge to test your skills in decoding classical ciphers.',
    coords: { latitude: 48.8566, longitude: 2.3522 }, // Paris
    address: 'Paris, France',
    wifi: { password: 'h4ck1ngF0rFun' },
    slots: [
      { start: '09:00', end: '10:30', reserved: false },
      { start: '10:30', end: '12:00', reserved: true },
      { start: '13:00', end: '14:30', reserved: false },
      { start: '14:30', end: '16:00', reserved: false },
    ],
    timeLeft: 5188, // en secondes (1h26:28)
  },
  {
    id: 'HCBX-002',
    title: 'HackBox #002',
    difficulty: 2,
    tags: ['web'],
    description: 'A web challenge to test your skills in XSS and CSRF.',
    coords: { latitude: 48.8584, longitude: 2.2945 }, // Tour Eiffel
    address: 'Tour Eiffel, Paris',
    wifi: { password: 'web4life' },
    slots: [
      { start: '09:00', end: '10:30', reserved: false },
      { start: '10:30', end: '12:00', reserved: false },
      { start: '13:00', end: '14:30', reserved: true },
      { start: '14:30', end: '16:00', reserved: false },
    ],
    timeLeft: 5400,
  },
  {
    id: 'HCBX-003',
    title: 'HackBox #003',
    difficulty: 3,
    tags: ['reverse'],
    description: 'Reverse engineering challenge on a custom binary.',
    coords: { latitude: 48.8606, longitude: 2.3376 }, // Louvre
    address: 'Louvre, Paris',
    wifi: { password: 'rev3rseIt' },
    slots: [
      { start: '09:00', end: '10:30', reserved: true },
      { start: '10:30', end: '12:00', reserved: false },
      { start: '13:00', end: '14:30', reserved: false },
      { start: '14:30', end: '16:00', reserved: false },
    ],
    timeLeft: 3600,
  },
  {
    id: 'HCBX-004',
    title: 'HackBox #004',
    difficulty: 1,
    tags: ['crypto'],
    description: 'Déchiffrez le message caché pour trouver le flag.',
    coords: { latitude: 48.5836, longitude: 7.7492 }, // 4 rue du Dôme, Strasbourg (coordonnées corrigées)
    address: '4 rue du Dôme, Strasbourg',
    wifi: { password: 'str4sb0urg' },
    slots: [
      { start: '09:00', end: '10:30', reserved: false },
      { start: '10:30', end: '12:00', reserved: false },
      { start: '13:00', end: '14:30', reserved: true },
      { start: '14:30', end: '16:00', reserved: false },
    ],
    timeLeft: 5400,
  },
  {
    id: 'HCBX-005',
    title: 'HackBox #005',
    difficulty: 3,
    tags: ['crypto'],
    description: 'Un challenge de cryptographie à résoudre sur la place Kléber.',
    coords: { latitude: 48.5846, longitude: 7.7468 }, // Place Kléber, Strasbourg
    address: 'Place Kléber, Strasbourg',
    wifi: { password: 'kl3b3rflag' },
    slots: [
      { start: '09:00', end: '10:30', reserved: false },
      { start: '10:30', end: '12:00', reserved: false },
      { start: '13:00', end: '14:30', reserved: false },
      { start: '14:30', end: '16:00', reserved: false },
    ],
    timeLeft: 5400,
  },
];

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

function formatTimeLeft(seconds: number) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatSlotFr(start: string, end: string) {
  // start et end sont au format 'HH:MM'
  const [h1, m1] = start.split(':');
  const [h2, m2] = end.split(':');
  return `De ${h1}h${m1} à ${h2}h${m2}`;
}

// Ajout d'un utilitaire pour comparer l'heure actuelle à l'heure de début du slot
function isSlotStartReached(slotStart: string) {
  const now = new Date();
  const [h, m] = slotStart.split(':');
  const slotDate = new Date(now);
  slotDate.setHours(Number(h), Number(m), 0, 0);
  return now >= slotDate;
}

// Fonction utilitaire pour décaler un point si trop proche de la position utilisateur
function offsetIfNearUser(spot, userLoc) {
  if (!userLoc) return spot;
  const dist = Math.sqrt(
    Math.pow(spot.latitude - userLoc.latitude, 2) +
    Math.pow(spot.longitude - userLoc.longitude, 2)
  );
  if (dist < 0.0005) {
    // Décale légèrement le spot vers le nord
    return { ...spot, latitude: spot.latitude + 0.0007 };
  }
  return spot;
}

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedBox, setSelectedBox] = useState<typeof GEOBOXES[0] | null>(null);
  const [flagInput, setFlagInput] = useState('');
  const [reservedSlot, setReservedSlot] = useState<number | null>(null);
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number | null>(null);
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<MapView>(null);
  const [flagError, setFlagError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission d\'accès à la localisation refusée');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  // Centrage dynamique sur la position utilisateur
  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  }, [location]);

  // Réservation d'un slot et notification
  const handleReserveSlot = async (idx: number) => {
    setReservedSlot(idx);
    setCurrentSlotIndex(idx);
    setChallengeStarted(false);
    if (selectedBox) {
      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'TravelRoot',
          body: `Votre créneau pour ${selectedBox.title} commence maintenant !`,
        },
        trigger: { seconds: 2, repeats: false, type: 'timeInterval' },
      });
      setNotificationId(notifId as string);
    }
  };

  // Commencer le challenge
  const handleStartChallenge = () => {
    setChallengeStarted(true);
    if (selectedBox) {
      setTimer(selectedBox.timeLeft ?? 5400);
    }
  };

  // Décompte du timer
  useEffect(() => {
    if (challengeStarted && timer !== null && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [challengeStarted]);

  useEffect(() => {
    if (timer === 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [timer]);

  // Fonction d'annulation de réservation
  const handleCancelReservation = () => {
    setReservedSlot(null);
    setCurrentSlotIndex(null);
    setChallengeStarted(false);
    setTimer(null);
  };

  // Soumission du flag
  const handleSubmitFlag = () => {
    // Pour la démo, on considère que le flag correct est 'flag{root}'
    if (flagInput.trim() !== 'flag{root}') {
      setFlagError('Ce n\'est pas le bon flag.');
      return;
    }
    setFlagError(null);
    Alert.alert('Bravo !', 'Flag correct, challenge validé !');
  };

  const initialRegion = {
    latitude: 48.5846, // Centré sur Strasbourg
    longitude: 7.7468,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 48.5846,
          longitude: 7.7468,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation
        showsMyLocationButton
        zoomEnabled={true}
      >
        {GEOBOXES.map((box, idx) => {
          const isDone = reservedSlot !== null && challengeStarted && selectedBox?.id === box.id;
          return (
            <Marker
              key={box.id}
              coordinate={box.coords}
              onPress={() => setSelectedBox(box)}
              tracksViewChanges={true}
              zIndex={999}
            >
              <View style={styles.markerContainer}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={30}
                  color={isDone ? COLORS.error : COLORS.primary}
                />
              </View>
            </Marker>
          );
        })}
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            zIndex={1}
          >
            <View style={styles.markerContainer}>
              <MaterialCommunityIcons 
                name="account-circle" 
                size={30} 
                color={COLORS.primary}
              />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Modal fiche challenge responsive */}
      <Modal visible={!!selectedBox} animationType="slide" transparent onRequestClose={() => setSelectedBox(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
              {selectedBox && (
                <>
                  {/* Bloc challenge */}
                  <View style={styles.challengeCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <View style={styles.statusDot} />
                      <Text style={styles.challengeTitle}>{selectedBox.title}</Text>
                    </View>
                    {/* Barre de niveau */}
                    <View style={styles.levelBarRow}>
                      {[1,2,3,4,5].map((lvl) => (
                        <View
                          key={lvl}
                          style={[styles.levelDot, lvl <= selectedBox.difficulty ? styles.levelDotActive : styles.levelDotInactive]}
                        />
                      ))}
                      <Text style={styles.levelPoints}>{LEVEL_POINTS[selectedBox.difficulty-1]} pts</Text>
                    </View>
                    <View style={styles.tagsRow}>
                      {selectedBox.tags.map((tag) => (
                        <Text key={tag} style={styles.tag}>{tag}</Text>
                      ))}
                    </View>
                    <Text style={styles.challengeDesc}>{selectedBox.description}</Text>
                    <Text style={styles.challengeCoords}>📍 {selectedBox.coords.latitude}, {selectedBox.coords.longitude}</Text>
                  </View>

                  {/* Bloc WiFi + timer */}
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>WiFi Connection</Text>
                    <View style={styles.wifiRow}>
                      <View style={styles.wifiCol}>
                        <Text style={styles.wifiLabel}>SSID</Text>
                        <Text style={styles.wifiValue}>{`spot_${selectedBox.id}`}</Text>
                      </View>
                      <View style={styles.wifiCol}>
                        <Text style={styles.wifiLabel}>Password</Text>
                        <Text style={styles.wifiValue}>{selectedBox.wifi.password}</Text>
                      </View>
                    </View>
                    <View style={styles.timerRow}>
                      <MaterialCommunityIcons name="clock-outline" size={18} color="#fff" style={{ marginRight: 4 }} />
                      <Text style={styles.timerLabel}>Time remaining:</Text>
                      <Text style={styles.timerValue}>{formatTimeLeft(challengeStarted && timer !== null ? timer : (selectedBox.timeLeft ?? 0))}</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${((selectedBox.timeLeft ?? 0) / 5400) * 100}%` }]} />
                    </View>
                  </View>

                  {/* Bloc soumission flag */}
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Submit Flag</Text>
                    <Text style={styles.flagLabel}>Flag from challenge:</Text>
                    <TextInput
                      style={styles.flagInput}
                      value={flagInput}
                      onChangeText={setFlagInput}
                      placeholder="flag{...}"
                      placeholderTextColor="#888"
                    />
                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitFlag}>
                      <Text style={styles.submitBtnText}>Submit Flag</Text>
                    </TouchableOpacity>
                    {flagError && (
                      <Text style={{ color: COLORS.error, marginTop: 4, textAlign: 'center' }}>{flagError}</Text>
                    )}
                    <Text style={styles.flagHelp}>Connect to the hackbox WiFi, solve the challenge, and submit the flag to complete this challenge</Text>
                  </View>

                  {/* Créneaux de réservation */}
                  <View style={styles.sectionCard}>
                    <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>Available Time Slots</Text>
                    <Text style={styles.slotHelp}>Réservez votre créneau de 1h30. Les créneaux déjà réservés sont indiqués.</Text>
                    {selectedBox.slots.map((slot, idx) => {
                      const isMine = reservedSlot === idx;
                      return (
                        <View key={idx} style={styles.slotRow}>
                          <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.secondary} style={{ marginRight: 8 }} />
                          <Text style={styles.slotTime}>{formatSlotFr(slot.start, slot.end)}</Text>
                          {slot.reserved && !isMine ? (
                            <View style={styles.slotBadgeBooked}>
                              <Text style={styles.slotBadgeBookedText}>Réservé</Text>
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={isMine ? [styles.slotBtnReserve, styles.slotBtnAnnuler] : styles.slotBtnReserve}
                              onPress={() => isMine ? handleCancelReservation() : handleReserveSlot(idx)}
                            >
                              <Text style={isMine ? styles.slotBtnAnnulerText : styles.slotBtnReserveText}>
                                {isMine ? 'Annuler' : 'Reserve'}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                    {/* Bouton Commencer le challenge */}
                    {reservedSlot !== null && isSlotStartReached(selectedBox.slots[reservedSlot].start) && !challengeStarted && (
                      <TouchableOpacity style={styles.startBtn} onPress={handleStartChallenge}>
                        <Text style={styles.startBtnText}>Commencer le challenge</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedBox(null)}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Fermer</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: COLORS.background,
    padding: 5,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#181A20',
    borderRadius: 14,
    padding: 8,
    width: SCREEN_WIDTH * 0.95,
    maxHeight: SCREEN_HEIGHT * 0.8,
    alignSelf: 'center',
  },
  challengeCard: {
    backgroundColor: '#23242a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3CB371',
    marginRight: 8,
  },
  challengeTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
    justifyContent: 'flex-start',
  },
  difficulty: {
    backgroundColor: '#2ECC40',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    fontWeight: 'bold',
    fontSize: 13,
  },
  tag: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 13,
    marginRight: 4,
  },
  challengeDesc: {
    color: '#ccc',
    marginBottom: 8,
    textAlign: 'left',
  },
  challengeCoords: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 4,
    textAlign: 'left',
  },
  sectionCard: {
    backgroundColor: '#23242a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 8,
  },
  wifiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  wifiCol: {
    flex: 1,
    marginRight: 8,
  },
  wifiLabel: {
    color: '#aaa',
    fontSize: 12,
  },
  wifiValue: {
    color: '#fff',
    fontSize: 15,
    backgroundColor: '#181A20',
    borderRadius: 6,
    padding: 6,
    marginTop: 2,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  timerLabel: {
    color: '#fff',
    fontSize: 13,
    marginRight: 4,
  },
  timerValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    marginTop: 2,
    marginBottom: 2,
    width: '100%',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#00BFFF',
    borderRadius: 3,
  },
  flagLabel: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 4,
  },
  flagInput: {
    backgroundColor: '#181A20',
    color: '#fff',
    borderRadius: 6,
    padding: 10,
    fontSize: 15,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#23242a',
  },
  submitBtn: {
    backgroundColor: '#00BFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 6,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  flagHelp: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  slotHelp: {
    color: '#3CB371',
    fontSize: 13,
    marginBottom: 8,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotTime: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
    flex: 1,
  },
  slotBtnReserve: {
    backgroundColor: '#3CB371',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  slotBtnReserveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  closeBtn: {
    backgroundColor: '#00BFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  levelBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 2,
  },
  levelDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#3CB371',
  },
  levelDotActive: {
    backgroundColor: '#3CB371',
  },
  levelDotInactive: {
    backgroundColor: '#23242a',
  },
  levelPoints: {
    color: '#3CB371',
    fontWeight: 'bold',
    marginLeft: 12,
    fontSize: 14,
  },
  startBtn: {
    backgroundColor: '#00BFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  startBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  slotBadgeBooked: {
    backgroundColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotBadgeBookedText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 14,
  },
  slotBtnAnnuler: {
    backgroundColor: '#E53935',
  },
  slotBtnAnnulerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
}); 