import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { customTabBarStyle } from "@/constants/tab-bar";

export default function TabLayout() {
  const colorScheme = useColorScheme();
    const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    // Load the Feather icon font
    Feather.loadFont().then(() => setFontLoaded(true));
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
        headerShown: true,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.slash" color={color} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.slash" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.slash" color={color} />,
        }}
      />
    </Tabs>
  );
}
