// DesktopWorkletDemo.tsx
import b4a from 'b4a';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  RPC_JOIN_SWARM,
  RPC_PEERS_UPDATED,
  RPC_SWARM_JOINED
} from '../rpc-commands.mjs';

const topicKey = process.env.EXPO_PUBLIC_TOPIC_KEY;  // Or use env from Pear.config.env


export default function DesktopWorkletDemo() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwarmJoined, setIsSwarmJoined] = useState(false);
  const [peers, setPeers] = useState([]);
  const rpcRef = useRef<any>(null);
  const workerRef = useRef<any>(null);

  const handleJoinNetwork = async () => {

    console.log('handle join')

    setIsConnecting(true);

    if (!topicKey) {
      console.error("Define the topic key in .env file");
      setIsConnecting(false);
      return;
    }

    // // Use Pear.config.storage or a relative path for documentDirectory
    const documentDirectory = Pear.config.storage;  // Or hardcode './school-notes-app'
    
    console.log("document directory desktop: ", documentDirectory)

    // const pipe = Pear.worker.run("desktop-backend/app.bundle.mjs", [documentDirectory,topicKey]);

    const pipe = Pear.worker.run("desktop-backend/app.bundle.mjs", [documentDirectory,topicKey]);

        // Add error handling for the worker
    if (pipe && typeof pipe.on === 'function') {
      pipe.on('error', (error) => {
        // eslint-disable-next-line no-console
        console.error('[Desktop Platform] Worker error:', error)
      })

      pipe.on('close', (data) => {
        // eslint-disable-next-line no-console
        console.log('[Desktop Platform] Worker closed')
      })
    }

      pipe.on('data', (data) => {
        const str = Buffer.from(data).toString()
        const lines = str.split('\n')
        for (let msg of lines) {
          msg = msg.trim()
          if (!msg) continue

          console.log("msg", msg)
        }
      })

  };

  if (isConnecting) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Joining swarm, please wait...</Text>
      </View>
    );
  }

  if (!isSwarmJoined) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={handleJoinNetwork}
        >
          <Text style={styles.buttonText}>Join Swarm DESKTOP</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.successText}>
        ✅ Swarm Joined! {peers.length} peers connected
      </Text>
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
  joinButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  successText: {
    fontSize: 18,
    color: '#34C759',
    textAlign: 'center',
  },
});
