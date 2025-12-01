import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type Variant = 'default' | 'secondary';
type Tone = 'solid' | 'transparent' | 'border';

type ThemedButtonProps = {
  variant?: Variant;
  tone?: Tone;
  title: string | React.ReactNode;
  onPress: () => void;
  style?: object;
  titleStyle?: object;
  disabled?: boolean;
};

const solidBackgrounds: Record<Variant, string> = {
  default: '#f5a858',
  secondary: '#c67c4e',
};

const solidTitles: Record<Variant, string> = {
  default: '#fff',
  secondary: '#fff',
};

const transparentTitles: Record<Variant, string> = {
  default: '#f5a858',
  secondary: '#c67c4e',
};

export function ThemedButton({
  variant = 'default',
  tone = 'solid',
  title,
  onPress,
  style,
  titleStyle,
  disabled = false,
}: ThemedButtonProps) {

  const backgroundColor =
    tone === 'solid' 
      ? solidBackgrounds[variant]
      : 'transparent';

  const textColor =
    tone === 'solid'
      ? solidTitles[variant]
      : transparentTitles[variant]

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.buttonBase, 
        { 
          backgroundColor,
          borderColor: 
            tone === 'border'
              ? textColor 
              : 'transparent'
        }, 
        disabled && styles.disabled, 
        style]}
    >
      {typeof title === 'string' ? (
        <Text style={[styles.titleBase, { color: textColor }, titleStyle]}>
          {title}
        </Text>
      ) : (
        React.cloneElement(title as React.ReactElement<any>, {
          color: textColor,
        })
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    height: 40,
    padding: 12,
    borderWidth: 1,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBase: {
    fontFamily: 'Lato',
    fontSize: 16,
    fontWeight: 700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  }
})