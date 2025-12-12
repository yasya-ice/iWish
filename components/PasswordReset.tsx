import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../utils/supabase';
import { LOGO_SOURCE } from './Auth'; 

interface PasswordResetProps {
  onBack: () => void;
  onVerified: () => void; // See peab siin olema
}

// ------------------------------------------------------------------
// PARANDUS SIIN: Veendu, et 'onVerified' on siin loogelistes sulgudes!
// ------------------------------------------------------------------
export default function PasswordReset({ onBack, onVerified }: PasswordResetProps) {
  
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Saada kood
  const sendResetCode = async () => {
    if (!email) { Alert.alert('Viga', 'Sisesta e-post.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) Alert.alert('Viga', error.message);
    else { Alert.alert('Saadetud', 'Kontrolli postkasti!'); setStep('verify'); }
  };

  // 2. Kontrolli koodi
  const verifyResetCode = async () => {
    const cleanToken = token.trim();
    if (cleanToken.length !== 8) { Alert.alert('Viga', 'Kood peab olema 8 numbrit.'); return; }
    
    setLoading(true);
    
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(), token: cleanToken, type: 'recovery',
    });
    
    if (error) {
      setLoading(false);
      Alert.alert('Viga', error.message);
    } else {
      // -----------------------------------------------------------
      // TURVAKONTROLL: Kas onVerified eksisteerib?
      // -----------------------------------------------------------
      if (typeof onVerified === 'function') {
        console.log("Kood õige, kutsun onVerified()...");
        onVerified(); 
      } else {
        console.error("VIGA: onVerified prop puudub või ei ole funktsioon!");
        Alert.alert("Süsteemi viga", "Rakendus ei suuda avada parooli vahetamise vaadet (onVerified missing).");
        setLoading(false);
      }
    }
  };

  return (
    <LinearGradient colors={['#0D3245', '#115476', '#000000']} locations={[0.3, 0.5, 0.9]} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image style={styles.logo} source={LOGO_SOURCE} />
          <Text style={styles.title}>Reset Password</Text>
        </View>

        {step === 'request' ? (
          <>
            <Text style={styles.label}>E-mail</Text>
            <TextInput style={styles.input} placeholder="email@example.com" placeholderTextColor="#999" value={email} onChangeText={setEmail} autoCapitalize="none" />
            <TouchableOpacity style={styles.button} onPress={sendResetCode} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send Code</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>8-Digit Code</Text>
            <TextInput style={styles.input} placeholder="12345678" placeholderTextColor="#999" value={token} onChangeText={setToken} keyboardType="number-pad" maxLength={8} />
            <TouchableOpacity style={styles.button} onPress={verifyResetCode} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify Code</Text>}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', height: '100%' },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 100, height: 100, resizeMode: 'contain', marginBottom: 15 },
  title: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  label: { color: '#F5A858', marginBottom: 5, marginLeft: 10 },
  input: { backgroundColor: '#fff', borderRadius: 20, padding: 15, marginBottom: 15 },
  button: { backgroundColor: '#F5A858', borderRadius: 20, padding: 15, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  backBtn: { alignItems: 'center', marginTop: 20 },
  backText: { color: '#fff', textDecorationLine: 'underline' }
});