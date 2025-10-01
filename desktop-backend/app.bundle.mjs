// simplified-backend.mjs
console.log("Simple backend starting...")

// Get the pipe from the Pear worker
const pipe = Pear.worker.pipe()

// Simple message types
const MESSAGE_TYPES = {
  INIT: 'init',
  ADD_NOTE: 'add_note',
  GET_NOTES: 'get_notes',
  NOTES_UPDATE: 'notes_update'
}

// Simple in-memory storage (in real app you'd use a proper database)
let notes = []

// Handle incoming messages from the frontend
pipe.on('data', (data) => {
  try {
    const message = JSON.parse(data.toString())
    console.log('Received message:', message)
    
    switch (message.type) {
      case MESSAGE_TYPES.INIT:
        console.log('Backend initialized')
        sendToFrontend({ type: MESSAGE_TYPES.NOTES_UPDATE, notes })
        break
        
      case MESSAGE_TYPES.ADD_NOTE:
        const newNote = {
          id: Date.now(),
          text: message.text,
          timestamp: new Date().toISOString()
        }
        notes.push(newNote)
        console.log('Added note:', newNote)
        sendToFrontend({ type: MESSAGE_TYPES.NOTES_UPDATE, notes })
        break
        
      case MESSAGE_TYPES.GET_NOTES:
        sendToFrontend({ type: MESSAGE_TYPES.NOTES_UPDATE, notes })
        break
        
      default:
        console.log('Unknown message type:', message.type)
    }
  } catch (error) {
    console.error('Error processing message:', error)
  }
})

// Function to send messages to frontend
function sendToFrontend(message) {
  const data = JSON.stringify(message)
  pipe.write(data)
  console.log('Sent to frontend:', message)
}

// Handle cleanup
Pear.teardown(async () => {
  console.log('Backend cleanup')
  pipe.end()
})

console.log("Simple backend ready")

pipe.write(JSON.stringify({hello: "yes"}))
