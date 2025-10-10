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
  RPC_CREATE_TOPIC,
  RPC_CREATE_TOPIC_SUCCESS,
  RPC_APPEND_NOTE,
  RPC_APPEND_NOTE_SUCCESS,
  RPC_NOTES_RECEIVED,
  RPC_REQUEST_PEER_NOTES,
  RPC_REQUEST_PEER_NOTES_SUCCESS
} from '../rpc-commands.mjs';
import bundle from '../components/app.bundle.mjs';
import { ConnectionStatus } from './useWorklet';
import { UseWorkletConfig, UseWorkletReturn } from './useWorklet';
import { Note } from '@/app/(tabs)/PeersWorkletDemoScreen';

interface DataContent {
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

export function useWorkletMobile(config: UseWorkletConfig): UseWorkletReturn {
  const { onPeersUpdated } = config;
  
  const [swarmStatus, setSwarmStatus] = useState<ConnectionStatus>(ConnectionStatus.offline);
  const [workletStatus, setWorkletStatus] = useState<ConnectionStatus>(ConnectionStatus.offline);
  const [notes, setNotes] = useState<Note[]>([]);
  const rpcRef = useRef<any>(null);
  const workletRef = useRef<any>(null);
  const pendingCreateTopicRef = useRef<PendingRequest | null>(null);
  const pendingAppendNoteRef = useRef<PendingRequest | null>(null);
  const pendingImportNotesRef = useRef<PendingRequest | null>(null);

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

      if (req.command === RPC_APPEND_NOTE_SUCCESS) {
        console.log('RPC_APPEND_NOTE_SUCCESS received');
        if (pendingAppendNoteRef.current) {
          pendingAppendNoteRef.current.resolve(true);
          pendingAppendNoteRef.current = null;
        }
      }

      if (req.command === RPC_NOTES_RECEIVED) {
        const receivedNotes = dataContent?.notes || [];
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

      if (req.command === RPC_REQUEST_PEER_NOTES_SUCCESS) {
        console.log('RPC_REQUEST_PEER_NOTES_SUCCESS received');
        if (pendingImportNotesRef.current) {
          pendingImportNotesRef.current.resolve(true);
          pendingImportNotesRef.current = null;
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

  const appendNote = async (text: string): Promise<void> => {
    if (!rpcRef.current) {
      throw new Error('Worklet not connected. Call connectWorklet() first.');
    }

    if (!text) {
      throw new Error('Note text is required');
    }

    console.log('useWorkletMobile: appendNote:', text);

    return new Promise<void>((resolve, reject) => {
      pendingAppendNoteRef.current = { resolve, reject };
      const req = rpcRef.current.request(RPC_APPEND_NOTE);
      req.send(JSON.stringify({ text }));
    });
  };

  const importNotes = async (): Promise<void> => {
    if (!rpcRef.current) {
      throw new Error('Worklet not connected. Call connectWorklet() first.');
    }

    console.log('useWorkletMobile: importNotes');

    return new Promise<void>((resolve, reject) => {
      pendingImportNotesRef.current = { resolve, reject };
      const req = rpcRef.current.request(RPC_REQUEST_PEER_NOTES);
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
    generateTopic,
    notes,
    appendNote,
    importNotes
  };
}
