import b4a from 'b4a'
import {
  RPC_APPEND_NOTE,
  RPC_APPEND_NOTE_SUCCESS,
  RPC_CHECK_CONNECTION,
  RPC_CHECK_CONNECTION_SUCCESS,
  RPC_CREATE_TOPIC_SUCCESS,
  RPC_CREATE_TOPIC,
  RPC_DESTROY,
  RPC_DESTROY_SUCCESS,
  RPC_JOIN_SWARM,
  RPC_NOTES_RECEIVED,
  RPC_PEERS_UPDATED,
  RPC_REQUEST_PEER_NOTES,
  RPC_REQUEST_PEER_NOTES_SUCCESS,
  RPC_SWARM_JOINED
} from '../rpc-commands.mjs'
import { NetworkService } from './NetworkService.mjs'
import { NotesCoreService } from './NotesCoreService.mjs'
import { 
  createTransport,
  getIpcOrPipe,
  getTransportType,
  getRuntimeStoragePath
} from './transport.mjs'
import crypto from 'hypercore-crypto' // Cryptographic functions for generating the key in app

console.log("backend.mjs loading")




const ipcOrPipe = getIpcOrPipe();
const transportType = getTransportType();
const path = getRuntimeStoragePath();

if (transportType === 'mobile') {
  console.log("Using BareKit (mobile environment)");
} else {
  console.log("Using Pipe (desktop environment)");
}

console.log("Path", path)
console.log("Transport type:", transportType)

// TODO: this should not be here
Bare.on('teardown', async () => {
  console.log('teardown')
  await destroyConnections()
})

const networkService = new NetworkService()
const notesCoreService = new NotesCoreService(path)
let transport;

async function destroyConnections() {
  await networkService.destroy()
  await notesCoreService.close()
}

function sendNotesToUI(notes) {
  const req = transport.request(RPC_NOTES_RECEIVED)
  console.log('send notes', notes)
  req.send(JSON.stringify(notes || []))
}

notesCoreService.onNotesUpdated(async () => {
  const notes = await notesCoreService.getNotes()
  sendNotesToUI(notes)
})

networkService.onPeerUpdate(() => {
  const req = transport.request(RPC_PEERS_UPDATED)
  console.log("send peers info","get peers",)
  req.send(JSON.stringify({message: "peers updated", peersCount: networkService.getPeers().length}))
})

networkService.onPeerMessage(async (payload, peerId) => {
  if (payload && payload.type === 'REQUEST_NOTES') {
    const notes = await notesCoreService.getNotes()
    networkService.sendToPeer(peerId, { type: 'NOTES_RESPONSE', notes })
    return
  }
  if (
    payload &&
    payload.type === 'NOTES_RESPONSE' &&
    Array.isArray(payload.notes)
  ) {
    await notesCoreService.mergeNotes(payload.notes)
    const merged = await notesCoreService.getNotes()
    sendNotesToUI(merged)
    return
  }
})

function createTopicBuffer(){
  return crypto.randomBytes(32)
}

async function handleTransportRequest(req, error) {
  console.log("handleTransportRequest", req.command)

  if (req.command === RPC_CREATE_TOPIC){
    transport.request(RPC_CREATE_TOPIC_SUCCESS).send(JSON.stringify({
      message: "topic buffer created", 
      topicKey: b4a.toString(createTopicBuffer(), 'hex')
    }))
  }

  if (req.command === RPC_JOIN_SWARM) {

    console.log("v3 handling join swarm request: req.data:", 
      req.data)

    // desktop already has topicKey
    let topicKey = req.data.topicKey

    console.log("topicKey directly:", topicKey)

    if(req.data && !topicKey){
      if (req.data.toString){
        // Needed for Mobile connection
        console.log("has string method")
        console.log("result" , req.data.toString())
        topicKey = JSON.parse(req.data.toString()).topicKey
      }
      else {
        console.log("has no string method")
        console.log("result", String(req.data))
      }
    }

    await notesCoreService.initialize()

    console.log("notes initalized topic is:", topicKey)

    const swarmId = b4a.from(topicKey, 'hex')

    console.log('swarm id', swarmId)

    await networkService.joinSwarm(swarmId)

    console.log("network joined send swarm joined")

    transport.request(RPC_SWARM_JOINED).send(JSON.stringify({message: "swarm joined"}))

    console.log('swarm join event sent')

    const messages = await notesCoreService.getNotes()
    console.log("messages send", messages)
    sendNotesToUI(messages)
  }

  if (req.command === RPC_APPEND_NOTE) {
    const data = req.data && req.data.toString ? req.data.toString() : String(req.data)
    await notesCoreService.appendNote(data)
    console.log('send appnede')
    transport.request(RPC_APPEND_NOTE_SUCCESS).send(JSON.stringify({message: "notes appended"}))
  }

  if (req.command === RPC_REQUEST_PEER_NOTES) {
    networkService.requestPeerNotes()
    console.log('send requested')
    transport.request(RPC_REQUEST_PEER_NOTES_SUCCESS).send(JSON.stringify({message: "peer notes requested"}))
  }

  if (req.command === RPC_CHECK_CONNECTION) {
    console.log('checking connection')
    const info = networkService.getConnectionInfo()
    console.log("send connection")
    transport.request(RPC_CHECK_CONNECTION_SUCCESS).send(JSON.stringify({info}))

  }

  if (req.command === RPC_DESTROY) {
    console.log('destroying')
    await destroyConnections()
    console.log("send destroy")
    transport.request(RPC_DESTROY_SUCCESS).send(JSON.stringify({message: "rpc destroyed success"}))
  }
}

transport = createTransport(transportType, ipcOrPipe, handleTransportRequest);
