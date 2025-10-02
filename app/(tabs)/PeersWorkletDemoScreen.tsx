// app/(tabs)/PeersWorkletDemoScreen.tsx
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { PRIMARY_BLACK_COLOR, PRIMARY_GREEN_COLOR, WHITE_COLOR, PRIMARY_TEXT_GRAY } from '@/constants/Colors';

import DesktopWorkletDemo from '@/components/DesktopWorkletDemo';

interface Props {}

export default function PeersWorkletDemoScreen(props: Props): React.ReactElement {
  const {} = props;
  const [MobileWorkletDemo, setMobileWorkletDemo] = useState<React.ComponentType | null>(null);

  useEffect((): void => {
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
      
      <View style={styles.demoContainer}>
        {Platform.OS !== 'web' && MobileWorkletDemo && <MobileWorkletDemo />}
        {Platform.OS === 'web' && <DesktopWorkletDemo />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_BLACK_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  pearIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: PRIMARY_GREEN_COLOR,
    textAlign: 'center',
  },
  demoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
