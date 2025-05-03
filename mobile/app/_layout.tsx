import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import Header from "../components/Header";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          header: () => <Header />,
          contentStyle: {
            backgroundColor: "#FFFFFF",
            paddingTop: 60,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
