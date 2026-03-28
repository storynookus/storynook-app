import { useLocalSearchParams, useRouter } from 'expo-router';
import LoadingScreen from './LoadingScreen';

export default function LoadingPage() {
  const { childName, pageCount } = useLocalSearchParams<{
    childName: string;
    pageCount: string;
  }>();
  const router = useRouter();

  return (
    <LoadingScreen
      childName={childName}
      pageCount={Number(pageCount) || 7}
      onComplete={() => router.replace('/storybook')}
    />
  );
}
