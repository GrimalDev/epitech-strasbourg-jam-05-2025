import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: Vérifier si l'utilisateur est connecté
  const isAuthenticated = false; // À remplacer par la vraie vérification

  if (isAuthenticated) {
    return <Redirect href="/(main)" />;
  }
  
  return <Redirect href="/(auth)" />;
} 