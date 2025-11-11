import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

type ThemedButtonProps = {
  type?: 'default' | 'dark' | 'transparent';
  title: string | React.ReactNode;
  onPress: () => void;
  style?: object;
  titleStyle?: object;
};

export function ThemedButton({
  type = 'default',
  title,
  onPress,
  style,
  titleStyle
}: ThemedButtonProps) {

  const backgroundColors = {
    default: '#c67c4e',
    dark: '#955d3b',
    transparent: 'transparent'
  };

  const titleColors = {
    default: '#fff',
    dark: '#fff',
    transparent: '#c67c4e'
  };

  return (
    <Pressable
      onPress={onPress}
      style={[styles.buttonBase, { backgroundColor: backgroundColors[type] }, style]}
    >
      {typeof title === 'string' ? (
        <Text style={[styles.titleBase, titleStyle, { color: titleColors[type] }]}>{title}</Text>
      ) : (
        React.cloneElement(title as React.ReactElement<any>, {
          color: titleColors[type],
        })
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    height: 60,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBase: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    fontWeight: 700,
    alignItems: 'center',
    justifyContent: 'center',
  },
})