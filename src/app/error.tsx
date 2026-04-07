import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ErrorPage() {
  const router = useRouter();
  const pathname = usePathname();

  const currentUrl = useMemo(() => {
    if (typeof window !== 'undefined' && window.location?.href) {
      return window.location.href;
    }

    return pathname;
  }, [pathname]);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.errorCode}>404</Text>
        <Text style={styles.errorTitle}>Page could not be found.</Text>
        <Text style={styles.url}>{currentUrl}</Text>
        <Text style={styles.errorMessage}>
          The path is unmatched. You can go back or open the sitemap.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={handleGoBack}>
          <Text style={styles.buttonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    marginBottom: 28,
  },
  errorCode: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  url: {
    fontSize: 14,
    color: '#4D96FF',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    gap: 10,
  },
  button: {
    backgroundColor: '#4D96FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
