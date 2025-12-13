import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Uus import ikoonide jaoks
import { ThemedButton } from '@/components/themed-button';
import { supabase } from '@/utils/supabase';
import { Feather } from '@expo/vector-icons';


interface Wish {
  id: number;
  title: string;
  link?: string;
  description?: string;
  image_url?: string;
  came_true: boolean;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.48; // Proportsionaalne laius 

interface WishItemProps {
  wish: Wish;
  onMarkComplete: (wishId: number) => Promise<void>; 
  onDelete: (wishId: number) => Promise<void>;
}

export default function WishItem({ wish, onMarkComplete, onDelete }: WishItemProps) {
  
  // "Linnukese" ikoon, kui soov tehtud
  const completeIconName = wish.came_true ? 'checkmark-circle' : 'ellipse-outline'; 
  const completeIconColor = wish.came_true ? '#ff9800' : '#ff9800'; // Roheline vs Oranž

  return (
    <View style={styles.card}>
      
      {/* -------------------- Pilt / Placeholder -------------------- */}
      {wish.image_url ? (
        <Image 
          source={{ uri: wish.image_url }} 
          style={styles.image} 
        />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}
      
      {/* -------------------- 1. KUSTUTAMISE NUPP (X) -------------------- */}
<TouchableOpacity 
    // Kasutame stiile, mille me defineerisime allpool
    style={styles.closeButton} 
    onPress={() => onDelete(wish.id)} //kustutamise funktsioon ja otsekäivitus
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} 
>
    <Feather name='x' size={20} color="#000000ff" /> 
</TouchableOpacity>
      
      {/* -------------------- 2. INFO KONTEINER (Tõstetud "õhku") -------------------- */}
      <View style={styles.infoContainer}>
        
        <View style={styles.titleRow}>
          {/* Pealkiri */}
          <Text style={styles.title} numberOfLines={2}>{wish.title}</Text>
          
          {/* -------------------- 3. TEE TEHTUKS IKON-NUPP -------------------- */}
          {/* Nupp kuvatakse ainult, kui soov ei ole veel täidetud, või kuvatakse tehtuks märk */}
          <TouchableOpacity 
            style={styles.completeIcon} 
            onPress={() => onMarkComplete(wish.id)}
          >
            <Ionicons 
              name={completeIconName as any} 
              size={35} 
              color={completeIconColor} 
            />
          </TouchableOpacity>

        </View>
        
        {/* Lühike kirjeldus või link (valikuline) */}
        {wish.description && (
          <Text style={styles.description} numberOfLines={3}>
            {wish.description}
          </Text>
        )}
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: ITEM_WIDTH, 
    marginHorizontal: width * 0.01, 
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden', 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 300, // Piklikum kuju
    position: 'relative', 
  },
  image: {
    width: '100%',
    height: 200, // Annab pildile rohkem ruumi
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5', 
  },
  
  // --- UUS: INFO KONTEINER ---
  infoContainer: {
    position: 'absolute', // "Õhus"
    bottom: 0,
    width: '100%',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Poolläbipaistev taust
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    minHeight: 100,
    justifyContent: 'center',
  },
  
  //PEALKIRJA JA NUPU RIDA ---
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    flex: 1, // Võtab suurema osa ruumist
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  description: {
    fontSize: 12,
    color: '#666',
  },
  
  // --- KUSTUTAMISE NUPP ---
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 25,
    height: 25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000000ff',
    backgroundColor: '#ffffff42', 
    justifyContent: 'center', 
  alignItems: 'center',
  zIndex: 10,
  },
  deleteButtonText: {
    fontSize: 18,
    lineHeight: 20,
    color: '#c67c4e',
    fontWeight: '600',
  },
  // --- TEE TEHTUKS IKON-NUPP ---
  completeIcon: {
    padding: 2,
    // Ikoonide suurus on määratud Ionicons prop'is
  }
});