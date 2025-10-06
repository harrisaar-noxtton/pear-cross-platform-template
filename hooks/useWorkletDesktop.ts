import * as React from 'react';
import { useRef, useState } from 'react';
import {
  RPC_JOIN_SWARM,
  RPC_PEERS_UPDATED,
  RPC_SWARM_JOINED,
  RPC_DESTROY,
  RPC_RESET,
  RPC_APPEND_NOTE_SUCCESS,
  RPC_NOTES_RECEIVED,
  RPC_REQUEST_PEER_NOTES_SUCCESS,
  RPC_CHECK_CONNECTION_SUCCESS,
  RPC_DESTROY_SUCCESS
} from '../rpc-commands.mjs';
import { WorkletStatus } from '@/app/(tabs)/PeersWorkletDemoScreen';

const topicKey = process.env.EXPO_PUBLIC_TOPIC_KEY;

export interface DataPayload {
  command: number;
  data: DataContent;
}

export interface DataContent {
  message?: string;
  peersCount?: number;
}

interface UseWorkletDesktopParams {
  onPeersUpdated: (peersCount: number) => void;
}

interface UseWorkletDesktopReturn {
  status: WorkletStatus;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useWorkletDesktop(params: UseWorkletDesktopParams): UseWorkletDesktopReturn {
  const { onPeersUpdated } = params;

  const [status, setStatus] = useState<WorkletStatus>(WorkletStatus.offline);
  const pipeRef = useRef<any>(null);

  const connect = async (): Promise<void> => {
    console.log('useWorkletDesktop: connecting');

    setStatus(WorkletStatus.connecting);

    if (!topicKey) {
      console.error('Define the topic key in .env file');
      setStatus(WorkletStatus.offline);
      return;
    }

    const pipe = Pear.worker.run('backend/backend.mjs', [
      Pear.config.storage,
      topicKey
    ]);

    pipeRef.current = pipe;

    if (pipe && typeof pipe.on === 'function') {
      pipe.on('error', (error) => {
        console.error('[useWorkletDesktop] Worker error:', error);
        setStatus(WorkletStatus.offline);
      });

      pipe.on('close', (data) => {
        console.log('[useWorkletDesktop] Worker closed');
        setStatus(WorkletStatus.offline);
      });
    }

    pipe.on('data', (data) => {
      try {
        const dataPayload: DataPayload = JSON.parse(Buffer.from(data).toString());

        console.log('dataPayload', dataPayload);

        if (dataPayload.command === RPC_SWARM_JOINED) {
          console.log('swarm joined');
          setStatus(WorkletStatus.online);
        }

        if (dataPayload.command === RPC_PEERS_UPDATED) {
          onPeersUpdated(dataPayload.data?.peersCount || 0);
        }

        if (dataPayload.command === RPC_RESET) {
          console.warn('RPC_RESET: implement');
        }

        if (dataPayload.command === RPC_APPEND_NOTE_SUCCESS) {
          console.warn('RPC_APPEND_NOTE_SUCCESS: implement');
        }

        if (dataPayload.command === RPC_NOTES_RECEIVED) {
          console.warn('RPC_NOTES_RECEIVED: implement');
        }

        if (dataPayload.command === RPC_REQUEST_PEER_NOTES_SUCCESS) {
          console.warn('RPC_REQUEST_PEER_NOTES_SUCCESS: implement');
        }

        if (dataPayload.command === RPC_CHECK_CONNECTION_SUCCESS) {
          console.warn('RPC_CHECK_CONNECTION_SUCCESS: implement');
        }

        if (dataPayload.command === RPC_DESTROY_SUCCESS) {
          console.log('RPC_DESTROY_SUCCESS: cleaning up');
          if (pipeRef.current) {
            pipeRef.current.destroy();
            pipeRef.current = null;
          }
          setStatus(WorkletStatus.offline);
        }
      } catch (error) {
        console.error('Error parsing pipe message:', error);
        console.log(
          'ERROR: data',
          data,
          'buffer from:',
          Buffer.from(data),
          'to string:',
          Buffer.from(data).toString()
        );
      }
    });

    const joinMessage = { command: RPC_JOIN_SWARM };
    pipe.write(JSON.stringify(joinMessage));
  };

  const disconnect = async (): Promise<void> => {
    if (pipeRef.current) {
      const destroyMessage = { command: RPC_DESTROY };
      pipeRef.current.write(JSON.stringify(destroyMessage));
    }
  };

  return {
    status,
    connect,
    disconnect
  };
}
