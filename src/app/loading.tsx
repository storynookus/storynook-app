import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import LoadingScreen from './LoadingScreen';
import { storyStore } from './storyStore';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL!;

export default function LoadingPage() {
  const router = useRouter();
  const { childName, pageCount, moral, language, interests, customLesson } =
    useLocalSearchParams<{
      childName: string;
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
    router.replace({ pathname: '/storybook' });
  };

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/generate-story`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            childName:    childName    || 'Your Child',
            childAge:     '5',
            interests:    interests    || 'adventure',
            moral:        moral        || 'kindness',
            customPrompt: customLesson || '',
            language:     language     || 'English',
            pageCount:    Number(pageCount) || 7,
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