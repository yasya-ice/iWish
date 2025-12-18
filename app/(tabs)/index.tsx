import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native'; 
import { supabase } from '@/utils/supabase'; 
import Auth from '@/components/Auth'; 
import { Session } from '@supabase/supabase-js'; 
import { useFocusEffect, useNavigation } from 'expo-router'; // Impordime useFocusEffect
import { ThemedButton } from '@/components/themed-button';
import Wishlist from '@/components/Wishlist';
import AppModal from '@/components/app-modal';
import AddWish from '@/components/AddWish';

const screenWidth = Dimensions.get('window').width;

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const navigation = useNavigation();
  const [cameTrue, setCameTrue] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false, // Peidab "Home" päise
      tabBarStyle: session
        ? customTabBarStyle // Kui on sisselogitud, näita disainitud riba
        : { display: "none" }, // KUI POLE SESSIOONI, PEIDA RIBA
    });
  }, [session, navigation]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // 2. See on VÕTI: Värskendab nimekirja, kui kasutaja naaseb sellele lehele
  useFocusEffect(
    useCallback(() => {
      // Suurendame refreshKey-d, mis sunnib <Wishlist /> komponenti uuesti pärima andmeid
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  // 3. Reaalajas kuulaja (kui keegi lisab soovi väljaspool detailvaadet)
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
          
          {/* refreshKey muutumine sunnib Wishlisti andmeid uuendama */}
          <Wishlist key={refreshKey} cameTrue={cameTrue}/>
          <AppModal visible={modalVisible} onClose={() => setModalVisible(false)} title="Add a wish">
            <AddWish 
            onCloseModal={() => setModalVisible(false)}
            onWishAdded={() => setRefreshKey(prev => prev + 1)}
              />
          </AppModal>
        </>
      ) : (
        <Auth onReadyForPasswordUpdate={() => {}} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // Eemaldasin justifyContent: 'center', et nimekiri algaks ülevalt
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