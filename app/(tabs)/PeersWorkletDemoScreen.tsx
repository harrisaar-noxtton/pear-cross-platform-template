// PeersWorkletDemoScreen.tsx
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function PeersWorkletDemoScreen() {
  const [MobileWorkletDemo, setMobileWorkletDemo] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Only import on mobile platforms
      import('@/components/MobileWorkletDemo')
        .then((module) => {
          setMobileWorkletDemo(() => module.default);
        })
        .catch((error) => {
          console.error('Failed to load MobileWorkletDemo:', error);
        });
    }
  }, []);

  console.log("PeersWorkletDemoScreen v41");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PeersWorkletDemoScreen v41</Text>
      {Platform.OS !== 'web' && MobileWorkletDemo && <MobileWorkletDemo />}
      {Platform.OS === 'web' && (
        <Text style={styles.webMessage}>
          Worklet demo is not available on web platform
        </Text>
      )}
      <View 
        style={styles.separator} 
        lightColor="#eee"   
        darkColor="rgba(255,255,255,0.1)" 
      />
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  webMessage: {
    fontSize: 16,
    fontStyle: 'italic',
    marginVertical: 20,
    textAlign: 'center',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
