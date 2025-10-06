import * as React from 'react';
import { useState, useEffect } from 'react';
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
  const [hookImpl, setHookImpl] = useState<UseWorkletReturn | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadPlatformHook = async (): Promise<void> => {
      setIsLoading(true);
      
      if (Platform.OS === 'web') {
        const { useWorkletDesktop } = await import('./useWorkletDesktop');
        setHookImpl(useWorkletDesktop(config));
      } else {
        const { useWorkletMobile } = await import('./useWorkletMobile');
        setHookImpl(useWorkletMobile(config));
      }
      
      setIsLoading(false);
    };

    loadPlatformHook();
  }, []);

  if (isLoading || !hookImpl) {
    return {
      status: WorkletStatus.offline,
      connect: async (): Promise<void> => {},
      disconnect: async (): Promise<void> => {}
    };
  }

  return hookImpl;
}