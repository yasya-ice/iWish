import React, { useState, useEffect, useCallback } from 'react';
import { Image, View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import {
  fetchFriendsList,
  acceptFriendRequest,
  deleteFriendship,
  Friend 
} from '@/services/friendService';
import AddFriend from '@/components/AddFriend';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Redirect } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';

export default function FriendsScreen() {
  const params = useLocalSearchParams(); 
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddFriendModalVisible, setIsAddFriendModalVisible] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);
    
  const loadFriends = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchFriendsList();
      setFriends(data);
    } catch (error) {
      console.error('Sõprade laadimine ebaõnnestus:', error);
      Alert.alert('Viga', 'Sõprade laadimine ebaõnnestus.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  const acceptedFriends = friends.filter(f => f.status === 'accepted');
  const pendingRequests = friends.filter(f => f.status === 'pending');

  async function handleDeleteFriend(friendProfileId: string) {
    try {
        await deleteFriendship(friendProfileId);
        loadFriends(); 
    } catch (error: any) {
        Alert.alert("Viga", error.message);
    }
  }
  
  const handleAcceptRequest = async (friendshipId: number) => {
    try {
      await acceptFriendRequest(friendshipId);
      loadFriends();
      Alert.alert('Vastu võetud', 'Sõprus kinnitatud!');
    } catch (error) {
      Alert.alert('Viga', 'Kinnitamine ebaõnnestus.');
    }
  };

  const handleFriendPress = async (friendId: string) => {
    if (params.action === "share_wish" && params.wishData) {
      try {
        const wishRaw = Array.isArray(params.wishData) ? params.wishData[0] : params.wishData;
        const originalWish = JSON.parse(wishRaw);

        const { error } = await supabase
          .from('wishes')
          .insert({
            title: originalWish.title,
            description: originalWish.description,
            link: originalWish.link,
            image_url: originalWish.image_url,
            user_id: friendId,
            created_by: session?.user.id,
            came_true: false
          });

        if (error) throw error;
        Alert.alert("Saadetud!", "Soov on nüüd sõbra nimekirjas.");
        router.back(); 
      } catch (error: any) {
        Alert.alert("Viga", error.message);
      }
    }
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <TouchableOpacity 
        style={[
          styles.friendInfo, 
          params.action === "share_wish" && { backgroundColor: '#fff8f0', borderRadius: 10 }
        ]} 
        onPress={() => handleFriendPress(item.profile_id)}
        disabled={item.status !== 'accepted'}
      >
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Feather name="user" size={20} color="#666" />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.friendName}>{item.username}</Text>
          <Text style={styles.friendRelationship}>{item.relationship}</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.actionButtons}>
        {item.status === 'pending' && (
          <>
            {item.is_initiator ? (
              <View style={styles.pendingLabel}>
                <Text style={styles.pendingLabelText}>Sent</Text>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={() => handleAcceptRequest(item.id)} 
                style={styles.acceptButton}
              >
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
            )}
          </>
        )}
        <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => handleDeleteFriend(item.profile_id)}
        >
            <Feather name='x' size={18} color="#000" /> 
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {session && session.user ? (
        <>
          <Modal
            animationType="fade"
            transparent
            visible={isAddFriendModalVisible}
            onRequestClose={() => setIsAddFriendModalVisible(false)}
          >
            <View style={styles.centeredView}>
              <AddFriend
                onCloseModal={() => setIsAddFriendModalVisible(false)}
                onFriendAdded={loadFriends}
              />
            </View>
          </Modal>

          <View style={styles.header}>
            <Text style={styles.title}>
              {params.action === "share_wish" ? "Select a friend to share" : "My friends"}
            </Text>
            {params.action !== "share_wish" && (
              <TouchableOpacity
                onPress={() => setIsAddFriendModalVisible(true)}
                style={styles.addButton}
              >
                <Feather name="user-plus" size={24} color="#F9F2ED" />
              </TouchableOpacity>
            )}
          </View>

          {loading && (
            <ActivityIndicator size="large" color="#FFA500" style={styles.loader} />
          )}

          {!loading && (
            <>
              {pendingRequests.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Friend requests</Text>
                  <FlatList
                    data={pendingRequests}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderFriendItem}
                  />
                </View>
              )}

              <Text style={styles.sectionTitle}>Verified friends</Text>

              {acceptedFriends.length === 0 ? (
                <Text style={styles.emptyText}>Sõpru pole veel lisatud.</Text>
              ) : (
                <FlatList
                  data={acceptedFriends}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderFriendItem}
                />
              )}
            </>
          )}
        </>
      ) : (
        <Redirect href="/" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  addButton: { backgroundColor: '#F5A858', width: 42, height: 42, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  avatarPlaceholder: { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  loader: { marginTop: 50 },
  section: { marginBottom: 20, paddingHorizontal: 10, backgroundColor: '#f9f9f9', borderRadius: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 15, marginBottom: 10 },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 20 },
  friendInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  friendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', justifyContent: 'space-between' },
  friendName: { fontSize: 18, fontWeight: '500', color: '#333' },
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  friendRelationship: { fontSize: 14, color: '#888', marginTop: 2 },
  textContainer: { justifyContent: 'center' },
  closeButton: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  acceptButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#E8F5E9', borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: '#4CAF50' },
  acceptButtonText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 14 },
  pendingLabel: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#FFF9C4', borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: '#FBC02D' },
  pendingLabelText: { color: '#F57F17', fontWeight: 'bold', fontSize: 14 },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }
});