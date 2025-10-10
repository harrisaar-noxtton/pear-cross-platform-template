import * as React from 'react';
import { useRef, useState } from 'react';
import {
  RPC_JOIN_SWARM,
  RPC_PEERS_UPDATED,
  RPC_SWARM_JOINED,
  RPC_RESET,
  RPC_APPEND_NOTE,
  RPC_APPEND_NOTE_SUCCESS,
  RPC_NOTES_RECEIVED,
  RPC_REQUEST_PEER_NOTES,
  RPC_REQUEST_PEER_NOTES_SUCCESS,
  RPC_CHECK_CONNECTION_SUCCESS,
  RPC_CREATE_TOPIC_SUCCESS,
  RPC_CREATE_TOPIC
} from '../rpc-commands.mjs';
import { ConnectionStatus } from './useWorklet';
import { UseWorkletConfig, UseWorkletReturn } from './useWorklet';
import { Note } from '@/app/(tabs)/PeersWorkletDemoScreen';

export interface DataPayload {
  command: number;
  data: DataContent;
}

export interface DataContent {
  message?: string;
  peersCount?: number;
  topicKey?: string;
  notes?: Array<{
    authorId: string;
    createdAt: string;
    messageText: string;
    timestamp: number;
  }>;
}

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

export function useWorkletDesktop(params: UseWorkletConfig): UseWorkletReturn {
  const { onPeersUpdated } = params;

  const [swarmStatus, setSwarmStatus] = useState<ConnectionStatus>(ConnectionStatus.offline);
  const [workletStatus, setWorkletStatus] = useState<ConnectionStatus>(ConnectionStatus.offline);
  const [notes, setNotes] = useState<Note[]>([]);
  
  const pipeRef = useRef<any>(null);
  const pendingCreateTopicRef = useRef<PendingRequest | null>(null);
  const pendingAppendNoteRef = useRef<PendingRequest | null>(null);
  const pendingImportNotesRef = useRef<PendingRequest | null>(null);

  const connectWorklet = (): void => {
    if (pipeRef.current) {
      console.warn('Worklet already connected');
      return;
    }

    console.log('useWorkletDesktop: connecting worklet');
    setWorkletStatus(ConnectionStatus.connecting);

    console.log("pear config storage,", Pear.config.storage)

    const pipe = Pear.worker.run('backend/backend.mjs', [Pear.config.storage]);
    pipeRef.current = pipe;

    if (pipe && typeof pipe.on === 'function') {
      pipe.on('error', (error) => {
        console.error('[useWorkletDesktop] Worker error:', error);
        setWorkletStatus(ConnectionStatus.offline);
        setSwarmStatus(ConnectionStatus.offline);
        if (pendingCreateTopicRef.current) {
          pendingCreateTopicRef.current.reject(error);
          pendingCreateTopicRef.current = null;
        }
        if (pendingAppendNoteRef.current) {
          pendingAppendNoteRef.current.reject(error);
          pendingAppendNoteRef.current = null;
        }
        if (pendingImportNotesRef.current) {
          pendingImportNotesRef.current.reject(error);
          pendingImportNotesRef.current = null;
        }
      });

      pipe.on('close', (data) => {
        console.log('[useWorkletDesktop] Worker closed');
        setWorkletStatus(ConnectionStatus.offline);
        setSwarmStatus(ConnectionStatus.offline);
        pipeRef.current = null;
      });
    }

    pipe.on('data', (data) => {
      try {
        const dataPayload: DataPayload = JSON.parse(Buffer.from(data).toString());

        console.log('dataPayload', dataPayload);

        if (dataPayload.command === RPC_CREATE_TOPIC_SUCCESS) {
          console.log('topic key', dataPayload.data?.topicKey);
          if (pendingCreateTopicRef.current && dataPayload.data?.topicKey) {
            pendingCreateTopicRef.current.resolve(dataPayload.data.topicKey);
            pendingCreateTopicRef.current = null;
          }
        }

        if (dataPayload.command === RPC_SWARM_JOINED) {
          setSwarmStatus(ConnectionStatus.online);
        }

        if (dataPayload.command === RPC_PEERS_UPDATED) {
          onPeersUpdated(dataPayload.data?.peersCount || 0);
        }

        if (dataPayload.command === RPC_RESET) {
          console.warn('RPC_RESET: implement');
        }

        if (dataPayload.command === RPC_APPEND_NOTE_SUCCESS) {
          console.log('RPC_APPEND_NOTE_SUCCESS received');
          if (pendingAppendNoteRef.current) {
            pendingAppendNoteRef.current.resolve(true);
            pendingAppendNoteRef.current = null;
          }
        }

        if (dataPayload.command === RPC_NOTES_RECEIVED) {
          const receivedNotes = dataPayload.data?.notes || [];
          const formattedNotes: Note[] = receivedNotes.map((note, index) => ({
            id: `${note.timestamp}-${index}`,
            authorId: note.authorId,
            messageText: note.messageText,
            createdAt: note.createdAt,
            timestamp: note.timestamp,
          }));

          console.log('received notes', receivedNotes)
          console.log("formatted", formattedNotes)
          setNotes(formattedNotes);
        }

        if (dataPayload.command === RPC_REQUEST_PEER_NOTES_SUCCESS) {
          console.log('RPC_REQUEST_PEER_NOTES_SUCCESS received');
          if (pendingImportNotesRef.current) {
            pendingImportNotesRef.current.resolve(true);
            pendingImportNotesRef.current = null;
          }
        }

        if (dataPayload.command === RPC_CHECK_CONNECTION_SUCCESS) {
          console.warn('RPC_CHECK_CONNECTION_SUCCESS: implement');
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

    setWorkletStatus(ConnectionStatus.online);
  };

  const joinSwarm = async (topicKey: string): Promise<void> => {
    if (!pipeRef.current) {
      throw new Error('Worklet not connected. Call connectWorklet() first.');
    }

    if (!topicKey) {
      throw new Error('Topic key is required');
    }

    console.log('useWorkletDesktop: joining swarm');
    setSwarmStatus(ConnectionStatus.connecting);

    const joinMessage = { command: RPC_JOIN_SWARM, data: { topicKey } };
    pipeRef.current.write(JSON.stringify(joinMessage));
  };

  const generateTopic = async (): Promise<string> => {
    if (!pipeRef.current) {
      throw new Error('Worklet not connected. Call connectWorklet() first.');
    }

    return new Promise<string>((resolve, reject) => {
      pendingCreateTopicRef.current = { resolve, reject };
      const createTopicMessage = { command: RPC_CREATE_TOPIC };
      pipeRef.current.write(JSON.stringify(createTopicMessage));
    });
  };

  const appendNote = async (text: string): Promise<void> => {
    if (!pipeRef.current) {
      throw new Error('Worklet not connected. Call connectWorklet() first.');
    }

    if (!text) {
      throw new Error('Note text is required');
    }

    console.log('useWorkletDesktop: appendNote:', text);

    return new Promise<void>((resolve, reject) => {
      pendingAppendNoteRef.current = { resolve, reject };
      const appendMessage = { command: RPC_APPEND_NOTE, data: { text } };
      pipeRef.current.write(JSON.stringify(appendMessage));
    });
  };

  const importNotes = async (): Promise<void> => {
    if (!pipeRef.current) {
      throw new Error('Worklet not connected. Call connectWorklet() first.');
    }

    console.log('useWorkletDesktop: importNotes');

    return new Promise<void>((resolve, reject) => {
      pendingImportNotesRef.current = { resolve, reject };
      const importMessage = { command: RPC_REQUEST_PEER_NOTES };
      pipeRef.current.write(JSON.stringify(importMessage));
    });
  };

  return {
    joinSwarm,
    swarmStatus,
    generateTopic,
    connectWorklet,
    workletStatus,
    notes,
    appendNote,
    importNotes
  };
}
