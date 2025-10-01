import b4a from 'b4a';
import RPC from 'bare-rpc';
import { Paths } from 'expo-file-system';
import React, { useRef, useState } from 'react';
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';
import { Worklet } from 'react-native-bare-kit';
import {
	RPC_JOIN_SWARM,
	RPC_PEERS_UPDATED,
	RPC_SWARM_JOINED
} from '../rpc-commands.mjs';
import bundle from './app.bundle.mjs';

const topicKey = process.env.EXPO_PUBLIC_TOPIC_KEY 

export default function WorkletDemo() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSwarmJoined, setIsSwarmJoined] = useState(false)
  const [peers, setPeers] = useState([])
  const rpcRef = useRef<any>(null)
  const workletRef = useRef<any>(null)
  
  console.log("workled demo!")


  const handleJoinNetwork = async () => {

		console.log("join network")

    setIsConnecting(true)

    if (!topicKey) {
      console.error("Define the topic key in .env file")
      setIsConnecting(false)
      return
    }

		const documentDirectory = Paths.document.uri
		

		console.log("document directory", documentDirectory)

    const worklet = new Worklet()
    worklet.start('/app.bundle', bundle, [String(documentDirectory), topicKey])
    const { IPC } = worklet

		console.log('worklet', worklet)

    workletRef.current = worklet

    const rpc = new RPC(IPC, (req) => {
      if (req.command === RPC_SWARM_JOINED) {
        console.log('swarm joined')
        setIsConnecting(false)
        setIsSwarmJoined(true)
      }

      if (req.command === RPC_PEERS_UPDATED) {
        if (!req.data) {
          return
        }

        const data = b4a.toString(req.data)
        const peers = JSON.parse(data.toString())

        console.log('peers updated', peers)
        setPeers(peers)
      }
    })

    rpcRef.current = rpc

    const req = rpc.request(RPC_JOIN_SWARM)
    req.send()
  }

  if (isConnecting) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Joining swarm, please wait...</Text>
      </View>
    )
  }

  if (!isSwarmJoined) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={handleJoinNetwork}
        >
          <Text style={styles.buttonText}>Join Swarm v2</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.successText}>
        ✅ Swarm Joined! {peers.length} peers connected
      </Text>
    </View>
  )
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
})
