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
import AddWish from '@/components/AddWish';

const deleteWish = async (wishId: number) => {
  try {
    // Kustutamise päring Supabase'ile
    const { error } = await supabase
      .from('wishes') // Teie tabeli nimi
      .delete()        // Kustutamise käsk
      .eq('id', wishId); // Kustuta RIDA, mille ID vastab antud wishId-le

    if (error) {
      throw new Error(error.message);
    }

    // Pärast edukat kustutamist: värskenda soovide nimekirja
    // See peaks kutsuma funktsiooni, mis tõmbab andmed uuesti
    // näiteks: fetchWishes(); 
    
    Alert.alert("Eemaldatud", "Soov kustutati edukalt.");

  } catch (error: any) {
    Alert.alert("Viga kustutamisel", error.message);
  }
};

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
            title="Add a wish"
          >
            {/* ANNAME SULGEMISFUNKTSIOONI AddWish komponendile */}
            <AddWish onCloseModal={() => setModalVisible(false)} />
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
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 10, // Lisab veidi ruumi servadele
    paddingVertical: 8,
    width: '100%',
    margin: 10,
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