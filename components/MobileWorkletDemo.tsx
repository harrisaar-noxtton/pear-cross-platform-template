// MobileWorkletDemo.tsx
import b4a from 'b4a';
import RPC from 'bare-rpc';
import { Paths } from 'expo-file-system';
import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Worklet } from 'react-native-bare-kit';
import {
  RPC_JOIN_SWARM,
  RPC_PEERS_UPDATED,
  RPC_SWARM_JOINED,
  RPC_DESTROY
} from '../rpc-commands.mjs';
import bundle from './app.bundle.mjs';
import ConnectedPairsDisplay from './ConnectedPairsDisplay';
import JoinButton from './JoinButton';
import JoiningSwarmLoader from './JoiningSwarmLoader';
import LeaveButton from './LeaveButton';
import { PRIMARY_RED_COLOR } from '@/constants/Colors';

const topicKey = process.env.EXPO_PUBLIC_TOPIC_KEY;

export default function MobileWorkletDemo(): React.ReactElement {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwarmJoined, setIsSwarmJoined] = useState(false);
  const [peers, setPeers] = useState([]);
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
      if (req.command === RPC_SWARM_JOINED) {
        console.log('swarm joined');
        setIsConnecting(false);
        setIsSwarmJoined(true);
      }

      if (req.command === RPC_PEERS_UPDATED) {
        if (!req.data) {
          return;
        }

        const data = b4a.toString(req.data);
        const peers = JSON.parse(data.toString());

        console.log('peers updated', peers);
        setPeers(peers);
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

      const replayBuffer = await req.reply();

      console.log(b4a.toString(replayBuffer));

      if (workletRef.current) {
        workletRef.current.terminate();
        workletRef.current = null;
      }

      setIsSwarmJoined(false);
      setIsConnecting(false);
      rpcRef.current = null;
      setIsDestroyLoading(false);
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
      <ConnectedPairsDisplay peerCount={peers.length} />
      <View style={styles.buttonContainer}>
        {isDestroyLoading && <ActivityIndicator />}
        {!isDestroyLoading && (
          <TouchableOpacity
            style={styles.destroyButton}
            onPress={handleDestroyConnection}
          >
            <LeaveButton isLoading={isDestroyLoading} />
          </TouchableOpacity>
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
  destroyButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: PRIMARY_RED_COLOR,
    borderRadius: 5,
  },
});
