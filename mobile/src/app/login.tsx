import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    // TODO: hook up Firebase auth
    setTimeout(() => {
      setLoading(false);
      router.push('/onboarding');
    }, 1000);
  };

  const handleGoogle = () => {
    // TODO: Google sign in
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.logoRow}>
          <Text style={styles.logoIcon}>✨</Text>
          <Text style={styles.logoText}>StoryNook</Text>
        </View>

        <Text style={styles.title}>Welcome{'\n'}<Text style={styles.titleHighlight}>back!</Text></Text>
        <Text style={styles.subtitle}>Log in to continue your magical stories.</Text>

        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>📧 Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>🔒 Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Your password"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#1a0a2e" />
            ) : (
              <Text style={styles.loginBtnText}>Log In ✨</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.note}>Free to try · No account required · Powered by Google Gemini & Imagen</Text>

        <TouchableOpacity onPress={() => router.push('/signuppage')}>
          <Text style={styles.signupLink}>Don't have an account? <Text style={styles.signupLinkHighlight}>Sign Up</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0a2e',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  backText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  logoIcon: { fontSize: 24 },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 8,
  },
  titleHighlight: { color: '#FFD93D' },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  inputWrap: { gap: 6 },
  inputLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
    fontSize: 13,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 15,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    color: '#C77DFF',
    fontSize: 13,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: '#FFD93D',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#FFD93D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  loginBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1a0a2e',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 14,
    width: '100%',
    gap: 10,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a0a2e',
  },
  note: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    marginBottom: 16,
  },
  signupLink: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  signupLinkHighlight: {
    color: '#C77DFF',
    fontWeight: '800',
  },
});
