import React, { useState } from 'react'
import { StyleSheet, View, Text, TextInput, Button, Alert } from 'react-native'
import { supabase } from '../utils/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null) // Uus olek veateate jaoks

  // Puhastab veateate ja seab laadimise
  const startAuth = () => {
    setLoading(true)
    setErrorMessage(null) // Puhasta eelmine viga
  }

  // Lõpetab autentimise
  const finishAuth = () => {
    setLoading(false)
  }

  // Sisselogimise funktsioon
  async function signInWithEmail() {
    startAuth()

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      // Kasutame nüüd sisemist olekut veateate näitamiseks
      setErrorMessage(error.message)
    }
    
    finishAuth()
  }

  // Registreerimise funktsioon
  async function signUpWithEmail() {
    startAuth()

    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) {
      // Kasutame nüüd sisemist olekut veateate näitamiseks
      setErrorMessage(error.message)
    } else {
      // Edukas registreerimine, kuid Supabase nõuab vaikimisi e-posti kinnitust
      // Saadame meeldetuletuse
      Alert.alert(
        "Kinnitusvajalik",
        "Palun kinnita oma e-posti aadress, et sisse logida. Kontrolli oma postkasti!",
        [{ text: "OK" }]
      );
    }
    
    finishAuth()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>iWish Sisselogimine</Text>

      {/* Meili sisestusväli */}
      <View style={styles.verticallySpaced}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@aadress.ee"
          autoCapitalize={'none'}
          keyboardType={'email-address'} // Parema kasutuskogemuse jaoks
        />
      </View>
      
      {/* Parooli sisestusväli */}
      <View style={styles.verticallySpaced}>
        <Text style={styles.label}>Parool:</Text>
        <TextInput
          style={styles.input}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Parool (min 6 tähemärki)" // Lisame vihje parooli pikkuse kohta
          autoCapitalize={'none'}
        />
      </View>

      {/* VEATEADE (Kuvatakse ainult siis, kui on viga) */}
      {errorMessage && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Viga: {errorMessage}</Text>
        </View>
      )}

      {/* Sisselogimise nupp */}
      <View style={styles.buttonContainer}>
        <Button 
          title={loading ? "Laeb..." : "Logi sisse"} 
          disabled={loading || !email || !password} 
          onPress={() => signInWithEmail()} 
        />
      </View>

      {/* Registreerimise nupp */}
      <View style={styles.buttonContainer}>
        <Button 
          title={loading ? "Laeb..." : "Registreeri"} 
          disabled={loading || !email || !password} 
          onPress={() => signUpWithEmail()} 
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1, // Keskendamiseks
    justifyContent: 'center', // Keskendame sisendvääljad ekraanil
    alignItems: 'stretch',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  verticallySpaced: {
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    marginTop: 10,
  },
  errorBox: {
    padding: 10,
    backgroundColor: '#fee2e2', // Punakas taust
    borderColor: '#ef4444', 
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: '#b91c1c', // Tume punane tekst
    fontWeight: '600',
    fontSize: 14,
  }
})