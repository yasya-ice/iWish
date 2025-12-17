import React from 'react';
import { StyleSheet, View, Text, TextInput, Keyboard, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { ThemedButton } from '@/components/themed-button'; // Eeldame, et see on olemas
import Feather from '@expo/vector-icons/Feather'; // Eeldame, et see on olemas

// Määran Propide tüübi
interface AddFriendFormProps {
  friendName: string; // Kasutajanimi
  setFriendName: (text: string) => void;
  relationship: string; // Näiteks 'sister', 'BF', 'Granny'
  setRelationship: (text: string) => void;
  loading: boolean;
  errorMessage: string | null;
  handleAddFriend: () => void; // Funktsioon sõbra lisamise/otsimise käivitamiseks
}

export default function AddFriendForm({
  friendName,
  setFriendName,
  relationship,
  setRelationship,
  loading,
  errorMessage,
  handleAddFriend,
}: AddFriendFormProps) {
    
  // Nupu keelamine
  const isDisabled = loading || !friendName.trim();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.formContainer}>
        {/* Nimi/Kasutajanimi */}
        <View style={styles.verticallySpaced}>
          <Text style={styles.label}>Name:</Text>
          <TextInput
            style={styles.input}
            onChangeText={setFriendName}
            value={friendName}
            placeholder="Ann Green"
            placeholderTextColor="#c5c5c5"
            autoComplete={'username'} // Kasutame sobivat autocomplete väärtust
            autoCapitalize={'none'}
          />
        </View>
        
        {/* Suhe (Relationship) */}
        <View style={styles.verticallySpaced}>
          <Text style={styles.label}>Relationship:</Text>
          <TextInput
            style={styles.input}
            onChangeText={setRelationship}
            value={relationship}
            placeholder="sister, BF, Granny (optional)"
            placeholderTextColor="#c5c5c5"
            autoComplete={'off'}
          />
        </View>
        
        {/* VEATEADE */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Viga: {errorMessage}</Text>
          </View>
        )}

        {/* PEAMINE LISA NUPP */}
        <ThemedButton
          onPress={handleAddFriend}
          disabled={isDisabled}
          title={loading ? "Otsin..." : "Add friend"}
        />
      </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// Kasutame AddWishForm stiile, kohandades neid veidi
const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  label: {
    color: '#F5A858',
    fontFamily: 'Sora',
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 4,
  },
  verticallySpaced: {
    marginBottom: 15, // Lisa veidi rohkem vahet, et sarnaneda pildile
    alignSelf: 'center',
  },
  input: {
    width: 250,
    height: 50,
    backgroundColor: '#ffffff',
    borderWidth: 1, 
    borderColor: '#C67C4E', // Kasutan teie AddWishFormi värvi
    paddingHorizontal: 15,
    borderRadius: 20, // Kasutan teie AddWishFormi radius't
    fontSize: 16,
    color: '#000000',
  },
  errorBox: {
    padding: 10,
    backgroundColor: '#fee2e2', 
    borderColor: '#ef4444', 
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: '#b91c1c', 
    fontWeight: '600',
    fontSize: 14,
  }
});