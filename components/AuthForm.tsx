import React from 'react';
import { StyleSheet, View, Text, TextInput, Image, TouchableOpacity } from 'react-native';
import type { AuthMode } from './Auth'; 
import { LOGO_SOURCE, GOOGLE_ICON, FACEBOOK_ICON } from './Auth'; // Impordin konstandid

// Määran Propide tüübi
interface AuthFormProps {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  email: string;
  setEmail: (text: string) => void;
  password: string;
  setPassword: (text: string) => void;
  name: string;
  setName: (text: string) => void;
  loading: boolean;
  errorMessage: string | null;
  signInWithEmail: () => void;
  signUpWithEmail: () => void;
}

export default function AuthForm({
  mode,
  setMode,
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  loading,
  errorMessage,
  signInWithEmail,
  signUpWithEmail,
}: AuthFormProps) {
    
    const isSignUpMode = mode === 'signUp';
    const mainButtonTitle = isSignUpMode ? "Sign Up" : "Sign In";
    const onSubmit = isSignUpMode ? signUpWithEmail : signInWithEmail;
    
    // Nupu keelamine
    const isDisabled = loading || !email || !password || (isSignUpMode && !name);

  return (
    // container kasutab flex: 1 ja space-around, et vältida kerimist
    <View style={styles.container}>
        {/* Logo ja Päis */}
        <View style={styles.headerContainer}>
          <Image style={styles.logoImage} source={LOGO_SOURCE} />
        </View>

        {/* Nimi (ainult Registreerimisel) */}
        {isSignUpMode && (
          <View style={styles.verticallySpaced}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              onChangeText={setName}
              value={name}
              placeholder="Zoe Litvin"
              placeholderTextColor="#888"
              autoCapitalize={'words'}
            />
          </View>
        )}

        {/* Meil */}
        <View style={styles.verticallySpaced}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            onChangeText={setEmail}
            value={email}
            placeholder="example@gmail.com"
            placeholderTextColor="#888"
            autoCapitalize={'none'}
            keyboardType={'email-address'}
          />
        </View>
        
        {/* Parool */}
        <View style={styles.verticallySpaced}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            secureTextEntry={true}
            placeholder="********" 
            placeholderTextColor="#888"
            autoCapitalize={'none'}
          />
        </View>

        {/* VEATEADE */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Viga: {errorMessage}</Text>
          </View>
        )}

        {/* PEAMINE AUTENTIMISE NUPP */}
        <TouchableOpacity 
            style={[styles.bigOrangeButton, styles.buttonSpacing, isDisabled && styles.disabledButton]}
            onPress={onSubmit}
            disabled={isDisabled} 
        >
            <Text style={styles.bigOrangeButtonText}>
                {loading ? "Laeb..." : mainButtonTitle}
            </Text>
        </TouchableOpacity>
        
        {/* SOTSIAALMEEDIA NUPUD JA TEKST */}
        <Text style={styles.orText}>Or sign {mainButtonTitle.toLowerCase()} with</Text>
        <View style={styles.socialButtonsContainer}>
            {/* Google */}
            <TouchableOpacity style={styles.socialButton}>
                <Image source={GOOGLE_ICON} style={styles.socialIcon} />
            </TouchableOpacity>
            {/* Facebook */}
            <TouchableOpacity style={styles.socialButton}>
                <Image source={FACEBOOK_ICON} style={styles.socialIcon} />
            </TouchableOpacity>
        </View>
        
        {/* Lüliti (Sign In / Sign Up) */}
        <TouchableOpacity 
            style={styles.switchButton}
            onPress={() => {
              setMode(isSignUpMode ? 'signIn' : 'signUp');
              // Vead ja laadimise olek peaks olema puhastatud Auth.tsx poolt
            }}
        >
            <Text style={styles.switchText}>
                {isSignUpMode 
                    ? "Already have an account? Sign In" 
                    : "Don't have an account? Sign Up"}
            </Text>
        </TouchableOpacity>

      </View>
  );
}

const styles = StyleSheet.create({
  // --- ÜLDISED KONTEINERID ---
  container: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20, // Lisatud padding bottom, et sisu ei jääks ekraani serva
    flex: 1, 
    alignItems: 'stretch',
    backgroundColor: '#0a1d35',
    justifyContent: 'space-around', // Ainus viis tagada, et kogu sisu mahub avavaatesse (mitte kerimisse)
  },
  
  // --- LOGO JA PÄIS ---
  headerContainer: {
    justifyContent: 'center', 
    alignItems: 'center',    
    marginBottom: 20, // Vähendatud
  },
  logoImage: {
    width: 100,  
    height: 100, 
    resizeMode: 'contain', 
    marginBottom: 10, // Vähendatud
  },

  // --- SISENDVÄLJAD JA SILT ---
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#cccccc',
  },
  verticallySpaced: {
    marginBottom: 10, // Vähendatud 15-lt 10-le
  },
  input: {
    height: 50,
    backgroundColor: '#ffffff',
    borderWidth: 1, 
    borderColor: '#ffffff',
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
    color: '#000000',
  },

  // --- NUPUD ---
  bigOrangeButton: {
    backgroundColor: '#f7931e',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  bigOrangeButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#cc771a',
    opacity: 0.7,
  },
  buttonSpacing: {
    marginTop: 10,
    marginBottom: 10,
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