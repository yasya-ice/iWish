import React, { useState } from "react";
import { Dimensions, FlatList, Image, View, NativeSyntheticEvent, NativeScrollEvent, StyleSheet, useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";
const { width, height } = Dimensions.get('window');

interface ImageCaruselProps {
    images: string[];
}

const ImageCarusel: React.FC<ImageCaruselProps> = ({ images }) => {
    const scheme = useColorScheme(); // Light or Dark mode
    const theme = scheme === 'dark' ? Colors.dark : Colors.light; // Use theme colors from constants/theme
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const horizontalOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(horizontalOffset / width);
        setActiveIndex(index);
    };

    const renderImage = ({ item }: { item: string }) => (
        <Image style={styles.image} source={{ uri: item }} />
    );

    return (
        <View>
            <FlatList
                horizontal
                pagingEnabled
                style={styles.list}
                data={images}
                renderItem={renderImage}
                keyExtractor={(item, index) => `${item}-${index}`}
                onMomentumScrollEnd={handleScrollEnd}
                showsHorizontalScrollIndicator={false}
            />
            <View style={styles.pagination}>
                {images.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.paginationLine,
                            { backgroundColor: theme.background },
                            i === activeIndex ? { 
                                    backgroundColor: theme.text,
                                    width: 30 
                                } : {}
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

export default React.memo(ImageCarusel);


// STYLES

const styles = StyleSheet.create({
    image: {
        width: width,
        height: height * 0.45,
        resizeMode: 'cover'
    },
    list: {
        width: width,
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center'
    },
    paginationLine: {
        height: 4,
        width: 20,
        borderRadius: 10,
        margin: 5
    }
});

