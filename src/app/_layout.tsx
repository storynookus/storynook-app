import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="error" options={{ title: 'Error' }} />
    </Stack>
  );
}
