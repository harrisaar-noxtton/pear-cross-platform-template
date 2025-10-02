import b4a from 'b4a'
import {
  RPC_APPEND_NOTE,
  RPC_APPEND_NOTE_SUCCESS,
  RPC_CHECK_CONNECTION,
  RPC_CHECK_CONNECTION_SUCCESS,
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
  getTopic,
  getRuntimeStoragePath
} from './transport.mjs'

console.log("backend.mjs loading")

const ipcOrPipe = getIpcOrPipe();
const transportType = getTransportType();
const TOPIC = getTopic();
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
  req.send(JSON.stringify(notes))
}

notesCoreService.onNotesUpdated(async () => {
  const notes = await notesCoreService.getNotes()
  sendNotesToUI(notes)
})

networkService.onPeerUpdate(() => {
  const req = transport.request(RPC_PEERS_UPDATED)
  req.send(JSON.stringify(networkService.getPeers()))
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

async function handleTransportRequest(req, error) {
  console.log("handleTransportRequest", req.command)

  if (req.command === RPC_JOIN_SWARM) {

    console.log("handling join swarm request")

    await notesCoreService.initialize()

    console.log("notes initalized topic is:", TOPIC)

    const swarmId = b4a.from(TOPIC, 'hex')

    console.log('swarm id', swarmId)

    await networkService.joinSwarm(swarmId)

    console.log("network joined")

    transport.request(RPC_SWARM_JOINED).send()

    console.log('swarm join event sent')

    const messages = await notesCoreService.getNotes()
    
    sendNotesToUI(messages)
  }

  if (req.command === RPC_APPEND_NOTE) {
    const data = req.data && req.data.toString ? req.data.toString() : String(req.data)
    await notesCoreService.appendNote(data)
    transport.request(RPC_APPEND_NOTE_SUCCESS).send('appended')
  }

  if (req.command === RPC_REQUEST_PEER_NOTES) {
    networkService.requestPeerNotes()
    transport.request(RPC_REQUEST_PEER_NOTES_SUCCESS).send('requested')
  }

  if (req.command === RPC_CHECK_CONNECTION) {
    console.log('checking connection')
    const info = networkService.getConnectionInfo()
    transport.request(RPC_CHECK_CONNECTION_SUCCESS).send(JSON.stringify(info))
  }

  if (req.command === RPC_DESTROY) {
    console.log('destroying')
    await destroyConnections()
    transport.request(RPC_DESTROY_SUCCESS).send('Destroyed!')
  }
}

transport = createTransport(transportType, ipcOrPipe, handleTransportRequest);
