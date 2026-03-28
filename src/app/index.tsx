import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>StoryNook</Text>
      <Image source={require('../../assets/images/storynook-logo.jpeg')} style={styles.logo} />
      <Text style={styles.subtitle}>Your app is ready.</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
});
