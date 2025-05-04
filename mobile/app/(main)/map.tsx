
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { fetchHackingSpots, fetchHackingSpot } from '../../services/hackingSpots';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const LEVEL_POINTS = [50, 100, 150, 200, 250];

const COLORS = {
  primary: '#2C5F2D',
  secondary: '#97BC62',
  background: '#F5F5F5',
  text: '#1A1A1A',
  light: '#FFFFFF',
  accent: '#97BC62',
  error: '#E57373',
};

function formatSlotFr(start: string, end: string) {
  const [h1, m1] = start.split(':');
  const [h2, m2] = end.split(':');
  return `De ${h1}h${m1} à ${h2}h${m2}`;
}

function isSlotStartReached(slotStart: string) {
  const now = new Date();
  const [h, m] = slotStart.split(':');
  const slotDate = new Date(now);
  slotDate.setHours(Number(h), Number(m), 0, 0);
  return now >= slotDate;
}

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [spots, setSpots] = useState<any[]>([]);
  const [selectedBox, setSelectedBox] = useState<any | null>(null);
  const [flagInput, setFlagInput] = useState('');
  const [flagError, setFlagError] = useState<string | null>(null);
  const [reservedSlot, setReservedSlot] = useState<number | null>(null);
  const [challengeStarted, setChallengeStarted] = useState(false);
  const mapRef = useRef<MapView>(null);
  const lastFetchedCenter = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  const handleRegionChangeComplete = async (region: Region) => {
    const current = { lat: region.latitude, lng: region.longitude };
    const last = lastFetchedCenter.current;

    if (!last || Math.abs(current.lat - last.lat) > 0.001 || Math.abs(current.lng - last.lng) > 0.001) {
      try {
        const data = await fetchHackingSpots(current.lat, current.lng);
        setSpots(data);
        lastFetchedCenter.current = current;
      } catch (error) {
        console.warn('Erreur API');
      }
    }
  };

  const handleMarkerPress = async (spot: any) => {
    try {
      const detailed = await fetchHackingSpot(spot.id);
      setSelectedBox({ ...spot, ...detailed });
    } catch (err) {
      console.warn("Erreur lors du chargement du détail du spot :", err);
      setSelectedBox(spot);
    }
  };

  const handleSubmitFlag = () => {
    if (flagInput.trim() !== 'flag{root}') {
      setFlagError("Ce n'est pas le bon flag.");
      return;
    }
    setFlagError(null);
    Alert.alert('Bravo !', 'Flag correct, challenge validé !');
  };

  const getColor = (difficulty: string) => {
    if (difficulty === '1') return 'green';
    if (difficulty === '2') return 'orange';
    return 'red';
  };

  const handleReserveSlot = (idx: number) => {
    setReservedSlot(idx);
    setChallengeStarted(false);
  };

  const handleCancelReservation = () => {
    setReservedSlot(null);
    setChallengeStarted(false);
  };

  const handleStartChallenge = () => {
    setChallengeStarted(true);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location?.coords.latitude || 48.5846,
          longitude: location?.coords.longitude || 7.7468,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation
        showsMyLocationButton
        zoomEnabled={true}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
            onPress={() => handleMarkerPress(spot)}
          >
            <MaterialCommunityIcons
              name="map-marker"
              size={30}
              color={getColor(spot.difficulty)}
            />
          </Marker>
        ))}
      </MapView>

      <Modal visible={!!selectedBox} animationType="slide" transparent onRequestClose={() => setSelectedBox(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView>
              {selectedBox && (
                <>
                  <View style={styles.challengeCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <View style={styles.statusDot} />
                      <Text style={styles.challengeTitle}>{selectedBox.name || selectedBox.title}</Text>
                    </View>
                    <View style={styles.levelBarRow}>
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <View
                          key={lvl}
                          style={[styles.levelDot, lvl <= parseInt(selectedBox.difficulty) ? styles.levelDotActive : styles.levelDotInactive]}
                        />
                      ))}
                      <Text style={styles.levelPoints}>{LEVEL_POINTS[parseInt(selectedBox.difficulty) - 1]} pts</Text>
                    </View>
                    <View style={styles.tagsRow}>
                      {(selectedBox.tags || []).map((tag) => (
                        <Text key={tag} style={styles.tag}>{tag}</Text>
                      ))}
                    </View>
                    <Text style={styles.challengeDesc}>{selectedBox.description}</Text>
                    <Text style={styles.sectionTitle}>crypto</Text>
                    <Text style={styles.sectionTitle}>Déchiffrez le message caché pour trouver le flag.</Text>

                    <Text style={styles.challengeCoords}>📍 {selectedBox.latitude}, {selectedBox.longitude}</Text>
                  </View>

                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>WiFi Connection</Text>
                    <View style={styles.wifiRow}>
                      <View style={styles.wifiCol}>
                        <Text style={styles.wifiLabel}>SSID</Text>
                        <Text style={styles.wifiValue}>{`${selectedBox.public_id}_spot`}</Text>
                      </View>
                      <View style={styles.wifiCol}>
                        <Text style={styles.wifiLabel}>Password</Text>
                        <Text style={styles.wifiValue}>{selectedBox.access_point_password}</Text>
                      </View>
                    </View>
                    
                  </View>

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

                  <View style={styles.sectionCard}>
                    <Text style={[styles.sectionTitle, { color: COLORS.secondary }]}>Available Time Slots</Text>
                    <Text style={styles.slotHelp}>Réservez votre créneau de 1h30. Les créneaux déjà réservés sont indiqués.</Text>
                    {(selectedBox.slots || []).map((slot, idx) => {
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