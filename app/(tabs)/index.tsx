import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native'; 
import { supabase } from '@/utils/supabase'; 
import Auth from '@/components/Auth'; 
import { Session } from '@supabase/supabase-js'; 
import { useFocusEffect, useNavigation } from 'expo-router'; 
import { ThemedButton } from '@/components/themed-button';
import Wishlist from '@/components/Wishlist';
import AppModal from '@/components/app-modal';
import AddWish from '@/components/AddWish';
import { customTabBarStyle } from "@/constants/tab-bar";

const screenWidth = Dimensions.get('window').width;

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [cameTrue, setCameTrue] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // 2. LAHENDUS: Deklareerime navigation ainult ÜKS kord siin (Screenshot 04.40.35 veaparandus)
  const navigation = useNavigation();

  // Saki-riba ja päise juhtimine vastavalt sessioonile
  useEffect(() => {
    navigation.setOptions({
      headerShown: false, // Peidab "Home" päise tervitusekraanilt
      tabBarStyle: session
        ? customTabBarStyle // Sisselogituna näita disainitud riba
        : { display: "none" }, // Sisselogimata olekus peida riba täielikult
    });
  }, [session, navigation]);

  // Autentimise kontroll
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Värskendab nimekirja fookusesse sattumisel
  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  // Reaalajas kuulaja andmebaasi muudatustele
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'wishes'}, () => {
          setRefreshKey(prev => prev + 1);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <View style={styles.container}>
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
          
          <Wishlist key={refreshKey} cameTrue={cameTrue}/>
          
          <AppModal visible={modalVisible} onClose={() => setModalVisible(false)} title="Add a wish">
            <AddWish 
              onCloseModal={() => setModalVisible(false)}
              onWishAdded={() => setRefreshKey(prev => prev + 1)}
            />
          </AppModal>
        </>
      ) : (
        /* Siin kuvatakse sisselogimise vaade ilma alumise menüüta */
        <Auth onReadyForPasswordUpdate={() => {}} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'stretch',
  },
  homeNavContainer: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 10,
    width: '100%',
    marginTop: 10,
    marginBottom: 5,
  },
  homeNavButton: {
    width: screenWidth * 0.3,
  },
});