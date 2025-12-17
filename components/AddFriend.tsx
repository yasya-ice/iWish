import React, { useState } from 'react';
import { Alert, StyleSheet, View, Dimensions, Text, TouchableOpacity } from 'react-native';
// Kuigi me seda siin otse ei kasuta, on hea see faili struktuuris hoida
// import { supabase } from '../utils/supabase'; 
// Asenda see impordiga, mis viitab teie friendService.ts failile
import { searchUsersByUsername, sendFriendRequest, UserProfile } from '@/services/friendService';

// Impordin abikomponendi
import AddFriendForm from './AddFriendForm';
import Feather from '@expo/vector-icons/Feather'; // Modaali sulgemise nupu jaoks

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;


// Sõbra lisamise funktsionaalsus on nüüd otsing ja lisamine
export default function AddFriend({ 
    onCloseModal, 
    onFriendAdded // Lisame uue prop'i nimekirja värskendamiseks friends.tsx-is
}: { 
    onCloseModal: () => void;
    onFriendAdded: () => void;
}) {
  const [friendName, setFriendName] = useState('');
  const [relationship, setRelationship] = useState(''); // Suhte silt
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Puhastab veateate ja seab laadimise
  const startAction = () => {
    setLoading(true);
    setErrorMessage(null);
  };

  // Lõpetab tegevuse
  const finishAction = () => {
    setLoading(false);
  };

  /**
   * Käitleb sõbra lisamist: otsib kasutajat ja saadab sõprusettepaneku.
   * Praeguses disainis (ühe väljaga) peame kohe proovima kasutajat leida.
   */
  async function handleAddFriend() {
    if (!friendName.trim()) {
      setErrorMessage("Palun sisestage sõbra kasutajanimi.");
      return;
    }
    
    startAction();

    try {
      // 1. Otsime kasutajat kasutajanime järgi
      const searchResults = await searchUsersByUsername(friendName.trim());
      
      if (searchResults.length === 0) {
        setErrorMessage(`Kasutajat nimega "${friendName}" ei leitud platvormilt.`);
        finishAction();
        return;
      }
      
      // Eeldame, et võtame esimese vaste (või peaksite arendama parema valiku/kinnituse)
      const targetUser = searchResults[0];
      
      // 2. Saadame sõprusettepaneku
      // Kasutame targetUser.id (see on profiles tabeli ID)
      await sendFriendRequest(targetUser.id);
      
      // 3. Õnnestunud salvestamine
      Alert.alert(
        "Ettepanek saadetud", 
        `Sõprusettepanek kasutajale ${targetUser.username} saadetud!`
      );
      
      // Puhasta olekud ja sulge modaal
      setFriendName('');
      setRelationship('');
      onFriendAdded(); // Värskendab sõprade nimekirja friends.tsx-is
      onCloseModal(); 

    } catch (error: any) {
      // Püüame vead, mis tulevad näiteks 'sendFriendRequest' funktsioonist
      setErrorMessage(error.message || "Tundmatu viga sõbra lisamisel.");
    }
    
    finishAction();
  }

  return (
    <View style={styles.addFriendContainer}>
        {/* Modal Header koos pealkirja ja sulgemisnupuga */}
        <View style={styles.header}>
            <Text style={styles.title}>Add a friend</Text>
            <TouchableOpacity onPress={onCloseModal} style={styles.closeButton}>
                <Feather name="x" size={24} color="#000" />
            </TouchableOpacity>
        </View>

        {/* Vorm */}
        <AddFriendForm
            friendName={friendName}
            setFriendName={setFriendName}
            relationship={relationship}
            setRelationship={setRelationship}
            loading={loading}
            errorMessage={errorMessage}
            handleAddFriend={handleAddFriend}
        />
    </View>
  );
}

const styles = StyleSheet.create({
    addFriendContainer: {
        width: screenWidth * 0.85, // Muuda laius modaali jaoks sobivaks
        height: screenHeight * 0.45, // Muuda kõrgus modaali jaoks sobivaks
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 22, // Figma järgi
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 1,
        position: 'relative',
    },
    title: {
        padding: 15,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFA500', // Sarnane pildil olevale värvile
        textAlign: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#535252ff',
    }
});