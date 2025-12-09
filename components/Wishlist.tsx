import { StyleSheet, View, Text } from 'react-native';
import { supabase } from '@/utils/supabase';
import React, { useState, useEffect } from 'react';
import { PostgrestError } from '@supabase/supabase-js';

interface Wish {
  id: number;
  title: string; 
  description: string | null;
  link: string | null;
  created_at: string;
  came_true: boolean;
  image_url: string | null;
}

interface WishlistProps {
  cameTrue: boolean;
}

export default function Wishlist({ cameTrue }: WishlistProps) {

  const [wishes, setWishes] = useState<Wish[]>([]);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   async function fetchWishes() {
      setLoading(true); // Ensure loading is true before fetch starts
      
      const { data, error } = await supabase
        .from('wishes')
        .select('*') 
        .eq('came_true', cameTrue) // Filter based on the prop
        .order('id', { ascending: true }); // order the results

      if (error) {
        console.error('Error fetching wishes:', error);
        setError(error);
      } else {
        // Supabase returns null data on error, so we check the error first
        setWishes(data || []); 
      }
      setLoading(false);
    }

    fetchWishes();
  }, [cameTrue]); // Re-run effect when 'cameTrue' prop changes

  // 3. Render Loading and Error States
  if (loading) {
    return (
      <View style={styles.wishlistContainer}>
        <Text>Loading {cameTrue ? 'Came True' : 'Actual'} wishes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.wishlistContainer}>
        <Text>Error fetching data: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wishlistContainer}>
      {cameTrue ? (
        <Text>"Came true" list is here!</Text>
      ) : (
        <Text>"Actual" list is here!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wishlistContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});