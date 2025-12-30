'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface LocalizationCommentsProps {
  translationId: string
  projectId: string
  token: string
  onClose: () => void
}

interface Comment {
  id: string
  content: string
  userId: string | null
  userName: string | null
  isResolved: boolean
  resolvedBy: string | null
  resolvedAt: string | null
  createdAt: string
}

export default function LocalizationComments({
  translationId,
  projectId,
  token,
  onClose
}: LocalizationCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadComments()
  }, [])

  const loadComments = async () => {
    try {
      setLoading(true)
      const data = await api.localization.getComments(translationId, projectId, token)
      setComments(data.comments)
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      setSaving(true)
      const data = await api.localization.createComment(translationId, projectId, newComment, token)
      setComments([data.comment, ...comments])
      setNewComment('')
    } catch (error) {
      alert('Failed to add comment: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const handleToggleResolve = async (commentId: string, isResolved: boolean) => {
    try {
      const data = await api.localization.updateComment(commentId, !isResolved, token)
      setComments(comments.map(c => c.id === commentId ? { ...c, isResolved: data.comment.isResolved } : c))
    } catch (error) {
      alert('Failed to update comment: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await api.localization.deleteComment(commentId, token)
      setComments(comments.filter(c => c.id !== commentId))
    } catch (error) {
      alert('Failed to delete comment: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Comments</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No comments yet</p>
            </div>
          ) : (
            comments.map(comment => (
              <div
                key={comment.id}
                className={`bg-gray-800 rounded-lg p-4 border ${
                  comment.isResolved ? 'border-gray-700 opacity-75' : 'border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">
                      {comment.userName || 'Anonymous'}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                    {comment.isResolved && (
                      <span className="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded">
                        Resolved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleResolve(comment.id, comment.isResolved)}
                      className={`text-xs px-2 py-1 rounded ${
                        comment.isResolved
                          ? 'text-yellow-400 hover:text-yellow-300'
                          : 'text-green-400 hover:text-green-300'
                      }`}
                    >
                      {comment.isResolved ? 'Unresolve' : 'Resolve'}
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-gray-800">
          <div className="flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
            >
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

