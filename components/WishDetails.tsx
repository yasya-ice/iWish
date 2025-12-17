import React from "react";
import { Image, Linking, Pressable, ScrollView, Text, View, StyleSheet, Dimensions, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedButton } from "@/components/themed-button";
import ImageCarusel from "@/components/ImageCarusel";
import { Colors } from "@/constants/theme";

export interface Wish {
    id?: string;
    title: string;
    description?: string;
    image?: string;
    images?: string[];
    owner?: string;
    link?: string;
} 

interface WishDetailsProps {
    navigation: {
        goBack: () => void;
        navigate: (screen: string, params?: any) => void;
    };
    route: {
        params: {
            wish: Wish;
        };
    };
}

const { height } = Dimensions.get("window");

const stylesStatic = StyleSheet.create({
    save: { flex: 1 },
    image: { width: "100%", height: height * 0.45 },
    titleRow: { flexDirection: "row", alignItems: "center" },
    title: { fontSize: 24, fontWeight: "500", flex: 1 },
    linkIconContainer: { marginLeft: 10 },
    linkIcon: { width: 24, height: 24 },
    footer: { padding: 24, flexDirection: "row", alignItems: "center" },
    shareContainer: {
        padding: 18,
        borderRadius: 8,
        marginRight: 16,
        marginTop: 0,
    },
    shareIcon: { width: 24, height: 24 },
    backIcon: { width: 20, height: 20 },
    backContainer: {
        padding: 10,
        margin: 24,
        borderRadius: 8,
        position: "absolute",
        zIndex: 10,
    },
    // Стиль для кнопки (flex: 1 дозволяє їй розтягуватися)
    completeButton: { 
        flex: 1, 
        marginLeft: 16, 
    }
});

const getThemedStyles = (theme: typeof Colors.light) => StyleSheet.create({
    // Включаємо статичні стилі
    ...stylesStatic, 

    content: {
        backgroundColor: theme.background, // Динамічний колір
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        marginTop: -40,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },

    title: {
        ...stylesStatic.title,
        color: theme.text, // Динамічний колір тексту
    },

    description: {
        color: theme.icon, // Динамічний колір для сірого тексту
        fontWeight: "300",
        marginVertical: 8,
        fontSize: 16,
    },

    owner: {
        fontSize: 16,
        color: theme.icon, // Динамічний колір для сірого тексту
        marginTop: 8,
    },

    shareContainer: {
        ...stylesStatic.shareContainer,
        backgroundColor: theme.tabIconDefault, // Динамічний колір фону іконки
    },

    backContainer: {
        ...stylesStatic.backContainer,
        backgroundColor: theme.background, // Динамічний колір фону кнопки "Назад"
    },
    
    // Включаємо статичні стилі кнопки
    completeButton: stylesStatic.completeButton,
});

const WishDetails: React.FC<WishDetailsProps> = ({ navigation, route }) => {
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? Colors.dark : Colors.light;
    
    const { wish } = route.params || {};

    // Отримуємо динамічні стилі (з використанням useMemo для оптимізації)
    const styles = React.useMemo(() => getThemedStyles(theme), [theme]); 

    if (!wish) {
        // Використовуємо stylesStatic.save, оскільки styles не існує поза useMemo
        return (
            <SafeAreaView style={[stylesStatic.save, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.text }}>Бажання не знайдено</Text>
            </SafeAreaView>
        );
    }

    const onBackPress = () => navigation.goBack();
    const onOpenLink = () => {
        if (wish.link) {
            Linking.openURL(wish.link);
        } else {
            Alert.alert("Посилання відсутнє");
        }
    };
    const onShare = () => {
        Alert.alert("Поділитися бажанням", `Поділитися: ${wish.title}`);
    };
    const onComplete = () => {
        navigation.navigate("CompletedWishes", { wish });
    };

    return (
        <SafeAreaView style={styles.save}>
            <ScrollView>
                {wish.images?.length ? (
                    <ImageCarusel images={wish.images} />
                ) : (
                    <Image
                        style={styles.image}
                        source={{ uri: wish.image || "https://placehold.co/400x300" }}
                    />
                )}

                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>{wish.title}</Text>
                        {wish.link && (
                            <Pressable onPress={onOpenLink} style={styles.linkIconContainer}>
                                <Image
                                    source={require("../../assets/link.png")}
                                    style={styles.linkIcon}
                                />
                            </Pressable>
                        )}
                    </View>
                    {wish.description && (
                        <Text style={styles.description}>{wish.description}</Text>
                    )}
                    {wish.owner && (
                        <Text style={styles.owner}>Власник: {wish.owner}</Text>
                    )}
                </View>

                <Pressable onPress={onBackPress} style={styles.backContainer}>
                    <Image
                        style={styles.backIcon}
                        source={require("../../assets/back.png")}
                    />
                </Pressable>
            </ScrollView>

            <View style={styles.footer}>
                <Pressable onPress={onShare}>
                    <View style={styles.shareContainer}>
                        <Image
                            source={require("../../assets/share.png")}
                            style={styles.shareIcon}
                        />
                    </View>
                </Pressable>
                {/* Використовуємо ThemedButton з потрібними варіантами */}
                <ThemedButton 
                    onPress={onComplete} 
                    title="Здійснити бажання" 
                    variant="default"
                    tone="solid"
                    style={styles.completeButton} 
                />
            </View>
        </SafeAreaView>
    );
};

export default React.memo(WishDetails);
