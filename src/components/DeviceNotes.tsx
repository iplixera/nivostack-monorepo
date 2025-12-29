'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

type Note = {
  id: string
  content: string
  author: string
  authorId: string
  createdAt: string
}

interface DeviceNotesProps {
  deviceId: string
  token: string
}

export default function DeviceNotes({ deviceId, token }: DeviceNotesProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [addingNote, setAddingNote] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)

  useEffect(() => {
    loadNotes()
  }, [deviceId, token])

  const loadNotes = async () => {
    try {
      setLoading(true)
      const data = await api.devices.getNotes(deviceId, token)
      setNotes(data.notes || [])
    } catch (error) {
      console.error('Failed to load notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    try {
      setAddingNote(true)
      const data = await api.devices.addNote(deviceId, newNote.trim(), token)
      setNotes(data.notes || [])
      setNewNote('')
    } catch (error) {
      console.error('Failed to add note:', error)
      alert('Failed to add note')
    } finally {
      setAddingNote(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return

    try {
      setDeletingNoteId(noteId)
      const data = await api.devices.deleteNote(deviceId, noteId, token)
      setNotes(data.notes || [])
    } catch (error) {
      console.error('Failed to delete note:', error)
      alert('Failed to delete note')
    } finally {
      setDeletingNoteId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="text-gray-400">Loading notes...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <h3 className="text-lg font-semibold text-white mb-4">Device Notes</h3>

      {/* Add Note Form */}
      <div className="mb-6">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note about this device..."
          className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg text-sm border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleAddNote}
            disabled={!newNote.trim() || addingNote}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-750 text-white rounded-lg text-sm font-medium transition-colors border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingNote ? 'Adding...' : 'Add Note'}
          </button>
        </div>
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No notes yet. Add a note to document important information about this device.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-white text-sm whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <span>{note.author}</span>
                    <span>•</span>
                    <span>{formatDate(note.createdAt)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  disabled={deletingNoteId === note.id}
                  className="px-2 py-1 text-gray-400 hover:text-white rounded text-sm transition-colors disabled:opacity-50"
                  title="Delete note"
                >
                  {deletingNoteId === note.id ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

