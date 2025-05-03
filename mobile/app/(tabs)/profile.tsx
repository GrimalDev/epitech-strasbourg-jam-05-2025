import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants/theme";

const profile = {
  username: "Explorer42",
  level: 5,
  xp: 320,
  xpToNext: 500,
  avatarColor: COLORS.light.accent,
};

const stats = [
  { icon: "map-marker-radius" as const, value: 24, label: "Caches Found" },
  { icon: "walk" as const, value: "48.2km", label: "Distance" },
  { icon: "medal" as const, value: 3, label: "Badges" },
];

const discoveries = [
  {
    icon: "map-marker" as const,
    title: "Urban Treasure",
    date: "2 days ago",
    points: 50,
  },
  {
    icon: "map-marker" as const,
    title: "Forest Mystery",
    date: "1 week ago",
    points: 75,
  },
  {
    icon: "map-marker" as const,
    title: "Beach Hideout",
    date: "2 weeks ago",
    points: 60,
  },
];

const badges = [
  { title: "Early Bird", desc: "First 5 caches discovered" },
  { title: "Urban Explorer", desc: "Found 10 city caches" },
  { title: "Nature Lover", desc: "Found 5 park caches" },
];

export default function ProfileScreen() {
  const xpPercent = Math.min(profile.xp / profile.xpToNext, 1);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Profil principal */}
      <View style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: profile.avatarColor }]}>
          <Text style={styles.avatarText}>{profile.username[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{profile.username}</Text>
          <View style={styles.levelRow}>
            <Text style={styles.levelBadge}>Level {profile.level}</Text>
          </View>
          {/* Barre de progression d'XP */}
          <View style={styles.xpBarContainer}>
            <View style={[styles.xpBar, { width: `${xpPercent * 100}%` }]} />
          </View>
          <Text style={styles.xpText}>
            {profile.xp} / {profile.xpToNext} XP
          </Text>
        </View>
      </View>

      {/* Statistiques */}
      <View style={styles.statsRow}>
        {stats.map((stat, idx) => (
          <View key={stat.label} style={styles.statCard}>
            <MaterialCommunityIcons
              name={stat.icon}
              size={28}
              color={COLORS.light.primary}
            />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Découvertes récentes */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Recent Discoveries</Text>
        {discoveries.map((item, idx) => (
          <View key={item.title} style={styles.discoveryRow}>
            <View style={styles.discoveryIcon}>
              <MaterialCommunityIcons
                name={item.icon}
                size={22}
                color={COLORS.light.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.discoveryTitle}>{item.title}</Text>
              <Text style={styles.discoveryDate}>{item.date}</Text>
            </View>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>{item.points} pts</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Badges */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Badges & Achievements</Text>
        <View style={styles.badgesGrid}>
          {badges.map((badge) => (
            <View key={badge.title} style={styles.badgeCard}>
              <MaterialCommunityIcons
                name="ribbon"
                size={32}
                color={COLORS.light.primary}
              />
              <Text style={styles.badgeTitle}>{badge.title}</Text>
              <Text style={styles.badgeDesc}>{badge.desc}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF3",
    padding: 16,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 6,
  },
  levelBadge: {
    backgroundColor: "#E6F9E6",
    color: "#3CB371",
    fontWeight: "bold",
    fontSize: 14,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  xpBarContainer: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 2,
    overflow: "hidden",
  },
  xpBar: {
    height: 8,
    backgroundColor: "#3CB371",
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 16,
    marginHorizontal: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 12,
  },
  discoveryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  discoveryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  discoveryTitle: {
    fontWeight: "bold",
    color: "#222",
    fontSize: 15,
  },
  discoveryDate: {
    color: "#888",
    fontSize: 12,
  },
  pointsBadge: {
    backgroundColor: "#FFE9C6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 8,
  },
  pointsText: {
    color: "#FFA726",
    fontWeight: "bold",
    fontSize: 14,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  badgeCard: {
    backgroundColor: "#F3FAF3",
    borderRadius: 12,
    alignItems: "center",
    padding: 16,
    width: "48%",
    marginBottom: 12,
  },
  badgeTitle: {
    fontWeight: "bold",
    color: "#222",
    fontSize: 15,
    marginTop: 8,
  },
  badgeDesc: {
    color: "#3CB371",
    fontSize: 13,
    textAlign: "center",
    marginTop: 2,
  },
});
