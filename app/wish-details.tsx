import React, { useMemo, useState } from "react";
import { Image, Linking, Pressable, ScrollView, Text, View, StyleSheet, Dimensions, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase';

const { height } = Dimensions.get("window");

export default function WishDetails() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? Colors.dark : Colors.light;

    const wishData = useMemo(() => {
        try {
            return params.wish ? JSON.parse(params.wish as string) : null;
        } catch (e) {
            return null;
        }
    }, [params.wish]);

    // Olek soovi staatuse hoidmiseks
    const [isDone, setIsDone] = useState(wishData?.came_true || false);

    const handleToggleStatus = async () => {
        if (!wishData) return;
        const newStatus = !isDone;

        try {
            const { error } = await supabase
                .from('wishes')
                .update({ came_true: newStatus })
                .eq('id', wishData.id);

            if (error) throw error;
            setIsDone(newStatus);
            
            Alert.alert("Tehtud!", newStatus ? "Soov liigutati Came True nimekirja." : "Soov liigutati tagasi aktiivseks.");
        } catch (error: any) {
            Alert.alert("Viga", error.message);
        }
    };

    const onOpenLink = () => {
        if (wishData?.link) Linking.openURL(wishData.link);
        else Alert.alert("Link puudub");
    };

    if (!wishData) return <Text style={{ marginTop: 50, textAlign: 'center' }}>Andmed puuduvad</Text>;

    return (
        <SafeAreaView style={[styles.save, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.imageContainer}>
                    <Image
                        style={styles.image}
                        source={{ uri: wishData.image_url || "https://placehold.co/600x400" }}
                        resizeMode="cover"
                    />
                    <Pressable onPress={() => router.back()} style={styles.backContainer}>
                        <Feather name="chevron-left" size={28} color="#000" />
                    </Pressable>
                </View>

                <View style={[styles.content, { backgroundColor: theme.background }]}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, { color: theme.text }]}>{wishData.title}</Text>
                        {wishData.link && (
                            <Pressable onPress={onOpenLink} style={styles.linkCircle}>
                                <Feather name="link-2" size={20} color="#C67C4E" />
                            </Pressable>
                        )}
                    </View>
                    <Text style={[styles.description, { color: theme.text }]}>
                        {wishData.description || "Kirjeldust ei ole lisatud."}
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Pressable style={styles.shareIconBtn} onPress={() => Alert.alert("Share")}>
                        <Feather name="upload" size={24} color="#C67C4E" />
                    </Pressable>

                    <Pressable 
                        style={[
                            styles.fulfillBtn, 
                            { backgroundColor: isDone ? '#E8F5E9' : '#F5A858' },
                            isDone && { borderColor: '#4CAF50', borderWidth: 1 }
                        ]}
                        onPress={handleToggleStatus}
                    >
                        <Text style={[styles.fulfillBtnText, isDone && { color: '#2E7D32' }]}>
                            {isDone ? "Mark undone" : "Mark done"}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// LISATUD PUUDUOLEVAD STIILID
const styles = StyleSheet.create({
    save: { flex: 1 },
    imageContainer: { position: 'relative' },
    image: { width: "100%", height: height * 0.45 },
    backContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 20,
        padding: 8,
    },
    content: { flex: 1, padding: 24 },
    titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    title: { fontSize: 28, fontWeight: "bold", flex: 1 },
    linkCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FDEEE3',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    description: { fontSize: 16, lineHeight: 24, color: '#666' },
    footer: {
        flexDirection: 'row',
        padding: 20,
        paddingBottom: 40,
        alignItems: 'center',
        gap: 15,
    },
    shareIconBtn: {
        width: 55,
        height: 55,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#C67C4E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fulfillBtn: {
        flex: 1,
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fulfillBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});