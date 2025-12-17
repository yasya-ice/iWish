import React, { useState, useEffect, useCallback } from 'react';
import { Image, View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, Button } from 'react-native';
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
      <View style={styles.friendInfo}>
      {/* Profiilipilt */}
      {item.avatar_url ? (
        <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Feather name="user" size={20} color="#666" />
        </View>
      )}

      {/* Nimi ja suhe */}
      <View style={styles.textContainer}>
        <Text style={styles.friendName}>{item.username}</Text>
        <Text style={styles.friendRelationship}>{item.relationship}</Text>
      </View>
    </View>
    
    {/* Tegevusnupud (Kustuta/Võta vastu) */}
    <View style={styles.actionButtons}>
      {item.status === 'pending' && (
<>
      {item.is_initiator ? (
        // KUI SINA SAATSID: Kollane "Ootel" silt
        <View style={styles.pendingLabel}>
          <Text style={styles.pendingLabelText}>Sent</Text>
        </View>
      ) : (
        // KUI SULLE SAADETI: Roheline "Võta vastu" nupp
        <TouchableOpacity 
          onPress={() => handleAcceptRequest(item.id)} 
          style={styles.acceptButton}
        >
          <Text style={styles.acceptButtonText}>Võta vastu</Text>
        </TouchableOpacity>
      )}
    </>
  )}

  <TouchableOpacity 
      style={styles.closeButton} 
      onPress={() => handleDeleteFriend(item.profile_id)}
  >
      <Feather name='x' size={18} color="#000" /> 
  </TouchableOpacity>
</View>
  </View>
);

  // --- PÕHI RENDERDAMINE ---
  return (
    <View style={styles.container}>
      {session && session.user ? (
        <>
          {/* Add Friend Modal */}
          <Modal
            animationType="fade"
            transparent
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

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My friends</Text>
            <TouchableOpacity
              onPress={() => setIsAddFriendModalVisible(true)}
              style={styles.addButton}
            >
              <Feather name="user-plus" size={24} color="#F9F2ED" />
            </TouchableOpacity>
          </View>

          {/* Loading */}
          {loading && (
            <ActivityIndicator size="large" color="#FFA500" style={styles.loader} />
          )}

          {!loading && (
            <>
              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Friend requests</Text>
                  <FlatList
                    data={pendingRequests}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderFriendItem}
                  />
                </View>
              )}

              {/* Accepted Friends */}
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
)}

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
  avatar: {
  width: 50,
  height: 50,
  borderRadius: 25, // Teeb pildi ümmarguseks
  marginRight: 15,
},
avatarPlaceholder: {
  backgroundColor: '#eee',
  justifyContent: 'center',
  alignItems: 'center',
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
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    justifyContent: 'space-between',
  },
  friendName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendRelationship: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
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
  textContainer: {
  justifyContent: 'center',
},
  closeButton: {
width: 28,
  height: 28,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: '#ddd',
  justifyContent: 'center', 
  alignItems: 'center',
  marginLeft: 10,
},
  acceptButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#E8F5E9', // Rohekas taust
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  acceptButtonText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pendingText: {
    color: '#FFCC00',
    fontStyle: 'italic',
    marginLeft: 10,
  },
  pendingLabel: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFF9C4', // Helekollane taust
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#FBC02D', // Tumedam kollane piirjoon
  },
  pendingLabelText: {
    color: '#F57F17', // Oranžikas-kollane tekst
    fontWeight: 'bold',
    fontSize: 14,
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