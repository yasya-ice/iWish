import React from 'react';
import { StyleSheet, View, Text, TextInput, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { ThemedButton } from '@/components/themed-button';

interface AddFriendFormProps {
  friendName: string;
  setFriendName: (text: string) => void;
  relationship: string;
  setRelationship: (text: string) => void;
  loading: boolean;
  errorMessage: string | null;
  handleAddFriend: () => void;
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
  const isDisabled = loading || !friendName.trim();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.formContainer}>
          <View style={styles.verticallySpaced}>
            <Text style={styles.label}>e-mail:</Text>
            <TextInput
              style={styles.input}
              onChangeText={setFriendName}
              value={friendName}
              placeholder="maret.vaabel@voco.ee"
              placeholderTextColor="#c5c5c5"
              autoComplete="email"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          
          <View style={styles.verticallySpaced}>
            <Text style={styles.label}>Relationship:</Text>
            <TextInput
              style={styles.input}
              onChangeText={setRelationship}
              value={relationship}
              placeholder="sister, BF, Granny (optional)"
              placeholderTextColor="#c5c5c5"
              autoComplete="off"
            />
          </View>
          
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>Viga: {errorMessage}</Text>
            </View>
          ) : null}

          <ThemedButton
            onPress={handleAddFriend}
            disabled={isDisabled}
            title={loading ? "Otsin..." : "Add friend"}
            style={{ width: 250, height: 50, borderRadius: 25, marginTop: 5 }}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  label: {
    color: '#F5A858',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 5,
  },
  verticallySpaced: {
    marginBottom: 25,
    alignSelf: 'center',
  },
  input: {
    width: 250,
    height: 50,
    backgroundColor: '#ffffff',
    borderWidth: 1, 
    borderColor: '#C67C4E',
    paddingHorizontal: 15,
    borderRadius: 20,
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