import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';

// Palette de couleurs
const COLORS = {
  primary: '#55969e',    // color2
  secondary: '#acd4be',  // color3
  background: '#f9f9f9', // color5
  text: '#bbc0d8',      // color1
  light: '#e7e7d8',     // color4
  error: '#e57373',
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: COLORS.background,
          },
        }}
      >
        <Stack.Screen 
          name="(auth)" 
          options={{ 
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
          }} 
        />
        <Stack.Screen 
          name="(main)" 
          options={{ 
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
