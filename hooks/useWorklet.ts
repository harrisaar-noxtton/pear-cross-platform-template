import * as React from 'react';
import { Platform } from 'react-native';

export interface UseWorkletConfig {
  onPeersUpdated: (peersCount: number) => void;
}

export interface UseWorkletReturn {
  swarmStatus: ConnectionStatus;
  joinSwarm: (topicKey: string) => Promise<void>;
  leaveSwarm: () => Promise<void>;
  generateTopic: () => Promise<string>;
  connectWorklet: () => void;
  workletStatus: ConnectionStatus;
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
export enum ConnectionStatus {
  offline = "offline",
  online = "online",
  connecting = "connecting"
}
