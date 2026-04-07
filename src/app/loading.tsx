import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import LoadingScreen from './LoadingScreen';
import { storyStore } from './storyStore';
import * as FileSystem from 'expo-file-system';

const BACKEND_URL = process.env.EXPO_PRIVATE_BACKEND_URL!;
const TOKEN = process.env.EXPO_PRIVATE_BACKEND_TOKEN!;

export default function LoadingPage() {
  const router = useRouter();
  const { childName, childAge, photoUri, pageCount, moral, language, interests, customLesson } =
    useLocalSearchParams<{
      childName: string;
      childAge: string;
      photoUri: string;
      pageCount: string;
      moral: string;
      language: string;
      interests: string;
      customLesson: string;
    }>();

  const storyReadyRef = useRef(false);
  const animDoneRef   = useRef(false);
  const navigatingRef = useRef(false);

  const navigate = () => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    router.replace({ pathname: '/storybook' as any });
  };

  useEffect(() => {
    const fetchStory = async () => {
      try {
        let photoBase64 = null;
        if (photoUri) {
          try {
            photoBase64 = await FileSystem.readAsStringAsync(photoUri, {
              encoding: 'base64' as const,
            });
            console.log('Photo converted to base64 successfully');
          } catch (e) {
            console.warn('Failed to convert photo:', e);
          }
        }

        const response = await fetch(`${BACKEND_URL}/api/generate-story`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
          },
          body: JSON.stringify({
            childName:    childName    || 'Your Child',
            childAge:     childAge     || '5',
            interests:    interests    || 'adventure',
            moral:        moral        || 'kindness',
            customPrompt: customLesson || '',
            language:     language     || 'English',
            pageCount:    Number(pageCount) || 7,
            photoBase64:  photoBase64,
          }),
        });

        const data = await response.json();
        storyStore.set(data);
        storyReadyRef.current = true;
        if (animDoneRef.current) navigate();

      } catch (error) {
        console.error('Backend error:', error);
        storyStore.set(null);
        storyReadyRef.current = true;
        if (animDoneRef.current) navigate();
      }
    };

    fetchStory();
  }, []);

  const onAnimationComplete = () => {
    animDoneRef.current = true;
    if (storyReadyRef.current) navigate();
  };

  return (
    <LoadingScreen
      childName={childName}
      pageCount={Number(pageCount) || 7}
      onComplete={onAnimationComplete}
    />
  );
}