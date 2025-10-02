// transport.mjs
import RPC from 'bare-rpc'
import { join } from 'bare-path'
import URL from 'bare-url'

// Utility functions
function getIpcOrPipe() {
  if (typeof BareKit !== 'undefined') {
    const { IPC } = BareKit;
    return IPC;
  }
  return Pear.worker.pipe();
}

function getTransportType() {
  if (typeof BareKit !== 'undefined') {
    return 'mobile';
  }
  return 'desktop';
}

function getTopic() {
  const transportType = getTransportType();
  
  if (transportType === 'desktop') {
    const pipeArgs = Bare.argv.slice().reverse();
    return pipeArgs[0];
  } else {
    return Bare.argv[1];
  }
}

function getStoragePath() {
  const transportType = getTransportType();
  
  if (transportType === 'desktop') {
    const pipeArgs = Bare.argv.slice().reverse();
    return pipeArgs[1];
  } else {
    return Bare.argv[0];
  }
}

function getRuntimeStoragePath() {
  const transportType = getTransportType();
  const storagePath = getStoragePath();
  
  if (transportType === 'desktop') {
    return join(storagePath, 'school-notes-app');
  } else {
    const url = URL.fileURLToPath(storagePath);
    return join(url, 'school-notes-app');
  }
}

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

    console.log("message to send from pipe", message)

    this.pipe.write(JSON.stringify(message));
  }
}

export { 
  createTransport, 
  PipeTransport, 
  BareRPCTransport, 
  PipeRequest,
  getIpcOrPipe,
  getTransportType,
  getTopic,
  getStoragePath,
  getRuntimeStoragePath
}
