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
  RPC_DESTROY_SUCCESS,
  RPC_CREATE_TOPIC,
  RPC_CREATE_TOPIC_SUCCESS
} from '../rpc-commands.mjs';
import bundle from '../components/app.bundle.mjs';
import { ConnectionStatus } from './useWorklet';
import { UseWorkletConfig, UseWorkletReturn } from './useWorklet';

interface DataContent {
  peersCount?: number;
  topicKey?: string;
}

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

export function useWorkletMobile(config: UseWorkletConfig): UseWorkletReturn {
  const { onPeersUpdated } = config;
  
  const [swarmStatus, setSwarmStatus] = useState<ConnectionStatus>(ConnectionStatus.offline);
  const [workletStatus, setWorkletStatus] = useState<ConnectionStatus>(ConnectionStatus.offline);
  const rpcRef = useRef<any>(null);
  const workletRef = useRef<any>(null);
  const pendingCreateTopicRef = useRef<PendingRequest | null>(null);
  const pendingDestroyRef = useRef<PendingRequest | null>(null);

  const connectWorklet = (): void => {
    if (workletRef.current) {
      console.warn('Worklet already connected');
      return;
    }

    console.log('useWorkletMobile: connecting worklet');
    setWorkletStatus(ConnectionStatus.connecting);

    const documentDirectory = Paths.document.uri;
    console.log('document directory', documentDirectory);

    const worklet = new Worklet();
    worklet.start('/app.bundle', bundle, [String(documentDirectory)]);

    console.log("worklet created")

    const { IPC } = worklet;

    workletRef.current = worklet;

    const rpc = new RPC(IPC, (req) => {
      const dataContent: DataContent = JSON.parse(b4a.toString(req.data).toString());

      console.log("dataContent", dataContent)

      if (req.command === RPC_CREATE_TOPIC_SUCCESS) {
        console.log('topic key', dataContent?.topicKey);
        if (pendingCreateTopicRef.current && dataContent?.topicKey) {
          pendingCreateTopicRef.current.resolve(dataContent.topicKey);
          pendingCreateTopicRef.current = null;
        }
      }

      if (req.command === RPC_SWARM_JOINED) {
        console.log('swarm joined');
        setSwarmStatus(ConnectionStatus.online);
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
        setSwarmStatus(ConnectionStatus.offline);
        if (pendingDestroyRef.current) {
          pendingDestroyRef.current.resolve(undefined);
          pendingDestroyRef.current = null;
        }
      }
    });

    rpcRef.current = rpc;
    setWorkletStatus(ConnectionStatus.online);
  };

  const joinSwarm = async (topicKey: string): Promise<void> => {
    if (!rpcRef.current) {
      throw new Error('Worklet not connected. Call connectWorklet() first.');
    }

    if (!topicKey) {
      throw new Error('Topic key is required');
    }

    console.log('useWorkletMobile: joining swarm');
    setSwarmStatus(ConnectionStatus.connecting);

    const req = rpcRef.current.request(RPC_JOIN_SWARM);
    req.send(JSON.stringify({topicKey}));
  };

  const leaveSwarm = async (): Promise<void> => {
    if (!rpcRef.current) {
      throw new Error('Worklet not connected');
    }

    return new Promise<void>((resolve, reject) => {
      pendingDestroyRef.current = { resolve, reject };
      const req = rpcRef.current.request(RPC_DESTROY);
      req.send();
    });
  };

  const generateTopic = async (): Promise<string> => {
    if (!rpcRef.current) {
      throw new Error('Worklet not connected. Call connectWorklet() first.');
    }

    return new Promise<string>((resolve, reject) => {
      pendingCreateTopicRef.current = { resolve, reject };
      const req = rpcRef.current.request(RPC_CREATE_TOPIC);
      req.send();
    });
  };

  useEffect(() => {
    return (): void => {
      if (workletRef.current) {
        workletRef.current.terminate();
      }
    };
  }, []);

  return {
    swarmStatus,
    workletStatus,
    connectWorklet,
    joinSwarm,
    leaveSwarm,
    generateTopic
  };
}