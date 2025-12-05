import React from 'react';
import { StyleSheet, View, Text, TextInput} from 'react-native';
import { ThemedButton } from '@/components/themed-button';

// Määran Propide tüübi
interface AddWishFormProps {
  title: string;
  setTitle: (text: string) => void;
  link: string;
  setLink: (text: string) => void;
  description: string;
  setDescription: (text: string) => void;
  loading: boolean;
  errorMessage: string | null;
  addWish: () => void;
}

export default function AddWishForm({
  title,
  setTitle,
  link,
  setLink,
  description,
  setDescription,
  loading,
  errorMessage,
  addWish,
}: AddWishFormProps) {
    
    // Nupu keelamine
    const isDisabled = loading || !title

  return (
    <View>
        {/* Tiitle */}
        <View style={styles.verticallySpaced}>
          <Text style={styles.label}>Title:</Text>
          <TextInput
            style={styles.input}
            onChangeText={setTitle}
            value={title}
            placeholder="Set of candles"
            placeholderTextColor="#c5c5c5"
            autoComplete={'off'}
          />
        </View>
        
        {/* Link */}
        <View style={styles.verticallySpaced}>
          <Text style={styles.label}>Link:</Text>
          <TextInput
            style={styles.input}
            onChangeText={setLink}
            value={link}
            placeholder="https://www.kaubamaja.ee/h0570839"
            placeholderTextColor="#c5c5c5"
            autoCapitalize={'none'}
            keyboardType={'url'}
            autoComplete={'off'}
          />
        </View>
        
        {/* Kirjeldus */}
        <View style={styles.verticallySpaced}>
          <Text style={styles.label}>Description:</Text>
          <TextInput
            style={[styles.input, {height: 100}]}
            multiline={true}
            onChangeText={setDescription}
            value={description}
            placeholder="Details about the wish" 
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

        {/* PEAMINE AUTENTIMISE NUPP */}
        <ThemedButton
          
          onPress={addWish}
          disabled={isDisabled}
          title={loading ? "Loading..." : "Save"}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  // --- ÜLDISED KONTEINERID ---
  container: {
    paddingHorizontal: 20,
    paddingTop: 60,
    flex: 1,
    paddingBottom: 20, // Lisatud padding bottom, et sisu ei jääks ekraani serva 
    alignItems: 'stretch',
    justifyContent: 'space-around', // Ainus viis tagada, et kogu sisu mahub avavaatesse (mitte kerimisse)
  },
  
  // --- LOGO JA PÄIS ---
  headerContainer: {
    justifyContent: 'center', 
    alignItems: 'center',    
    marginBottom: 20, // Vähendatud
  },
  logoImage: {
    width: 150,  
    height: 150, 
    resizeMode: 'contain', 
    marginBottom: 10, // Vähendatud
  },

  // --- SISENDVÄLJAD JA SILT ---
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#F5A858',
    marginLeft: 10
  },
  verticallySpaced: {
    marginBottom: 10,
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

  // --- SOTSIAALMEEDIA JA LÜLITI ---
  orText: {
    textAlign: 'center',
    color: '#cccccc',
    marginVertical: 15, // Vähendatud 20-lt 15-le
    fontSize: 16,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15, // Vähendatud 30-lt 15-le
  },
  socialButton: {
    backgroundColor: '#ffffff',
    borderRadius: 50,
    padding: 10,
    marginHorizontal: 10,
  },
  socialIcon: {
    width: 30,
    height: 30,
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 10, // Vähendatud 20-lt 10-le
  },
  switchText: {
    color: '#ffffff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },

  // --- VEATEADE ---
  errorBox: {
    padding: 10,
    backgroundColor: '#fee2e2', 
    borderColor: '#ef4444', 
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10, // Vähendatud
  },
  errorText: {
    color: '#b91c1c', 
    fontWeight: '600',
    fontSize: 14,
  }
})