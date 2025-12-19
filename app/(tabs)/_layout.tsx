import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { customTabBarStyle } from "@/constants/tab-bar";

const ICON_MAPPING = {
  home: 'home',
  friends: 'heart',
  profile: 'user',
  pen: 'edit-2',
  arrow: 'chevron-right'
} as const;

type IconKey = keyof typeof ICON_MAPPING;

export function IconSymbol({ name, size = 24, color }: { name: IconKey; size?: number; color: string }) {
  return <Feather name={ICON_MAPPING[name]} size={size} color={color} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
    const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    // Load the Feather icon font
    Feather.loadFont()
    .then(() => setFontLoaded(true))
    .catch((err) => console.warn('Feather font failed to load', err));
  }, []);

  if (!fontLoaded) return null; // or a splash/loading screen


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarStyle: customTabBarStyle,
        tabBarIconStyle: {
          marginTop: 8,
        },
        tabBarLabelStyle: {  
          fontSize: 12, 
          padding: 3,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
    <Tabs.Screen
      name="index"
      options={{
        title: 'Home',
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="home" color={color} />,
      }}
    />
    <Tabs.Screen
      name="friends"
      options={{
        title: 'Friends',
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="friends" color={color} />,
      }}
    />
    <Tabs.Screen
      name="profile"
      options={{
        title: 'Profile',
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="profile" color={color} />,
      }}
    />

    </Tabs>
  );
}
