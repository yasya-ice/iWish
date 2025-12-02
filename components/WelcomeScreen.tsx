import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import type { AuthMode } from './Auth'; 
import { LOGO_SOURCE } from './Auth'; // Impordin logo
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedButton } from '@/components/themed-button';

// Määran Propide tüübi
interface WelcomeScreenProps {
  setMode: (mode: AuthMode) => void;
}

export default function WelcomeScreen({ setMode }: WelcomeScreenProps) {
  return (
    <LinearGradient colors={['#0D3245', '#115476', '#000000']} locations={[0.3, 0.6, 0.9]} style={styles.fullScreenContainer} >
      {/* Ülemine osa: Logo ja teksti konteiner */}
      <View style={styles.topContainer}>
        <Image style={styles.logoImage} source={LOGO_SOURCE} />
        <Text style={styles.welcomeTitle}> All Your{" "}
        <Text style={styles.highlightText}>Wishes</Text>
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
          style={[styles.bigOrangeButton, {backgroundColor: '#c67c4e'}]}
          onPress={() => setMode('signIn')}
        >
          <Text style={styles.bigOrangeButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
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
    //flex: 1, 
    paddingTop: 0,
  },
  
  // --- LOGO ---
  logoImage: {
    width: 200, 
    height: 200, 
    resizeMode: 'contain', 
    marginBottom: 10,
  },

  // --- WELCOME/SPLASH EKRAANI STIILID ---
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'Sora',
    textAlign: 'center',
    marginTop: 85,
    textTransform: 'capitalize',
    lineHeight: 40, 
  },
  highlightText: {
    color: '#F2E9C2',
    fontFamily: 'Sora',
  },
  welcomeButtonsContainer: {
    width: '100%',
    paddingBottom: 170, 
    alignItems: 'center',
  },

  // --- NUPUD ---
  bigOrangeButton: {
  width: 270,
  height: 55,
  paddingVertical: 16,
  paddingHorizontal: 20,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 20,
  backgroundColor: '#F5A858',
},

  bigOrangeButtonText: {
  color: '#FFF',
  fontSize: 16,
  fontWeight: '600',
  lineHeight: 24,
  fontFamily: 'Sora',
  },

  buttonSpacing: {
    marginBottom: 15,
  },
});