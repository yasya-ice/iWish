import React, { useState } from 'react';
import { Alert, StyleSheet, View, Dimensions } from 'react-native';
import { supabase } from '../utils/supabase';

// Impordin abikomponendid
import AddWishForm from './AddWishForm';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function AddWish() {
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [description, setDescription] = useState('') 
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null) 
  
  // Puhastab veateate ja seab laadimise
  const startSave = () => {
    setLoading(true)
    setErrorMessage(null)
  }

  // Lõpetab autentimise
  const finishSave = () => {
    setLoading(false)
  }

  // Sisselogimise funktsioon (TAASTAMINE)
  /*async function signInWithEmail() {
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
      // data: {onCloseModal={closeModal} name: name } // Vajalik, kui tahaksite profiili metaandmeid lisada
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
  } */

  async function addWish() {
    startSave()
    Alert.alert("Wish added")
  }

  // Peamine renderdamine: valib vaate
  return (
    <View style={styles.addWishContainer}>
      <AddWishForm
        title={title}
        setTitle={setTitle}
        link={link}
        setLink={setLink}
        description={description}
        setDescription={setDescription}
        loading={loading}
        errorMessage={errorMessage}
        addWish={addWish} />
    </View>
  );
}

const styles = StyleSheet.create({
  addWishContainer: {
    flex: 1, 
    alignSelf: 'center',
  }
    // Vaikimisi stiile pole vaja, kuna alamkomponendid haldavad tausta ja paigutust.
});