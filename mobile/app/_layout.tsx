import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#181A20',
          },
        }}
      >
        <Stack.Screen 
          name="(auth)" 
          options={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#181A20' },
          }} 
        />
        <Stack.Screen 
          name="(main)" 
          options={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#181A20' },
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
