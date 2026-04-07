import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const AGES = [2,3,4,5,6,7,8,9,10,11,12];

export default function OnboardingScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('5');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handlePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', "Please enter your child's name!");
      return;
    }
    setSaving(true);
    try {
      // TODO: hook up to Firebase saveKid()
      router.push({ pathname: '/landing' as any, params: { childName: name, childAge: age, photoUri: photoUri || '' } });
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
    setSaving(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✨ StoryNook</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>
        Let's meet your{'\n'}
        <Text style={styles.titleHighlight}>little hero!</Text>
      </Text>
      <Text style={styles.subtitle}>
        Add your child's profile to create personalized stories just for them.
      </Text>

      {/* Card */}
      <View style={styles.card}>

        {/* Photo */}
        <TouchableOpacity style={styles.photoWrap} onPress={handlePhoto}>
          {photoUri ? (
            <View style={styles.photoPreviewWrap}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              <View style={styles.photoOverlay}>
                <Text style={styles.photoOverlayText}>Change Photo</Text>
              </View>
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoIcon}>📸</Text>
              <Text style={styles.photoText}>Add a photo</Text>
              <Text style={styles.photoSub}>Optional but makes illustrations magical!</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>✏️ Child's Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Amaya, Zeb, Leo..."
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Age */}
        <View style={styles.field}>
          <Text style={styles.label}>🎂 Age</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ageRow}>
            {AGES.map(a => (
              <TouchableOpacity
                key={a}
                style={[styles.ageChip, age === String(a) && styles.ageChipSelected]}
                onPress={() => setAge(String(a))}
              >
                <Text style={[styles.ageChipText, age === String(a) && styles.ageChipTextSelected]}>
                  {a}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Add {name || 'Child'} ✨</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8EE',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  backBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backBtnText: {
    fontWeight: '700',
    color: '#555',
    fontSize: 14,
  },
  badge: {
    backgroundColor: '#FFD93D',
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 18,
    shadowColor: '#FFB347',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeText: {
    fontWeight: '800',
    fontSize: 13,
    color: '#2D2D2D',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2D2D2D',
    lineHeight: 42,
    marginBottom: 12,
  },
  titleHighlight: {
    color: '#FF6B6B',
  },
  subtitle: {
    color: '#888',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 28,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  photoWrap: {
    borderWidth: 3,
    borderColor: '#FFD93D',
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFBF0',
    marginBottom: 24,
  },
  photoPreviewWrap: {
    alignItems: 'center',
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFD93D',
  },
  photoOverlay: {
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  photoOverlayText: {
    color: '#fff',
    fontSize: 12,
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  photoText: {
    fontWeight: '700',
    fontSize: 15,
    color: '#2D2D2D',
  },
  photoSub: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '700',
    fontSize: 15,
    color: '#2D2D2D',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2.5,
    borderColor: '#E8E8E8',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: '#2D2D2D',
    backgroundColor: '#FAFAFA',
  },
  ageRow: {
    flexDirection: 'row',
  },
  ageChip: {
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    backgroundColor: '#FAFAFA',
  },
  ageChipSelected: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B',
  },
  ageChipText: {
    fontWeight: '700',
    color: '#555',
    fontSize: 14,
  },
  ageChipTextSelected: {
    color: '#fff',
  },
  saveBtn: {
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
