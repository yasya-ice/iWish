import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

// Impordin abikomponendid
import WelcomeScreen from './WelcomeScreen';
import AuthForm from './AuthForm';

// Määran tüübid vaadete jaoks
export type AuthMode = 'welcome' | 'signIn' | 'signUp';

// Global pildi allikad (et vältida lokaalset 'require' viga)
// HOIATUS: Lokaalseid pilte require('../assets/logo.png') ei saa siin keskkonnas kuvada.
export const LOGO_SOURCE = require('../assets/logo.png');
export const GOOGLE_ICON = { uri: 'https://img.icons8.com/color/48/000000/google-logo.png' };
export const FACEBOOK_ICON = { uri: 'https://img.icons8.com/color/48/000000/facebook-new.png' };


// Simuleeritud Supabase'i sisselogimise ja registreerimise funktsioonid
const simulateAuth = async (email: string, password: string, isSignUp: boolean) => {
    // Siin saate simuleerida edukat või ebaõnnestunud vastust
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simuleerime laadimisaega

    if (email === "test@example.com" && password === "parool") {
        return { error: null };
    }
    
    if (isSignUp && (password.length < 6 || email.includes('fail'))) {
        return { error: { message: "Simuleeritud viga: Parool on liiga lühike või e-posti aadress on keelatud." } };
    } else if (!isSignUp && (email !== "test@example.com" || password !== "parool")) {
        return { error: { message: "Simuleeritud viga: Vale e-posti aadress või parool." } };
    }

    return { error: null };
};


export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('') 
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null) 
  const [mode, setMode] = useState<AuthMode>('welcome');
  
  // Puhastab veateate ja seab laadimise
  const startAuth = () => {
    setLoading(true)
    setErrorMessage(null)
  }

  // Lõpetab autentimise
  const finishAuth = () => {
    setLoading(false)
  }

  // Sisselogimise funktsioon
  async function signInWithEmail() {
    startAuth()

    const { error } = await simulateAuth(email, password, false); 

    if (error) {
      setErrorMessage(error.message)
    } else {
      Alert.alert("Edu", "Edukalt sisse logitud (simulatsioon)");
    }
    
    finishAuth()
  }

  // Registreerimise funktsioon
  async function signUpWithEmail() {
    startAuth()

    const { error } = await simulateAuth(email, password, true);

    if (error) {
      setErrorMessage(error.message)
    } else {
      Alert.alert(
        "Kinnitusvajalik",
        "Palun kinnita oma e-posti aadress, et sisse logida. Kontrolli oma postkasti!",
        [{ text: "OK" }]
      );
      setEmail('');
      setPassword('');
      setName('');
      setMode('signIn'); // Liigume sisselogimise vaatesse
    }
    
    finishAuth()
  }

  // Peamine renderdamine: valib vaate
  switch (mode) {
    case 'welcome':
      return <WelcomeScreen setMode={setMode} />;
    case 'signIn':
    case 'signUp':
      return (
        <AuthForm
          mode={mode}
          setMode={setMode}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          name={name}
          setName={setName}
          loading={loading}
          errorMessage={errorMessage}
          signInWithEmail={signInWithEmail}
          signUpWithEmail={signUpWithEmail}
        />
      );
    default:
      return <WelcomeScreen setMode={setMode} />;
  }
}

const styles = StyleSheet.create({
    // Vaikimisi stiile pole vaja, kuna alamkomponendid haldavad tausta ja paigutust.
});