import { IconSymbol } from '@/components/ui/icon-symbol';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '@/utils/supabase'; 
import { Session } from '@supabase/supabase-js'; 
import { Redirect, useRouter } from 'expo-router';
import { decode } from 'base64-arraybuffer';
export default function Profile() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState('Maret Vaabel');
  const [email, setEmail] = useState('maret.vaabel@gmail.com');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [notifications, setNotifications] = useState({
    push: true,
    deadline: true,
    wishes: true,
    completed: false,
  });

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
      // 1. Kontrolli seansi olekut käivitamisel
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Seadista reaalajas kuulaja olekumuutustele
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    // Puhasta kuulaja komponendi eemaldamisel
    return () => subscription.unsubscribe();
  }, []);

  // 3. Uus useEffect andmete laadimiseks, kui session muutub
  useEffect(() => {
    const fetchProfile = async () => {
      // Kontrollime, et session ja user on olemas, et vältida 'null' viga
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, username')
          .eq('id', session.user.id)
          .single();

        if (data) {
          setName(data.full_name || '');
          setProfileImage(data.avatar_url);
          setEmail(data.username || session.user.email || '');
        }
      }
    };

    fetchProfile();
  }, [session]);
  

  // Vali pilt seadmest
  const pickImage = async () => {
   const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Viga', 'Vajame piltidele ligipääsu!');
    return;
  }

  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
    base64: true, // See on veebis testimiseks kriitiline!
  });

  if (!result.canceled && session?.user && result.assets[0].base64) {
    try {
      const asset = result.assets[0];
      const fileExt = asset.uri.split('.').pop()?.toLowerCase();
      // Failinimi juurkausta (vastavalt su uuele poliitikale)
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;

      // 1. Laadi üles kasutades ArrayBufferit (lahendab 400 Bad Request vea veebis)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user_images')
        .upload(fileName, decode(asset.base64!), {
          contentType: `image/${fileExt}`,
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 2. Hankige avalik URL
      const { data: { publicUrl } } = supabase.storage
        .from('user_images')
        .getPublicUrl(fileName);

      // 3. Salvesta link andmebaasi 'profiles' tabelisse
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setProfileImage(publicUrl);
      Alert.alert('Edu!', 'Profiilipilt on uuendatud.');
    } catch (error: any) {
      console.error("Viga:", error);
      Alert.alert('Viga üleslaadimisel', error.message);
    }
  }
};

  // Salvesta muudatused
  const saveField = async (field: string, value: string) => {
if (!session?.user) return;

  try {
    if (field === 'name') {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: value }) // See uuendab andmebaasi!
        .eq('id', session.user.id);

      if (error) throw error;
      setName(value);
      setIsEditingName(false);
    } 
    // Email on tavaliselt auth.users tabelis, seega seda profiles kaudu ei muudeta lihtsalt.
  } catch (error: any) {
    Alert.alert('Viga', error.message);
  }
};

  // Muuda parooli
  const handleChangePassword = () => {
    Alert.alert(
      'Muuda parool',
      'Siin avaneb parooli muutmise ekraan.',
      [
        { text: 'Tühista' },
        { 
          text: 'Jätkan', 
          onPress: () => Alert.alert('Parooli muutmise funktsioon veel ehituses...') 
        },
      ]
    );
  };

  // Logi valja
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Lülita teavitused
  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Kui seanss on olemas, kuva sisselogitud sisu */}
          {session && session.user ? (
            <>
              {/* Pealkiri */}
              <Text style={styles.header}>My Profile</Text>

              {/* Valja logimine */}
              <View style={styles.signOutContainer}>
                <TouchableOpacity 
                  style={styles.signOutButton} 
                  onPress={handleLogout}
                >
                  <Ionicons name="exit-outline" size={24} color="#fff"/>
                  <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
              {/* Profiilipilt */}
              <View style={styles.profilePicContainer}>
                <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profilePic} />
                  ) : (
                    <View style={styles.profilePicPlaceholder}>
                      <IconSymbol size={70} name="person" color={'#000000'} />
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={pickImage} style={styles.addIcon}>
                  <Text style={styles.addIconText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Account Settings */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Settings</Text>

                {/* Name */}
                <View style={styles.fieldRow}>
                  <Text style={styles.label}>Name</Text>
                  {isEditingName ? (
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        onBlur={() => saveField('name', name)}
                        autoFocus
                        placeholder="Enter your name"
                        placeholderTextColor="#999"
                      />
                    </View>
                  ) : (
                    <View style={styles.valueContainer}>
                      <Text style={styles.value}>{name}</Text>
                      <TouchableOpacity onPress={() => setIsEditingName(true)}>
                        <IconSymbol size={28} name="pen" color={'#687076'} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Email */}
                <View style={styles.fieldRow}>
                  <Text style={styles.label}>E-mail</Text>
                  {isEditingEmail ? (
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        onBlur={() => saveField('email', email)}
                        keyboardType="email-address"
                        autoFocus
                        placeholder="Enter your email"
                        placeholderTextColor="#999"
                      />
                    </View>
                  ) : (
                    <View style={styles.valueContainer}>
                      <Text style={styles.value}>{email}</Text>
                      <TouchableOpacity onPress={() => setIsEditingEmail(true)}>
                        <IconSymbol size={28} name="pen" color={'#687076'} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Change Password */}
                <View style={styles.fieldRow}>
                  <Text style={styles.label}>Change Password</Text>
                  <TouchableOpacity onPress={handleChangePassword}>
                      <IconSymbol size={28} name="arrow-right" color={'#687076'} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Notifications */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notifications</Text>

                <View style={styles.notificationRow}>
                  <Text style={styles.notificationLabel}>Push-up notifications</Text>
                  <Switch
                    value={notifications.push}
                    onValueChange={() => toggleNotification('push')}
                    trackColor={{ false: '#767577', true: '#4CAF50' }}
                    thumbColor={notifications.push ? '#fff' : '#f4f3f4'}
                    style={{ transform: [{ scaleX: 0.9 }, { scaleY: 1.1 }] }}
                  />
                </View>

                <View style={styles.notificationRow}>
                  <Text style={styles.notificationLabel}>Deadline reminders</Text>
                  <Switch
                    value={notifications.deadline}
                    onValueChange={() => toggleNotification('deadline')}
                    trackColor={{ false: '#767577', true: '#4CAF50' }}
                    thumbColor={notifications.deadline ? '#fff' : '#f4f3f4'}
                    style={{ transform: [{ scaleX: 0.9 }, { scaleY: 1.1 }] }}
                  />
                </View>

                <View style={styles.notificationRow}>
                  <Text style={styles.notificationLabel}>Wishes added by your friend</Text>
                  <Switch
                    value={notifications.wishes}
                    onValueChange={() => toggleNotification('wishes')}
                    trackColor={{ false: '#767577', true: '#4CAF50' }}
                    thumbColor={notifications.wishes ? '#fff' : '#f4f3f4'}
                    style={{ transform: [{ scaleX: 0.9 }, { scaleY: 1.1 }] }}
                  />
                </View>

                <View style={styles.notificationRow}>
                  <Text style={styles.notificationLabel}>About completed wishes</Text>
                  <Switch
                    value={notifications.completed}
                    onValueChange={() => toggleNotification('completed')}
                    trackColor={{ false: '#767577', true: '#4CAF50' }}
                    thumbColor={notifications.completed ? '#fff' : '#f4f3f4'}
                    style={{ transform: [{ scaleX: 0.9 }, { scaleY: 1.1 }] }}
                  />
                </View>
              </View>
            </>
          ) : (
            <Redirect href="/" />
          )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  container: {
    paddingTop: 65,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    marginTop: 6,
  },
  profilePicContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginVertical: 20,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  profilePic: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profilePicPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  addIcon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#c67c4e',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addIconText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5A858',
    paddingBottom: 5,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  inputContainer: {
    flex: 1,
    marginLeft: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 16,
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  notificationLabel: {
    fontSize: 16,
    color: '#333',
  },
  // Valja logimine
  signOutContainer: {
    position: 'absolute',
    top: 65,
    right: 15,
  },
  signOutButton: {
    display: 'flex',
    flexDirection: 'row',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5a858ff',
    alignSelf: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Lato',
  },
});