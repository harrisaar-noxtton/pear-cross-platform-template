// backend.mjs
import b4a from 'b4a'
import { join } from 'bare-path'
import RPC from 'bare-rpc'
import URL from 'bare-url'
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

console.log("backend.mjs loading")

// Transport Factory
function createTransport(type, connection) {
  if (type === 'mobile') {
    return new BareRPCTransport(connection);
  }
  return new PipeTransport(connection);
}

class PipeTransport {
  constructor(pipe) {
    this.pipe = pipe;
  }

  request(command) {
    return new PipeRequest(this.pipe, command);
  }
}

class BareRPCTransport {
  constructor(ipc) {
    this.rpc = new RPC(ipc, this.handleRequest.bind(this));
  }

  request(command) {
    return this.rpc.request(command);
  }

  handleRequest(req, error) {
    return handleTransportRequest(req, error);
  }
}

class PipeRequest {
  constructor(pipe, command) {
    this.pipe = pipe;
    this.command = command;
  }

  send(data) {
    const message = { command: this.command, data };
    this.pipe.write(JSON.stringify(message));
  }
}

// Detect environment and set up transport accordingly
let ipcOrPipe;
let transportType;

// Check if BareKit is available (mobile environment)
if (typeof BareKit !== 'undefined') {
  const { IPC } = BareKit;
  ipcOrPipe = IPC;
  transportType = 'mobile';
  console.log("Using BareKit (mobile environment)");
} else {
  // Desktop environment - use pipe from process
  ipcOrPipe = Pear.worker.pipe()
  transportType = 'desktop';
  console.log("Using Pipe (desktop environment)");
}

console.log("Bare.argv[0]", Bare.argv[0])
console.log('direct from config', Pear.config.storage)

let path;

if (transportType === 'desktop') {
  // It's always undefined on the desktop App.
  path = join(Pear.config.storage, 'school-notes-app')
} else {
  // On mobile, convert from file URL to path
  const url = URL.fileURLToPath(Bare.argv[0])
  console.log("url", url)
  path = join(url, 'school-notes-app')
}

console.log("Path", path)


const TOPIC = Bare.argv[1]

console.log('topic', TOPIC)

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
  if (req.command === RPC_JOIN_SWARM) {
    await notesCoreService.initialize()
    await networkService.joinSwarm(b4a.from(TOPIC, 'hex'))
    transport.request(RPC_SWARM_JOINED).send()
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
