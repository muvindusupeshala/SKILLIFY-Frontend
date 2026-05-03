import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiFetch, login, register } from '../../api';
import { Button, Card, styles } from '../../components/ui';

export default function LoginScreen({ onAuthenticated }) {
  const insets = useSafeAreaInsets();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch('/api/settings').then(setSettings).catch(() => {});
  }, []);

  const submit = async () => {
    if (!email.trim() || !password.trim() || (!isLogin && !name.trim())) {
      Alert.alert('Missing details', 'Please fill in the required fields.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const data = await login(email.trim(), password);
        onAuthenticated(data.user);
      } else {
        const data = await register(name.trim(), email.trim(), password);
        Alert.alert('Account created', 'You are now registered.');
        onAuthenticated(data.user);
      }
    } catch (error) {
      Alert.alert('Authentication failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.loginWrap, { paddingTop: 24 + insets.top, paddingBottom: 42 + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoBox}><Text style={styles.logoText}>S</Text></View>
          <Text style={styles.brand}>{settings?.appName || 'Skillify'}</Text>
          <Text style={styles.loginSubtitle}>Career skill gap guidance{settings?.audience ? ` for ${settings.audience}` : ''}.</Text>

          <Card style={styles.loginCard}>
            <Text style={styles.formTitle}>{isLogin ? 'Welcome Back' : 'Join Skillify'}</Text>
            {!isLogin && <TextInput style={styles.input} placeholder="Full name" placeholderTextColor="#94a3b8" value={name} onChangeText={setName} />}
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#94a3b8" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#94a3b8" secureTextEntry value={password} onChangeText={setPassword} />
            <Button title={loading ? 'Please wait...' : isLogin ? 'Login' : 'Create account'} onPress={submit} disabled={loading} />
            <Button title={isLogin ? 'Need an account? Sign up' : 'Already registered? Login'} variant="ghost" onPress={() => setIsLogin(!isLogin)} />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
