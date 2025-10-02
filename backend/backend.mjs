// backend.mjs
import b4a from 'b4a'
import {
  RPC_APPEND_NOTE,
  RPC_CHECK_CONNECTION,
  RPC_DESTROY,
  RPC_JOIN_SWARM,
  RPC_NOTES_RECEIVED,
  RPC_PEERS_UPDATED,
  RPC_REQUEST_PEER_NOTES,
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
    req.reply('appended')
  }

  if (req.command === RPC_REQUEST_PEER_NOTES) {
    networkService.requestPeerNotes()
    req.reply('requested')
  }

  if (req.command === RPC_CHECK_CONNECTION) {
    console.log('checking connection')
    const info = networkService.getConnectionInfo()
    req.reply(JSON.stringify(info))
  }

  if (req.command === RPC_DESTROY) {
    console.log('destroying')
    await destroyConnections()
    req.reply('Destroyed!')
  }
}

// Initialize transport
transport = createTransport(transportType, ipcOrPipe);

// For pipe transport, set up data handler
if (transportType === 'desktop') {
  ipcOrPipe.on('data', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      await handleTransportRequest(message, null);
    } catch (error) {
      console.error('Pipe message error:', error);
    }
  });
}
