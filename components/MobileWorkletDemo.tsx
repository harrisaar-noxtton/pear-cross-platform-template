// MobileWorkletDemo.tsx
import b4a from 'b4a';
import RPC from 'bare-rpc';
import { Paths } from 'expo-file-system';
import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator
} from 'react-native';
import { Worklet } from 'react-native-bare-kit';
import {
  RPC_JOIN_SWARM,
  RPC_PEERS_UPDATED,
  RPC_SWARM_JOINED,
  RPC_DESTROY,
  RPC_RESET,
  RPC_APPEND_NOTE,
  RPC_APPEND_NOTE_SUCCESS,
  RPC_NOTES_RECEIVED,
  RPC_REQUEST_PEER_NOTES,
  RPC_REQUEST_PEER_NOTES_SUCCESS,
  RPC_CHECK_CONNECTION,
  RPC_CHECK_CONNECTION_SUCCESS,
  RPC_DESTROY_SUCCESS
} from '../rpc-commands.mjs';
import bundle from './app.bundle.mjs';
import ConnectedPairsDisplay from './ConnectedPairsDisplay';
import JoinButton from './JoinButton';
import JoiningSwarmLoader from './JoiningSwarmLoader';
import LeaveButton from './LeaveButton';
import { DataContent } from './DesktopWorkletDemo';

const topicKey = process.env.EXPO_PUBLIC_TOPIC_KEY;

interface Props {}

export default function MobileWorkletDemo(props: Props): React.ReactElement {
  const {} = props;
  
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isSwarmJoined, setIsSwarmJoined] = useState<boolean>(false);
  const [peersCount, setPeersCount] = useState<number>(0);
  const [isDestroyLoading, setIsDestroyLoading] = useState<boolean>(false);
  const rpcRef = useRef<any>(null);
  const workletRef = useRef<any>(null);
  
  console.log("workled demo!");

  const handleJoinNetwork = async (): Promise<void> => {
    console.log("join network");

    setIsConnecting(true);

    if (!topicKey) {
      console.error("Define the topic key in .env file");
      setIsConnecting(false);
      return;
    }

    const documentDirectory = Paths.document.uri;

    console.log("document directory", documentDirectory);

    const worklet = new Worklet();
    worklet.start('/app.bundle', bundle, [String(documentDirectory), topicKey]);
    const { IPC } = worklet;

    console.log('worklet', worklet);

    workletRef.current = worklet;

    const rpc = new RPC(IPC, (req) => {
      const dataContent: DataContent = JSON.parse(b4a.toString(req.data).toString());

      console.log("dataContent", dataContent)


      if (req.command === RPC_SWARM_JOINED) {
        console.log('swarm joined');
        setIsConnecting(false);
        setIsSwarmJoined(true);
      }

      if (req.command === RPC_PEERS_UPDATED) {
        setPeersCount(dataContent?.peersCount || 0);
      }

      if (req.command === RPC_RESET) {
        console.warn('RPC_RESET: implement');
      }

      if (req.command === RPC_APPEND_NOTE_SUCCESS) {
        console.warn('RPC_APPEND_NOTE_SUCCESS: implement');
      }

      if (req.command === RPC_NOTES_RECEIVED) {
        console.warn('RPC_NOTES_RECEIVED: implement');
      }

      if (req.command === RPC_REQUEST_PEER_NOTES_SUCCESS) {
        console.warn('RPC_REQUEST_PEER_NOTES_SUCCESS: implement');
      }

      if (req.command === RPC_CHECK_CONNECTION_SUCCESS) {
        console.warn('RPC_CHECK_CONNECTION_SUCCESS: implement');
      }

      if (req.command === RPC_DESTROY_SUCCESS) {
        console.log('RPC_DESTROY_SUCCESS: cleaning up UI state');
        if (workletRef.current) {
          workletRef.current.terminate();
          workletRef.current = null;
        }
        setIsSwarmJoined(false);
        setIsConnecting(false);
        setPeersCount(0);
        rpcRef.current = null;
        setIsDestroyLoading(false);
      }
    });

    rpcRef.current = rpc;

    const req = rpc.request(RPC_JOIN_SWARM);
    req.send();
  };

  const handleDestroyConnection = async (): Promise<void> => {
    if (rpcRef.current) {
      setIsDestroyLoading(true);
      const req = rpcRef.current.request(RPC_DESTROY);
      req.send();
    }
  };

  if (isConnecting) {
    return <JoiningSwarmLoader />;
  }

  if (!isSwarmJoined) {
    return (
      <View style={styles.container}>
        <JoinButton onPress={handleJoinNetwork} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ConnectedPairsDisplay peerCount={peersCount} />
      <View style={styles.buttonContainer}>
        {isDestroyLoading && <ActivityIndicator />}
        {!isDestroyLoading && (
          <LeaveButton 
            isLoading={isDestroyLoading} 
            onPress={handleDestroyConnection}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
