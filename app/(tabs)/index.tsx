import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, Dimensions } from 'react-native'; // Lisasime Button ja Alert
// See import viitab Sinu puhastatud failile utils/supabase
import { supabase } from '@/utils/supabase'; 
import Auth from '@/components/Auth'; // Sisselogimise/Registreerimise vaade
import { Session } from '@supabase/supabase-js'; // Session tüüp
import { useNavigation } from 'expo-router';
import { customTabBarStyle } from "@/constants/tab-bar";
import { ThemedButton } from '@/components/themed-button';
import Wishlist from '@/components/Wishlist';
import AppModal from '@/components/app-modal';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);

  const [session, setSession] = useState<Session | null>(null);
  const navigation = useNavigation(); 
  
  // Kodu navigatsioon 
  const [cameTrue, setCameTrue] = useState(false);

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
        <>
          <View style={styles.homeNavContainer}>
            <ThemedButton 
              title="Actual" 
              tone={cameTrue ? "border" : "solid"}
              onPress={() => setCameTrue(false)} 
              style={styles.homeNavButton}
            />
            <ThemedButton 
              variant="secondary"
              tone={cameTrue ? "solid" : "border"}
              title="Came true" 
              onPress={() => setCameTrue(true)} 
              style={styles.homeNavButton}
            />
            <ThemedButton 
              tone="border"
              title={'\uff0b Add iWish'}
              onPress={() => setModalVisible(true)} 
              style={styles.homeNavButton}
            />
          </View>
          <Wishlist cameTrue={cameTrue}/>
          <AppModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            title="This is a modal"
          >
            <View>
              <ThemedButton title="Do something inside modal" onPress={() => alert("Clicked!")} />
            </View>
          </AppModal>
        </>
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
  homeNavContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly', 
    width: 20,
    margin: 10,
    minWidth: screenWidth,
    alignSelf: 'center',
  },
  homeNavButton: {
    width: screenWidth * 0.3,
    marginHorizontal: screenWidth * 0.01,
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