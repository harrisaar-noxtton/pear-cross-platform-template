// DesktopWorkletDemo.tsx
import b4a from 'b4a';
import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View
} from 'react-native';
import {
  RPC_JOIN_SWARM,
  RPC_PEERS_UPDATED,
  RPC_SWARM_JOINED
} from '../rpc-commands.mjs';
import ConnectedPairsDisplay from './ConnectedPairsDisplay';
import JoinButton from './JoinButton';
import JoiningSwarmLoader from './JoiningSwarmLoader';

const topicKey = process.env.EXPO_PUBLIC_TOPIC_KEY;

export default function DesktopWorkletDemo(): React.ReactElement {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwarmJoined, setIsSwarmJoined] = useState(false);
  const [peers, setPeers] = useState([]);
  const rpcRef = useRef<any>(null);
  const workerRef = useRef<any>(null);

  const handleJoinNetwork = async (): Promise<void> => {
    console.log('handle join');

    setIsConnecting(true);

    if (!topicKey) {
      console.error("Define the topic key in .env file");
      setIsConnecting(false);
      return;
    }

    //@ts-ignore
    const documentDirectory = Pear.config.storage;
    
    console.log("document directory desktop: ", documentDirectory);

    const pipe = Pear.worker.run("desktop-backend/app.bundle.mjs", [documentDirectory,topicKey]);

    if (pipe && typeof pipe.on === 'function') {
      pipe.on('error', (error) => {
        console.error('[Desktop Platform] Worker error:', error);
      });

      pipe.on('close', (data) => {
        console.log('[Desktop Platform] Worker closed');
      });
    }

    pipe.on('data', (data) => {
      const str = Buffer.from(data).toString();
      const lines = str.split('\n');
      for (let msg of lines) {
        msg = msg.trim();
        if (!msg) continue;

        console.log("msg", msg);
      }
    });
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
      <ConnectedPairsDisplay peerCount={peers.length} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  }
});
