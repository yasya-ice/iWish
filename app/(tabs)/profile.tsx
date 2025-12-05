import { IconSymbol } from '@/components/ui/icon-symbol';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { Fonts } from '@/constants/theme';
import * as ImagePicker from 'expo-image-picker';
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

  // Vali pilt seadmest
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lubatud pole', 'Palun luba pildide juurdepääs!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Salvesta muudatused
  const saveField = (field: string, value: string) => {
    if (field === 'name') {
      setName(value);
      setIsEditingName(false);
    } else if (field === 'email') {
      setEmail(value);
      setIsEditingEmail(false);
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

  // Lülita teavitused
  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <ScrollView>
    <View style={styles.container}>
      {/* Pealkiri */}
      <Text style={styles.header}>My Profile</Text>

      {/* Profiilipilt */}
      <View style={styles.profilePicContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profilePic} />
          ) : (
            <View style={styles.profilePicPlaceholder}>
                <IconSymbol size={70} name="person.slash" color={'#000000'} />
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
          <Text style={styles.label}><b>Name</b></Text>
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
                <IconSymbol size={28} name="pen.slash" color={'#687076'} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Email */}
        <View style={styles.fieldRow}>
          <Text style={styles.label}><b>E-mail</b></Text>
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
                <IconSymbol size={28} name="pen.slash" color={'#687076'} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Change Password */}
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Change Password</Text>
          <TouchableOpacity onPress={handleChangePassword}>
                <IconSymbol size={28} name="arrow-right.slash" color={'#687076'} />
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
          />
        </View>

        <View style={styles.notificationRow}>
          <Text style={styles.notificationLabel}>Deadline reminders</Text>
          <Switch
            value={notifications.deadline}
            onValueChange={() => toggleNotification('deadline')}
            trackColor={{ false: '#767577', true: '#4CAF50' }}
            thumbColor={notifications.deadline ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.notificationRow}>
          <Text style={styles.notificationLabel}>Wishes added by your friend</Text>
          <Switch
            value={notifications.wishes}
            onValueChange={() => toggleNotification('wishes')}
            trackColor={{ false: '#767577', true: '#4CAF50' }}
            thumbColor={notifications.wishes ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.notificationRow}>
          <Text style={styles.notificationLabel}>About completed wishes</Text>
          <Switch
            value={notifications.completed}
            onValueChange={() => toggleNotification('completed')}
            trackColor={{ false: '#767577', true: '#4CAF50' }}
            thumbColor={notifications.completed ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  profilePicContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
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
  placeholderText: {
    fontSize: 40,
    color: '#888',
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
    elevation: 3, // Androidile varjund
    shadowColor: '#000', // iOSile varjund
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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
});