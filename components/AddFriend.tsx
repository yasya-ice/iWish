import React, { useState } from 'react';
import { Alert, StyleSheet, View, Dimensions, Text, TouchableOpacity } from 'react-native';
import { searchUsersByUsername, sendFriendRequest } from '@/services/friendService';
import AddFriendForm from './AddFriendForm';
import Feather from '@expo/vector-icons/Feather';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function AddFriend({ 
    onCloseModal, 
    onFriendAdded 
}: { 
    onCloseModal: () => void;
    onFriendAdded: () => void;
}) {
  const [friendName, setFriendName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startAction = () => {
    setLoading(true);
    setErrorMessage(null);
  };

  const finishAction = () => {
    setLoading(false);
  };

  async function handleAddFriend() {
    if (!friendName.trim()) {
      setErrorMessage("Palun sisestage sõbra kasutajanimi.");
      return;
    }
    
    startAction();

    try {
      const searchResults = await searchUsersByUsername(friendName.trim());
      
      if (searchResults.length === 0) {
        setErrorMessage(`Kasutajat nimega "${friendName}" ei leitud.`);
        finishAction();
        return;
      }
      
      const targetUser = searchResults[0];
      await sendFriendRequest(targetUser.id, relationship.trim());
      
      Alert.alert("Saadetud", "Sõprusettepanek saadetud!");
      
      setFriendName('');
      setRelationship('');
      onFriendAdded(); 
      onCloseModal(); 

    } catch (error: any) {
      setErrorMessage(error.message || "Viga lisamisel.");
    }
    
    finishAction();
  }

  return (
    <View style={styles.addFriendContainer}>
        <View style={styles.header}>
            <Text style={styles.title}>Add a friend</Text>
            <TouchableOpacity onPress={onCloseModal} style={styles.closeButton}>
                <Feather name="x" size={24} color="#000" />
            </TouchableOpacity>
        </View>

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
        width: screenWidth * 0.85,
        height: screenHeight * 0.45,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 22,
        alignItems: 'center',
        elevation: 5,
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        position: 'relative',
    },
    title: {
        padding: 15,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFA500',
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
        borderColor: '#535252',
    }
});