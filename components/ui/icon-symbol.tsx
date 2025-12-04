// Fallback for using MaterialIcons on Android and web.

//import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof Feather>['name']>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  'house.slash': 'home',
  'heart.slash': 'heart',
  'person.slash': 'user',
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <Feather color={color} size={size} name={MAPPING[name]} style={style} />;
}
