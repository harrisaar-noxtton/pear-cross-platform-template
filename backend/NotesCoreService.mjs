import Hypercore from 'hypercore'

export class NotesCoreService {
  constructor(storagePath) {
    console.log('NotesCoreService storagePath:', storagePath)

    this.storagePath = storagePath
    this.core = null
    // todo: just a placeholder. needs to be replace with proper author id logic
    this.authorId = 'user_' + Math.random().toString(36).substr(2, 9)
    this.onNotesUpdatedCallback = null
    this.initialized = false
  }

  async initialize() {
    console.log('initialize()')

    if (this.initialized) {
      console.log('initialize() returning early - already initialized')
      return
    }

    this.core = new Hypercore(this.storagePath)

    await this.core.ready()

    if (this.core.length === 0) {
      await this.addDefaultNotes()
    }

    this.core.on('append', () => {
      this.notifyNotesUpdated()
    })

    this.initialized = true

    console.log('initialize() completed successfully')
  }

  async addDefaultNotes() {
    const defaultNotes = [
      {
        text: 'Fire was invented 2 million years ago.',
        authorId: 'user_teacher_1'
      },
      {
        text: 'P2P architecture was popularized by the Internet file sharing system Napster, originally released in 1999.',
        authorId: 'user_teacher_1'
      },
      {
        text: 'React was initially released to the public as an open-source project in May 2013.',
        authorId: 'user_teacher_1'
      }
    ]
    for (const defaultNote of defaultNotes) {
      const note = this.createNote(defaultNote.text, defaultNote.authorId)
      await this.core.append(Buffer.from(JSON.stringify(note)))
    }
  }

  createNote(text, authorId = this.authorId) {
    const note = {
      id: Math.random().toString(36).substr(2, 9),
      authorId,
      messageText: text,
      createdAt: new Date().toISOString(),
      timestamp: Date.now()
    }
    return note
  }

  async appendNote(text) {
    await this.initialize()
    const note = this.createNote(text)
    await this.core.append(Buffer.from(JSON.stringify(note)))
    this.notifyNotesUpdated()
  }

  async getNotes() {
    await this.initialize()
    const notes = []
    for (let i = 0; i < this.core.length; i++) {
      try {
        const block = await this.core.get(i)
        const note = JSON.parse(block.toString())
        notes.push(note)
      } catch (error) {
        continue
      }
    }
    const sortedNotes = notes.sort((a, b) => a.timestamp - b.timestamp)
    return sortedNotes
  }

  onNotesUpdated(callback) {
    this.onNotesUpdatedCallback = callback
  }

  async notifyNotesUpdated() {
    if (this.onNotesUpdatedCallback) {
      const notes = await this.getNotes()
      this.onNotesUpdatedCallback(notes)
    }
  }

  getCore() {
    const core = this.core
    return core
  }

  async mergeNotes(externalNotes) {
    await this.initialize()
    const existing = await this.getNotes()
    const seen = new Set(existing.map((m) => m.messageText))
    for (const m of externalNotes) {
      if (!m || !m.messageText || seen.has(m.messageText)) continue
      seen.add(m.messageText)
      await this.core.append(Buffer.from(JSON.stringify(m)))
    }
    await this.notifyNotesUpdated()
  }

  async close() {
    if (this.core) {
      await this.core.close()
    }
  }
}
