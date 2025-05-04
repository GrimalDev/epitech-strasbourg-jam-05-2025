export const PROFILE_DATA = {
  username: "Explorateur42",
  level: 5,
  currentXP: 750,
  nextLevelXP: 1000,
  steps: 12500,
  badges: [
    {
      id: 1,
      name: "Débutant",
      description: "Premier flag trouvé",
      icon: "trophy" as const,
      unlocked: true,
    },
    {
      id: 2,
      name: "Explorateur",
      description: "10 flags trouvés",
      icon: "compass" as const,
      unlocked: true,
    },
    {
      id: 3,
      name: "Maître",
      description: "50 flags trouvés",
      icon: "crown" as const,
      unlocked: false,
    },
  ],
  recentFlags: [
    {
      id: 1,
      name: "Le Trésor Perdu",
      difficulty: "Facile",
      xp: 50,
      date: "2024-05-02",
    },
    {
      id: 2,
      name: "Le Mystère du Parc",
      difficulty: "Moyen",
      xp: 100,
      date: "2024-05-01",
    },
    {
      id: 3,
      name: "La Cache Secrète",
      difficulty: "Difficile",
      xp: 200,
      date: "2024-04-30",
    },
  ],
}; 