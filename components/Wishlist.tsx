import { StyleSheet, View, Text } from 'react-native';

interface WishlistProps {
  cameTrue: boolean;
}

export default function Wishlist({ cameTrue }: WishlistProps) {
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