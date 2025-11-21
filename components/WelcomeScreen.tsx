import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import type { AuthMode } from './Auth'; 
import { LOGO_SOURCE } from './Auth'; // Impordin logo

// Määran Propide tüübi
interface WelcomeScreenProps {
  setMode: (mode: AuthMode) => void;
}

export default function WelcomeScreen({ setMode }: WelcomeScreenProps) {
  return (
    <View style={styles.fullScreenContainer}>
      {/* Ülemine osa: Logo ja teksti konteiner */}
      <View style={styles.topContainer}>
        <Image style={styles.logoImage} source={LOGO_SOURCE} />
        <Text style={styles.welcomeTitle}>
          All Your Wishes 
          {/* Parandatud: RN-s tuleb kasutada {"\n"} reavahetuseks */}
          {"\n"}Will Be Fulfilled
        </Text>
      </View>
      
      {/* Alumine osa: Nupud */}
      <View style={styles.welcomeButtonsContainer}>
        {/* Sign Up nupp */}
        <TouchableOpacity 
          style={[styles.bigOrangeButton, styles.buttonSpacing]}
          onPress={() => setMode('signUp')}
        >
          <Text style={styles.bigOrangeButtonText}>Sign Up</Text>
        </TouchableOpacity>
        
        {/* Sign In nupp */}
        <TouchableOpacity 
          style={styles.bigOrangeButton}
          onPress={() => setMode('signIn')}
        >
          <Text style={styles.bigOrangeButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // --- ÜLDISED KONTEINERID ---
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#0a1d35',
    alignItems: 'center',
    paddingTop: 80, 
    paddingHorizontal: 20,
    justifyContent: 'space-between', // Jagab sisu ülemise ja alumise konteineri vahel
  },
  topContainer: {
    justifyContent: 'center', 
    alignItems: 'center',    
    // flex: 1 siin aitab lükata welcomeButtonsContainer alla
    flex: 1, 
    paddingTop: 50,
  },
  
  // --- LOGO ---
  logoImage: {
    width: 100, 
    height: 100, 
    resizeMode: 'contain', 
    marginBottom: 20,
  },

  // --- WELCOME/SPLASH EKRAANI STIILID ---
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 15,
  },
  welcomeButtonsContainer: {
    width: '100%',
    paddingBottom: 50, 
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
  buttonSpacing: {
    marginBottom: 15,
  },
});