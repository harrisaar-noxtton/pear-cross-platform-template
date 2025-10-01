// /* global Bare, BareKit */

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

let ipcOrPipe;
if (typeof Pear !== 'undefined' && Pear.worker) {
  ipcOrPipe = Pear.worker.pipe();  // Desktop (Pear worker)
  console.log("it was Pear, create Desktop ")
} else {
  const { IPC } = BareKit;
  ipcOrPipe = IPC;  // Mobile (Worklet) or pure Bare
  console.log("it was Bare, creat BareKit")
}


const path = join(URL.fileURLToPath(Bare.argv[0]), 'school-notes-app')

console.log("trying to join", path)

// Static topic key per app instance to avoid regeneration.
//  (no need for QR codes or sharing manually.)
const TOPIC = Bare.argv[1]

console.log("TOPIC", TOPIC)

Bare.on('teardown', async () => {
  console.log('teardown')
  await destroyConnections()
})

const networkService = new NetworkService()
const notesCoreService = new NotesCoreService(path)

async function destroyConnections() {
  await networkService.destroy()
  await notesCoreService.close()
}

let rpc

function sendNotesToUI(notes) {
  const req = rpc.request(RPC_NOTES_RECEIVED)
  req.send(JSON.stringify(notes))
}

notesCoreService.onNotesUpdated(async () => {
  const notes = await notesCoreService.getNotes()
  sendNotesToUI(notes)
})

networkService.onPeerUpdate(() => {
  const req = rpc.request(RPC_PEERS_UPDATED)
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

rpc = new RPC(ipcOrPipe, async (req, error) => {
  if (req.command === RPC_JOIN_SWARM) {
    await notesCoreService.initialize()

    await networkService.joinSwarm(b4a.from(TOPIC, 'hex'))

    rpc.request(RPC_SWARM_JOINED).send()

    const messages = await notesCoreService.getNotes()
    sendNotesToUI(messages)
  }

  if (req.command === RPC_APPEND_NOTE) {
    const data =
      req.data && req.data.toString ? req.data.toString() : String(req.data)

    await notesCoreService.appendNote(data)

    req.reply('appended')
  }

  if (req.command === RPC_REQUEST_PEER_NOTES) {
    networkService.requestPeerNotes()
    req.reply('requested')
  }

  // For debuging of connections.
  if (req.command === RPC_CHECK_CONNECTION) {
    console.log('checking connection')
    const info = networkService.getConnectionInfo()
    req.reply(JSON.stringify(info))
  }

  // TODO: Fix swarm.peers process leaks in Android builds
  //   However, this does work for disconnecting active connections.
  if (req.command === RPC_DESTROY) {
    console.log('destroying')
    await destroyConnections()
    req.reply('Destroyed!')
  }
})
