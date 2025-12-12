import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { supabase } from '../utils/supabase';
import WelcomeScreen from './WelcomeScreen';
import AuthForm from './AuthForm';
import PasswordReset from './PasswordReset'; 

export type AuthMode = 'welcome' | 'signIn' | 'signUp' | 'forgotPassword';

// Global pildi allikad
export const LOGO_SOURCE = require('../assets/splash-logo.png');
export const GOOGLE_ICON = { uri: 'https://img.icons8.com/color/48/000000/google-logo.png' };
export const FACEBOOK_ICON = { uri: 'https://img.icons8.com/?size=100&id=106163&format=png&color=228BE6' };

// Defineerime, et Auth võtab vastu funktsiooni
interface AuthProps {
  onReadyForPasswordUpdate: () => void;
}

export default function Auth({ onReadyForPasswordUpdate }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>('welcome');
  
  const startAuth = () => { setLoading(true); setErrorMessage(null); }
  const finishAuth = () => { setLoading(false); }

  async function signInWithEmail() {
    startAuth();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrorMessage(error.message);
    finishAuth();
  }

  async function signUpWithEmail() {
    startAuth();
    const { error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: name } }
    });
    if (error) setErrorMessage(error.message);
    else { Alert.alert("Konto loodud!", "Palun kinnita e-post."); setMode('signIn'); }
    finishAuth();
  }

  return (
    <View style={styles.authContainer}>
      {mode === 'welcome' && <WelcomeScreen setMode={setMode} />}
      
      {(mode === 'signIn' || mode === 'signUp') && (
        <AuthForm
          mode={mode} setMode={setMode} email={email} setEmail={setEmail}
          password={password} setPassword={setPassword} name={name} setName={setName}
          loading={loading} errorMessage={errorMessage}
          signInWithEmail={signInWithEmail} signUpWithEmail={signUpWithEmail} 
        />
      )}

      {mode === 'forgotPassword' && (
        <PasswordReset 
          onBack={() => setMode('signIn')} 
          // TÄHTIS: Anname funktsiooni edasi!
          onVerified={onReadyForPasswordUpdate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  authContainer: { flex: 1, backgroundColor: '#000000', width: '100%', height: '100%' }
});