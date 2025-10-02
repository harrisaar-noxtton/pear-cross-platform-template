// app/(tabs)/_layout.tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { PRIMARY_GREEN_COLOR, PRIMARY_TEXT_GRAY, PRIMARY_BLACK_COLOR } from '@/constants/Colors';

export default function TabLayout(): React.ReactElement {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PRIMARY_GREEN_COLOR,
        tabBarInactiveTintColor: PRIMARY_TEXT_GRAY,
        headerShown: true,
        headerStyle: {
          backgroundColor: PRIMARY_BLACK_COLOR,
        },
        headerTintColor: PRIMARY_GREEN_COLOR,
        tabBarStyle: {
          backgroundColor: PRIMARY_BLACK_COLOR,
          borderTopWidth: 1,
          borderColor: PRIMARY_TEXT_GRAY
        },
        tabBarLabelPosition: 'beside-icon',
        tabBarIconStyle: { display: 'none' },
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
          textAlign: 'center',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Welcome',
        }}
      />
      <Tabs.Screen
        name="PeersWorkletDemoScreen"
        options={{
          title: 'P2P Network',
        }}
      />
    </Tabs>
  );
}
