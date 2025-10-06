import * as React from 'react';
import { Platform } from 'react-native';
import { WorkletStatus } from '@/app/(tabs)/PeersWorkletDemoScreen';

interface UseWorkletConfig {
  onPeersUpdated: (peersCount: number) => void;
}

interface UseWorkletReturn {
  status: WorkletStatus;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useWorklet(config: UseWorkletConfig): UseWorkletReturn {
  if (Platform.OS === 'web') {
    const { useWorkletDesktop } = require('./useWorkletDesktop');
    return useWorkletDesktop(config);
  } else {
    const { useWorkletMobile } = require('./useWorkletMobile');
    return useWorkletMobile(config);
  }
}
