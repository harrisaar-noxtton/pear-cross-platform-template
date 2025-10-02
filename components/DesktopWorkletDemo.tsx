// DesktopWorkletDemo.tsx
import b4a from 'b4a';
import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator
} from 'react-native';
import {
  RPC_JOIN_SWARM,
  RPC_PEERS_UPDATED,
  RPC_SWARM_JOINED,
  RPC_DESTROY
} from '../rpc-commands.mjs';
import ConnectedPairsDisplay from './ConnectedPairsDisplay';
import JoinButton from './JoinButton';
import JoiningSwarmLoader from './JoiningSwarmLoader';
import LeaveButton from './LeaveButton';

const topicKey = process.env.EXPO_PUBLIC_TOPIC_KEY;

interface Props {}

export default function DesktopWorkletDemo(props: Props): React.ReactElement {
  const {} = props;
  
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isSwarmJoined, setIsSwarmJoined] = useState<boolean>(false);
  const [peers, setPeers] = useState<any[]>([]);
  const [isDestroyLoading, setIsDestroyLoading] = useState<boolean>(false);
  const pipeRef = useRef<any>(null);
  const workerRef = useRef<any>(null);

  const handleJoinNetwork = async (): Promise<void> => {
    console.log('handle join');

    setIsConnecting(true);

    if (!topicKey) {
      console.error("Define the topic key in .env file");
      setIsConnecting(false);
      return;
    }

    const pipe = Pear.worker.run("backend/backend.mjs", [
      //  Using here Pear.config.storage will give us wrong path.
      //   we must use the Pear config on the backend side
      Pear.config.storage, 
      topicKey
    ]);

    pipeRef.current = pipe;
    workerRef.current = pipe;

    if (pipe && typeof pipe.on === 'function') {
      pipe.on('error', (error) => {
        console.error('[Desktop Platform] Worker error:', error);
        setIsConnecting(false);
      });

      pipe.on('close', (data) => {
        console.log('[Desktop Platform] Worker closed');
        setIsSwarmJoined(false);
        setIsConnecting(false);
      });
    }

    pipe.on('data', (data) => {
      try {
        const message = JSON.parse(Buffer.from(data).toString());
        
        if (message.command === RPC_SWARM_JOINED) {
          console.log('swarm joined');
          setIsConnecting(false);
          setIsSwarmJoined(true);
        }

        if (message.command === RPC_PEERS_UPDATED) {
          const peers = JSON.parse(message.data);
          console.log('peers updated', peers);
          setPeers(peers);
        }
      } catch (error) {
        console.error('Error parsing pipe message:', error);
      }
    });

    // Send join swarm command
    const joinMessage = { command: RPC_JOIN_SWARM };
    pipe.write(JSON.stringify(joinMessage));
  };

  const handleDestroyConnection = async (): Promise<void> => {
    if (pipeRef.current) {
      setIsDestroyLoading(true);
      
      const destroyMessage = { command: RPC_DESTROY };
      pipeRef.current.write(JSON.stringify(destroyMessage));

      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }

      setIsSwarmJoined(false);
      setIsConnecting(false);
      pipeRef.current = null;
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
