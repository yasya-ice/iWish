import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, Button } from 'react-native';
import {
  fetchFriendsList,
  removeFriend,
  acceptFriendRequest,
  searchUsersByUsername,
  sendFriendRequest,
  deleteFriendship,
  UserProfile,
  Friend // Impordime Friend tüübi, mille defineerisime services/friendService.ts failis
} from '@/services/friendService'; // Asenda õige teega
import AddFriend from '@/components/AddFriend'; // Asenda õige teega
import { Feather } from '@expo/vector-icons'; // Uus import ikoonide jaoks
import { Redirect } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';


//PÕHIKOMPONENT JA ANDMETE LAADIMINE:
export default function FriendsScreen() {
  const [session, setSession] = useState<Session | null>(null);

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
    
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddFriendModalVisible, setIsAddFriendModalVisible] = useState(false); // Uus olek
  
  // Funktsioon sõprade nimekirja värskendamiseks
  const loadFriends = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchFriendsList();
      setFriends(data);
    } catch (error) {
      console.error('Sõprade laadimine ebaõnnestus:', error);
      Alert.alert('Viga', 'Sõprade laadimine ebaõnnestus.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Käivitame laadimise komponendi loomisel
  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  // Filtreerime nimekirja kuvamiseks
  const acceptedFriends = friends.filter(f => f.status === 'accepted');
  const pendingRequests = friends.filter(f => f.status === 'pending'); // Nii need, mille saatsin, kui need, mis mulle saadeti

//TEGEVUSTE HALDURID:
// --- A. SÕBRA EEMALDAMINE ---
/**
 * Käitleb sõpruse kustutamist
 * @param friendProfileId - Eemaldatava sõbra Profiili ID
 */
async function handleDeleteFriend(friendProfileId: string) {
    console.log("DEBUG: Eemaldamise katse profiilile:", friendProfileId); 
    
    try {
        await deleteFriendship(friendProfileId);
        
        console.log("DEBUG: Kustutamine õnnestus, laadin uuesti.");
        loadFriends(); 
        
    } catch (error: any) {
        console.error("KRIITILINE VIGA TEENUSE FUNKTSIOONIST:", error);
        Alert.alert("Viga", error.message || "Tundmatu VIGA.");
    }
}
  
  // --- B. SÕPRUSETTEPANEKU VASTUVÕTMINE ---
  const handleAcceptRequest = async (friendshipId: number) => {
    try {
      await acceptFriendRequest(friendshipId);
      loadFriends(); // Värskendame nimekirja
      Alert.alert('Vastu võetud', 'Sõprus kinnitatud!');
    } catch (error) {
      Alert.alert('Viga', 'Kinnitamine ebaõnnestus.');
    }
  };


  //KOMPONENTIDE RENDERDAMINE:
  // --- Komponent ühe sõbra kuvamiseks nimekirjas ---
  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      {/* Avatar/Pilt puudub praegu - kasutame Teksti */}
      <Text style={styles.friendName}>{item.username}</Text>
      <Text style={styles.friendRelationship}>{item.relationship}</Text>
      
      {/* Eemaldamise nupp (ainult Accepted sõpradel) */}

<TouchableOpacity 
    // Kasutame stiile, mille me defineerisime allpool
    style={styles.closeButton} 
    onPress={() => handleDeleteFriend(item.profile_id)} //kustutamise funktsioon ja otsekäivitus
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} 
>
    <Feather name='x' size={20} color="#000000ff" /> 
</TouchableOpacity>

      
      {/* Kinnitamise nupp (kui keegi teine on saatnud mulle ettepaneku) */}
      {item.status === 'pending' && (
        <TouchableOpacity onPress={() => handleAcceptRequest(item.id)} style={styles.acceptButton}>
          <Text style={styles.acceptButtonText}>Võta vastu</Text>
        </TouchableOpacity>
      )}
      
      {/* Kui 'pending' ja olen ise saatja, näitan staatust */}
      {item.status === 'pending' && item.profile_id !== friends.find(f => f.status === 'accepted')?.profile_id && (
        <Text style={styles.pendingText}>Ootel...</Text>
      )}
    </View>
  );

  // --- PÕHI RENDERDAMINE ---
  return (
    <View style={styles.container}>
      {/* Kui seanss on olemas, kuva sisselogitud sisu */}
        {session && session.user ? (
          <>
            {/* 1. Modaal Sõbra Lisamiseks (Uus, ilus modaal) */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={isAddFriendModalVisible}
              onRequestClose={() => setIsAddFriendModalVisible(false)}
            >
              <View style={styles.centeredView}>
                <AddFriend 
                  onCloseModal={() => setIsAddFriendModalVisible(false)} 
                  onFriendAdded={loadFriends} 
                />
              </View>
            </Modal>
            
            {/* 2. Modaal Vana Otsinguloogikaga (Kui hoiate seda) */}
            {/* Kui te 'vana' otsinguloogikat enam ei kasuta, kustutage ka see komponent ja seotud useState-id (isModalVisible, searchTerm, searchResults jne). Pildi järgi kasutate uut `AddFriend` modaali. */}
            
            {/* Ülemine navigeerimisriba ja Lisa sõber nupp */}
            <View style={styles.header}>
              <Text style={styles.title}>My friends</Text>
              <TouchableOpacity onPress={() => setIsAddFriendModalVisible(true)} style={styles.addButton}>
                <Text style={styles.addButtonText}>+ friend</Text> 
              </TouchableOpacity>
<View style={styles.container}>
      
      {/* 1. Modaal Sõbra Lisamiseks (Uus, ilus modaal) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isAddFriendModalVisible}
        onRequestClose={() => setIsAddFriendModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <AddFriend 
            onCloseModal={() => setIsAddFriendModalVisible(false)} 
            onFriendAdded={loadFriends} 
          />
        </View>
      </Modal>
      
      {/* 2. Modaal Vana Otsinguloogikaga (Kui hoiate seda) */}
      {/* Kui te 'vana' otsinguloogikat enam ei kasuta, kustutage ka see komponent ja seotud useState-id (isModalVisible, searchTerm, searchResults jne). Pildi järgi kasutate uut `AddFriend` modaali. */}
      
      {/* Ülemine navigeerimisriba ja Lisa sõber nupp */}
      <View style={styles.header}>
        <Text style={styles.title}>My friends</Text>
        <TouchableOpacity onPress={() => setIsAddFriendModalVisible(true)} style={styles.addButton}>
          <Feather name="user-plus" size={24} color="#F9F2ED" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FFA500" style={styles.loader} />
      ) : (
        <>
          {/* Ootel Ettepanekud (näiteks teine sektsioon) */}
          {pendingRequests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ootel (Vastuvõtmiseks)</Text>
              <FlatList
                data={pendingRequests}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderFriendItem}
              />
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#FFA500" style={styles.loader} />
            ) : (
              <>
                {/* Ootel Ettepanekud (näiteks teine sektsioon) */}
                {pendingRequests.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ootel (Vastuvõtmiseks)</Text>
                    <FlatList
                      data={pendingRequests}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={renderFriendItem}
                    />
                  </View>
                )}

                {/* Kinnitatud sõbrad */}
                <Text style={styles.sectionTitle}>Verified friends</Text>
                {acceptedFriends.length === 0 ? (
                  <Text style={styles.emptyText}>Sõpru pole veel lisatud.</Text>
                ) : (
                  <FlatList
                    data={acceptedFriends}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderFriendItem}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <Redirect href="/" />
        )}
    </View>
  );
}

//STIILID:
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#F5A858', // Sarnane teie disaini nupule
    width: 42,
    height: 42,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 50,
  },
  section: { // LISAGE SEE STIIL!
    marginBottom: 20, 
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9', // Valikuline, et sektsioon silma paistaks
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'space-between',
  },
  friendName: {
    fontSize: 16,
    flex: 1,
  },
  friendRelationship: {
    color: '#888',
    marginRight: 40,
  },
  removeButton: {
    padding: 8,
    backgroundColor: '#fdd',
    borderRadius: 5,
  },
  removeButtonText: {
    color: 'red',
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 25,
    height: 25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000000ff',
    backgroundColor: '#ffffff42', 
    justifyContent: 'center', 
  alignItems: 'center',
  zIndex: 10,
  },
  acceptButton: {
    padding: 8,
    backgroundColor: '#dff',
    borderRadius: 5,
  },
  acceptButtonText: {
    color: 'green',
    fontWeight: 'bold',
  },
  pendingText: {
    color: '#FFCC00',
    fontStyle: 'italic',
    marginLeft: 10,
  },
  
  // --- Modaal stiilid ---
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});