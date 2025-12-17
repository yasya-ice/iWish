import React, { useState } from 'react';
import { Alert, StyleSheet, View, Dimensions } from 'react-native';
import { supabase } from '../utils/supabase';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

// Impordin abikomponendid
import AddWishForm from './AddWishForm';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function AddWish({ onCloseModal }: { onCloseModal: () => void }) {
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [description, setDescription] = useState('') 
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null) 
  const [imageUri, setImageUri] = useState<string | null>(null);
  
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


//Pildi tegemise loogika
const takePhoto = async () => {
  // 1. Küsi kaamera ja meediakogu (et tehtud pilti salvestada) õiguseid
  const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
  const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
    Alert.alert('Permission needed', 'Sorry, we need camera and photo library permissions to take and save a picture!');
    return;
  }

  // 2. Käivita kaamera
  let result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true, // Lubab kasutajal pilti lõigata
    aspect: [4, 3], 
    quality: 1, 
  });

  if (!result.canceled) {
    // 3. Salvesta tehtud pildi URI olekusse
    setImageUri(result.assets[0].uri);
  }
};

  // Pildi valimise loogika
  const pickImage = async () => {
    // Kontrollime õiguseid (Android/iOS)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Lubab kasutajal pilti lõigata
      aspect: [4, 3], // Pildi suhe
      quality: 1, // Kvaliteet
    });

    if (!result.canceled) {
      // Salvestame pildi URI
      setImageUri(result.assets[0].uri);
    }
  };

// Pildi üleslaadimine (abifunktsioon)
// Võtab vastu kohaliku pildi URI ja kasutaja ID --> tagastab Storage'i URL-i
async function uploadImage(uri: string, userId: string): Promise<string> {
  // Loome kordumatu failinime, et vältida konflikte
  const fileName = `${userId}/${Date.now()}.jpg`;
  let uploadData: Blob | Uint8Array;

  // 1. tõmbab pildi binaarandmed
  if (Platform.OS === 'web') {
    // On web, fetch gives a Blob
    const response = await fetch(uri);
    uploadData = await response.blob();
  } else {
    // On native, read file as base64 and convert to Uint8Array
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    uploadData = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  }
  
  // 2. Laadime Supabase Storage'i
  const { data, error } = await supabase.storage
    .from('wish_images') //Storage Bucket'i nimi
    .upload(fileName, uploadData, {
      contentType: 'image/jpeg',
      upsert: false,
    });
    
  if (error) {
    throw new Error('Pildi üleslaadimine ebaõnnestus: ' + error.message);
  }

  // 3. Loome avaliku URL-i
  const { data: publicUrlData } = supabase.storage
    .from('wish_images')
    .getPublicUrl(fileName);
    
  return publicUrlData.publicUrl;
}

// UUS: Arendatud addWish funktsioon
async function addWish() {
const { data: userData } = await supabase.auth.getUser(); // Kasutan userData, et vältida nimede konflikti
const user = userData.user; // 'user' = ainult kasutajaandmed

if (!user) { // Nüüd kontrollib otse kasutaja objekti
  setErrorMessage("Kasutaja pole sisse logitud.");
  return;
}
  
  startSave();

  let imageUrl: string | null = null;
  
  try {
    // 1. Pildi üleslaadimine (kui URI on olemas)
    if (imageUri) {
      imageUrl = await uploadImage(imageUri, user.id);
    }

    // 2. Andmete salvestamine andmebaasi
    const { error: dbError } = await supabase
      .from('wishes') // Teie tabeli nimi
      .insert({
        user_id: user.id,
        title: title,
        link: link, // Kuigi te seda veel ei kuva, on see hea salvestada
        description: description,
        image_url: imageUrl,
        came_true: false, // Vaikimisi false, home-actual vaates kuvamiseks
      });

    if (dbError) {
      setErrorMessage(dbError.message);
      finishSave();
      return;
    }

    // 3. Õnnestunud salvestamine
    Alert.alert("Soov lisatud", "Sinu soov on edukalt salvestatud!");
    
    // Puhasta olekud ja sulge modaal
    setTitle('');
    setLink('');
    setDescription('');
    setImageUri(null);
    onCloseModal(); // Eeldab, et võtad vastu onCloseModal propina!

  } catch (error: any) {
    setErrorMessage(error.message || "Tundmatu viga salvestamisel.");
  }
  
  finishSave();
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
        addWish={addWish}
        imageUri={imageUri}
        onPickImage={pickImage}
        onTakePhoto={takePhoto}
        />
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