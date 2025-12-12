import 'react-native-url-polyfill/auto'; 
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Button, ActivityIndicator } from 'react-native'; 
// Veendu, et impordid vastavad sinu failistruktuurile (kas @/ või ../)
import { supabase } from '@/utils/supabase'; 
import Auth from '@/components/Auth'; 
import PasswordChange from '@/components/PasswordChange';
import { Session } from '@supabase/supabase-js'; 

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true); 
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Supabase Event:", event); 

      // See on automaatne tuvastus (nt lingist tulles)
      if (event === 'PASSWORD_RECOVERY') {
        setShowPasswordChange(true);
      }
      
      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowPasswordChange(false);
  };

  if (!initialized) return <View style={styles.center}><ActivityIndicator size="large" color="#F5A858" /></View>;

  return (
    <View style={styles.container}>
      
      {/* 1. KAS NÄITAME PAROOLI VAHETUST? (Kõrgeim prioriteet) */}
      {showPasswordChange ? (
        <PasswordChange onSuccess={handleLogout} />
      ) 
      
      /* 2. KASUTAJA ON SISSE LOGITUD? */
      : session && session.user ? (
        <View style={styles.center}>
          <Text style={{color: 'white', fontSize: 20}}>Tere tulemast!</Text>
          <Text style={{color: '#ccc', marginBottom: 20}}>{session.user.email}</Text>
          <Button title="Logi välja" onPress={handleLogout} color="#ef4444" />
        </View>
      ) 
      
      /* 3. KASUTAJA ON VÄLJAS? (Auth vaade) */
      : (
        <Auth 
          // See funktsioon kutsutakse siis, kui kood on edukalt sisestatud
          onReadyForPasswordUpdate={() => {
             console.log("App.tsx sai signaali! Avan parooli muutmise vaate.");
             setShowPasswordChange(true);
          }} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#000000' }
});