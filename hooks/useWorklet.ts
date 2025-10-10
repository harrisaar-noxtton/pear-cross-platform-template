import { Note } from '@/app/(tabs)/PeersWorkletDemoScreen';
import * as React from 'react';
import { Platform } from 'react-native';

export interface UseWorkletConfig {
  onPeersUpdated: (peersCount: number) => void;
}

export interface UseWorkletReturn {
  swarmStatus: ConnectionStatus;
  joinSwarm: (topicKey: string) => Promise<void>;
  generateTopic: () => Promise<string>;
  connectWorklet: () => void;
  workletStatus: ConnectionStatus;
  notes: Note[];
  appendNote: (text: string) => Promise<void>;
  importNotes: () => Promise<void>;
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
