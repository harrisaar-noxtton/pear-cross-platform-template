import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import b4a from 'b4a';
import RPC from 'bare-rpc';
import { Paths } from 'expo-file-system';
import { Worklet } from 'react-native-bare-kit';
import {
  RPC_JOIN_SWARM,
  RPC_PEERS_UPDATED,
  RPC_SWARM_JOINED,
  RPC_DESTROY,
  RPC_DESTROY_SUCCESS
} from '../rpc-commands.mjs';
import bundle from '../components/app.bundle.mjs';
import { WorkletStatus } from '@/app/(tabs)/PeersWorkletDemoScreen';

const topicKey = process.env.EXPO_PUBLIC_TOPIC_KEY;

interface DataContent {
  peersCount?: number;
}

interface UseWorkletConfig {
  onPeersUpdated: (peersCount: number) => void;
}

interface UseWorkletReturn {
  status: WorkletStatus;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useWorklet(config: UseWorkletConfig): UseWorkletReturn {
  const { onPeersUpdated } = config;
  
  const [status, setStatus] = useState<WorkletStatus>(WorkletStatus.offline);
  const rpcRef = useRef<any>(null);
  const workletRef = useRef<any>(null);

  const connect = async (): Promise<void> => {
    console.log('useWorklet: connect called');

    setStatus(WorkletStatus.connecting);

    if (!topicKey) {
      console.error('Define the topic key in .env file');
      setStatus(WorkletStatus.offline);
      return;
    }

    const documentDirectory = Paths.document.uri;
    console.log('document directory', documentDirectory);

    const worklet = new Worklet();
    worklet.start('/app.bundle', bundle, [String(documentDirectory), topicKey]);
    const { IPC } = worklet;

    workletRef.current = worklet;

    const rpc = new RPC(IPC, (req) => {
      const dataContent: DataContent = JSON.parse(b4a.toString(req.data).toString());

      if (req.command === RPC_SWARM_JOINED) {
        console.log('swarm joined');
        setStatus(WorkletStatus.online);
      }

      if (req.command === RPC_PEERS_UPDATED) {
        onPeersUpdated(dataContent?.peersCount || 0);
      }

      if (req.command === RPC_DESTROY_SUCCESS) {
        console.log('RPC_DESTROY_SUCCESS: cleaning up');
        if (workletRef.current) {
          workletRef.current.terminate();
          workletRef.current = null;
        }
        rpcRef.current = null;
        setStatus(WorkletStatus.offline);
      }
    });

    rpcRef.current = rpc;

    const req = rpc.request(RPC_JOIN_SWARM);
    req.send();
  };

  const disconnect = async (): Promise<void> => {
    console.log('useWorklet: disconnect called');
    if (rpcRef.current) {
      const req = rpcRef.current.request(RPC_DESTROY);
      req.send();
    }
  };

  useEffect(() => {
    return (): void => {
      if (workletRef.current) {
        workletRef.current.terminate();
      }
    };
  }, []);

  return {
    status,
    connect,
    disconnect
  };
}