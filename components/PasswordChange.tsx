import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../utils/supabase';
import { LOGO_SOURCE } from './Auth'; 

interface PasswordChangeProps {
  onSuccess: () => void;
}

export default function PasswordChange({ onSuccess }: PasswordChangeProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) { Alert.alert('Viga', 'Min 6 tähemärki.'); return; }
    if (newPassword !== confirmPassword) { Alert.alert('Viga', 'Paroolid ei kattu.'); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      Alert.alert('Viga', error.message);
    } else {
      Alert.alert('Edukas', 'Parool muudetud! Logi uuesti sisse.', [
        { text: 'OK', onPress: onSuccess }
      ]);
    }
  };

  return (
    <LinearGradient colors={['#0D3245', '#115476', '#000000']} locations={[0.3, 0.5, 0.9]} style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Image style={styles.logoImage} source={LOGO_SOURCE} />
          <Text style={styles.headerTitle}>Set New Password</Text>
        </View>
        
        <Text style={styles.label}>New Password</Text>
        <TextInput style={styles.input} placeholder="********" placeholderTextColor="#999" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
        
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput style={styles.input} placeholder="********" placeholderTextColor="#999" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

        <TouchableOpacity style={styles.button} onPress={handleUpdatePassword} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Password</Text>}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', height: '100%' },
  contentContainer: { flex: 1, padding: 20, justifyContent: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 30 },
  logoImage: { width: 100, height: 100, resizeMode: 'contain', marginBottom: 15 },
  headerTitle: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  label: { color: '#F5A858', marginBottom: 5, marginLeft: 10 },
  input: { backgroundColor: '#fff', borderRadius: 20, padding: 15, marginBottom: 15 },
  button: { backgroundColor: '#F5A858', borderRadius: 20, padding: 15, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});