import Hyperswarm from 'hyperswarm'
import b4a from 'b4a'

export class NetworkService {
  constructor() {
    this.swarm = new Hyperswarm()
    this.onPeerUpdateCallback = null
    this.onPeerMessageCallback = null
    this.peers = new Map()
    this.connections = new Map()
    this.setupSwarmEvents()
  }

  async joinSwarm(topic) {
    console.log('join swarm', topic)
    try {
      const discovery = this.swarm.join(topic, { client: true, server: true })
      await discovery.flushed()
      return discovery
    } catch (e) {
      console.log('error', e)
    }
  }

  setupSwarmEvents() {
    this.swarm.on('connection', (peer) => {
      const id = b4a.toString(peer.remotePublicKey, 'hex').substr(0, 6)
      console.log('connected to peer:', id)

      // todo: kind of duplication.
      this.peers.set(id, { id })
      this.connections.set(id, peer)

      peer.on('data', (data) => {
        try {
          const msg = JSON.parse(data.toString())
          if (this.onPeerMessageCallback) this.onPeerMessageCallback(msg, id)
        } catch (e) {
          console.log('peer message parse error', e)
        }
      })

      peer.on('error', (e) => console.log(`Connection error: ${e}`))

      peer.on('close', () => {
        this.peers.delete(id)
        this.connections.delete(id)
        if (this.onPeerUpdateCallback) this.onPeerUpdateCallback()
      })

      if (this.onPeerUpdateCallback) this.onPeerUpdateCallback()
    })

    this.swarm.on('update', () => {
      console.log('update peers')
      // todo: why it keeps triggering so often?
      if (this.onPeerUpdateCallback) this.onPeerUpdateCallback()
    })
  }

  onPeerUpdate(callback) {
    this.onPeerUpdateCallback = callback
  }

  onPeerMessage(callback) {
    this.onPeerMessageCallback = callback
  }

  requestPeerNotes() {
    this.broadcast({ type: 'REQUEST_NOTES' })
  }

  sendToPeer(peerId, message) {
    const conn = this.connections.get(peerId)
    if (conn && !conn.closed) {
      conn.write(Buffer.from(JSON.stringify(message)))
    }
  }

  broadcast(message) {
    const buf = Buffer.from(JSON.stringify(message))
    this.connections.forEach((conn) => {
      if (!conn.closed) conn.write(buf)
    })
  }

  destroy() {
    return this.swarm.destroy()
  }

  getPeers() {
    return Array.from(this.peers.values())
  }

  getConnectionInfo() {
    try {
      const connections = Array.from(this.swarm.connections)
      const peers = Array.from(this.swarm.peers)

      const activeConnections = connections.filter(
        (conn) => conn.remotePublicKey && !conn.closed
      )

      const noPublicKeyConnections = connections.filter(
        (conn) => !conn.remotePublicKey && !conn.closed
      )

      const closedConnections = connections.filter((conn) => conn.closed)

      return {
        connectionsCount: connections.length,
        activeConnectionsCount: activeConnections.length,
        noPublicKeyConnectionsCount: noPublicKeyConnections.length,
        closedConnectionsCount: closedConnections.length,
        peersCount: peers.length,
        topicsCount: this.swarm.topics ? this.swarm.topics.size : 0,
        swarmConnecting: this.swarm.connecting,
        swarmListening: this.swarm.listening,
        swarmDestroyed: this.swarm.destroyed,
        swarmMaxPeers: this.swarm.maxPeers,
        dhtBootstrapped: this.swarm.dht ? this.swarm.dht.bootstrapped : false,
        dhtDestroyed: this.swarm.dht ? this.swarm.dht.destroyed : true,
        hasActiveConnections: activeConnections.length > 0,
        networkReady: this.swarm.listening && !this.swarm.destroyed
      }
    } catch (e) {
      return {
        error: e.message,
        hasError: true,
        connectionsCount: 0,
        activeConnectionsCount: 0,
        noPublicKeyConnectionsCount: 0,
        closedConnectionsCount: 0,
        peersCount: 0,
        topicsCount: 0
      }
    }
  }
}
