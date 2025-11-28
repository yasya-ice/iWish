import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native'; // Lisasime Button ja Alert
// See import viitab Sinu puhastatud failile utils/supabase
import { supabase } from '@/utils/supabase'; 
import Auth from '@/components/Auth'; // Sisselogimise/Registreerimise vaade
import { Session } from '@supabase/supabase-js'; // Session tüüp
import { useNavigation } from 'expo-router';
import { customTabBarStyle } from "@/constants/tab-bar";
import { ThemedButton } from '@/components/themed-button';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const navigation = useNavigation(); 

  useEffect(() => {
    // 1. Kontrolli seansi olekut käivitamisel
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Seadista reaalajas kuulaja olekumuutustele
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    // Puhasta kuulaja komponendi eemaldamisel
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerShown: !!session,   // show header only when logged in
      tabBarStyle: session
        ? customTabBarStyle                            // logged in → default tab bar
        : { display: "none" },          // logged out → hide tab bar
    });
  }, [session]);

  // Väljalogimise funktsioon
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        Alert.alert("Väljalogimise viga", error.message);
    }
  }

  return (
    <View style={styles.container}>
      {/* Kui seanss on olemas, kuva sisselogitud sisu */}
      {session && session.user ? (
        <View style={styles.container}>
          <ThemedButton 
            title="Actual" 
            onPress={signOut} 
          />
          <ThemedButton 
            variant="secondary"
            tone="border"
            title="Came true" 
            onPress={signOut} 
          />
          <ThemedButton 
            tone="border"
            title={'\uff0b Add iWish'}
            onPress={signOut} 
          />
        </View>
      ) : (
        // Kui seanssi pole, kuva autentimise vorm
        <Auth />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center', 
    alignItems: 'stretch',
    padding: 20,
  },
  loggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20, 
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  signOutButtonContainer: {
    marginTop: 20,
    width: '100%',
    maxWidth: 200, // Piirame nupu laiust
  }
});