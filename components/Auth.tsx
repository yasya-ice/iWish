import React, { useState } from 'react';
import { Alert, StyleSheet, View, Dimensions } from 'react-native';
import { supabase } from '../utils/supabase';

// Impordin abikomponendid
import WelcomeScreen from './WelcomeScreen';
import AuthForm from './AuthForm';

// Määran tüübid vaadete jaoks
export type AuthMode = 'welcome' | 'signIn' | 'signUp';

// Global pildi allikad (et vältida lokaalset 'require' viga)
// HOIATUS: Lokaalseid pilte require('../assets/logo.png') ei saa siin keskkonnas kuvada.
export const LOGO_SOURCE = require('../assets/splash-logo.png');
export const GOOGLE_ICON = { uri: 'https://img.icons8.com/color/48/000000/google-logo.png' };
export const FACEBOOK_ICON = { uri: 'https://img.icons8.com/?size=100&id=106163&format=png&color=228BE6' };

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Eemaldan 'name' oleku, kuna Supabase'i põhiautentimine seda ei nõua
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

  // Sisselogimise funktsioon (TAASTAMINE)
  async function signInWithEmail() {
    startAuth()

    // Kasutan Supabase'i funktsiooni signInWithPassword
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      // Supabase'i viga kuvatakse kasutajale
      setErrorMessage(error.message)
    }
    
    // EDUKA Sisselogimise korral App.tsx-i onAuthStateChange kuulaja
    // püüab seansi muutuse ja renderdab sisselogitud vaate.
    
    finishAuth()
  }

  // Registreerimise funktsioon (TAASTAMINE)
  async function signUpWithEmail() {
    startAuth()

    // Kasutan Supabase'i funktsiooni signUp
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
      // Supabase'i v2-s pole vaja 'name'-i
      // data: { name: name } // Vajalik, kui tahaksite profiili metaandmeid lisada
    })

    if (error) {
      setErrorMessage(error.message)
    } else {
      // Edukas registreerimine, e-posti kinnitusvajadus
      Alert.alert(
        "Kinnitusvajalik",
        "Palun kinnita oma e-posti aadress, et sisse logida. Kontrolli oma postkasti!",
        [{ text: "OK" }]
      );
      // Puhasta vormi väljad ja liigu sisselogimise vaatesse
      setEmail('');
      setPassword('');
      setName('');
      setMode('signIn'); 
    }
    
    finishAuth()
  }

  // Peamine renderdamine: valib vaate
  switch (mode) {
    case 'welcome':
      return (
        <View style={styles.authContainer}>
          <WelcomeScreen setMode={setMode} />
        </View>
      );
    case 'signIn':
    case 'signUp':
      return (
        <View style={styles.authContainer}>
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
          signUpWithEmail={signUpWithEmail} />
        </View>
      );
    default:
      return <WelcomeScreen setMode={setMode} />;
  }
}

const styles = StyleSheet.create({
  authContainer: {
    flex: 1, 
    minHeight: screenHeight, 
    minWidth: screenWidth,
    alignSelf: 'center',
  }
    // Vaikimisi stiile pole vaja, kuna alamkomponendid haldavad tausta ja paigutust.
});