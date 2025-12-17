import React from 'react';
import { StyleSheet, View, Text, TextInput, Image, TouchableOpacity } from 'react-native';
import { Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import type { AuthMode } from './Auth'; 
import { LOGO_SOURCE, GOOGLE_ICON, FACEBOOK_ICON } from './Auth'; 
import { LinearGradient } from 'expo-linear-gradient';

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
    
    const isDisabled = loading || !email || !password || (isSignUpMode && !name);

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
   <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      > 
    <LinearGradient
      colors={['#0D3245', '#115476', '#000000']}
      locations={[0.3, 0.5, 0.9]}
      style={styles.gradientContainer}>
        
        {/* Sisu konteiner hoiab elemendid paigas */}
        <View style={styles.contentContainer}>

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
                placeholderTextColor="#9b9999ff"
                autoCapitalize={'words'}
                />
            </View>
            )}

            {/* Meil */}
            <View style={[styles.verticallySpaced, { marginBottom: isSignUpMode ? 10 : 3 }]}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
                style={styles.input}
                onChangeText={setEmail}
                value={email}
                placeholder="example@gmail.com"
                placeholderTextColor="#9b9999ff"
                autoCapitalize={'none'}
                keyboardType={'email-address'}
            />
            </View>
            
            {/* Parool */}
            <View style={[styles.verticallySpaced, { marginBottom: isSignUpMode ? 10 : 8 }]}>
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

            {/* Forgot Password nupp (Ainult sisselogimisel) */}
            {!isSignUpMode && (
            <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity onPress={() => setMode('forgotPassword' as any)}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>
            )}

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
            activeOpacity={0.7} >
            <Text style={styles.bigOrangeButtonText}>
                {loading ? "Loading..." : mainButtonTitle}
            </Text>
            </TouchableOpacity>
            
            {/* SOTSIAALMEEDIA */}
            <Text style={styles.orText}>Or {mainButtonTitle.toLowerCase()} with</Text>
            <View style={styles.socialButtonsContainer}>
                <TouchableOpacity style={styles.socialButton}>
                    <Image source={GOOGLE_ICON} style={styles.socialIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                    <Image source={FACEBOOK_ICON} style={styles.socialIcon} />
                </TouchableOpacity>
            </View>
            
            {/* Lüliti (Sign In / Sign Up) */}
            <TouchableOpacity 
                style={styles.switchButton}
                onPress={() => setMode(isSignUpMode ? 'signIn' : 'signUp')}
            >
                <Text style={styles.switchText}>
                    {isSignUpMode 
                        ? "Already have an account? Sign In" 
                        : "Don't have an account? Sign Up"}
                </Text>
            </TouchableOpacity>

        </View>
      </LinearGradient>
     </ScrollView>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // --- PEAMINE KONTEINER ---
  gradientContainer: {
    flex: 1,            // Võtab terve ekraani
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    justifyContent: 'space-around', // Hoiab elemendid ühtlaselt
    alignItems: 'stretch',
  },
  
  // --- ÜLEJÄÄNUD STIILID ---
  headerContainer: {
    justifyContent: 'center', 
    alignItems: 'center',    
    marginBottom: 10, 
  },
  logoImage: {
    width: 150,  
    height: 150, 
    resizeMode: 'contain', 
    marginBottom: 5, 
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#F5A858',
    marginLeft: 10
  },
  verticallySpaced: {
    marginBottom: 10,
    alignSelf: 'center',
  },
  input: {
    width: 320,
    height: 50,
    backgroundColor: '#ffffff',
    borderWidth: 1, 
    borderColor: '#C67C4E',
    paddingHorizontal: 15,
    borderRadius: 20,
    fontSize: 16,
    color: '#000000',
  },
  forgotPasswordContainer: {
    width: 320, 
    alignSelf: 'center',
    alignItems: 'flex-end', 
    marginTop: -5,

  },
  forgotPasswordText: {
    color: '#F5A858',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bigOrangeButton: {
    display: 'flex',
    borderRadius: 20,
    height: 40,
    width: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5a858ff',
    alignSelf: 'center'
  },
  bigOrangeButtonText: {
    color: '#ffffffff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Sora',
  },
  disabledButton: {
    backgroundColor: '#cc771a',
    opacity: 0.7,
  },
  buttonSpacing: {
    marginTop: 10,
    marginBottom: 10,
  },
  orText: {
    textAlign: 'center',
    color: '#cccccc',
    marginVertical: 10, 
    fontSize: 16,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10, 
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
    marginTop: 10, 
    marginBottom: '15%',
  },
  switchText: {
    color: '#ffffff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  errorBox: {
    padding: 10,
    backgroundColor: '#fee2e2', 
    borderColor: '#ef4444', 
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    width: 320,
    alignSelf: 'center',
  },
  errorText: {
    color: '#b91c1c', 
    fontWeight: '600',
    fontSize: 14,
  }
});