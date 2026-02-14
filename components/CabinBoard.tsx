'use client'

import { useState } from 'react'
import { Plus, MessageCircle, Check, RotateCcw, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface Comment {
  id: string
  author: string
  text: string
  date: string
}

interface Post {
  id: string
  author: string
  date: string
  title: string
  content: string
  status: 'open' | 'done'
  comments: Comment[]
}

export default function CabinBoard() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'Mark',
      date: '2026-02-10',
      title: 'Low Propane',
      content: 'Propane tank is getting low. Need to schedule a refill soon.',
      status: 'open',
      comments: [
        {
          id: 'c1',
          author: 'Kate',
          text: 'I can call the propane company tomorrow.',
          date: '2026-02-11',
        },
      ],
    },
    {
      id: '2',
      author: 'Mimi',
      date: '2026-02-12',
      title: 'Groceries Needed',
      content: 'Please pick up: coffee, sugar, toilet paper, and paper towels.',
      status: 'done',
      comments: [],
    },
  ])
  const [showPostForm, setShowPostForm] = useState(false)
  const [formData, setFormData] = useState({
    author: 'Mark',
    title: '',
    content: '',
  })
  const [commentText, setCommentText] = useState('')
  const [commentingOn, setCommentingOn] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newPost: Post = {
      id: Date.now().toString(),
      ...formData,
      date: new Date().toISOString().split('T')[0],
      status: 'open',
      comments: [],
    }
    setPosts([newPost, ...posts])
    setShowPostForm(false)
    setFormData({ author: 'Mark', title: '', content: '' })
  }

  const toggleStatus = (id: string) => {
    setPosts(posts.map((post) => 
      post.id === id 
        ? { ...post, status: post.status === 'open' ? 'done' : 'open' }
        : post
    ))
  }

  const addComment = (postId: string) => {
    if (!commentText.trim()) return
    
    const newComment: Comment = {
      id: Date.now().toString(),
      author: formData.author,
      text: commentText,
      date: new Date().toISOString().split('T')[0],
    }
    
    setPosts(posts.map((post) => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, newComment] }
        : post
    ))
    
    setCommentText('')
    setCommentingOn(null)
  }

  const deletePost = (id: string) => {
    setPosts(posts.filter((post) => post.id !== id))
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Message Board</h2>
        <button
          onClick={() => setShowPostForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>New Post</span>
        </button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className={`border rounded-lg p-4 transition-all ${
              post.status === 'done' ? 'opacity-50 bg-gray-50' : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{post.title}</h3>
                <p className="text-sm text-gray-600">
                  by {post.author} on {format(new Date(post.date), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleStatus(post.id)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    post.status === 'done'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {post.status === 'done' ? (
                    <>
                      <RotateCcw size={16} />
                      <span>Reopen</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Resolved</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  <Trash2 size={16} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
            
            <p className="text-gray-700 mb-3">{post.content}</p>
            
            {post.status === 'done' && (
              <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-3">
                ✓ Resolved
              </div>
            )}

            {post.comments.length > 0 && (
              <div className="mt-4 space-y-2 bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold text-sm flex items-center space-x-1">
                  <MessageCircle size={16} />
                  <span>Comments ({post.comments.length})</span>
                </h4>
                {post.comments.map((comment) => (
                  <div key={comment.id} className="bg-white p-2 rounded border-l-2 border-blue-500">
                    <p className="text-sm text-gray-800">{comment.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {comment.author} • {format(new Date(comment.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {commentingOn === post.id ? (
              <div className="mt-3 flex space-x-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addComment(post.id)
                    }
                  }}
                />
                <button
                  onClick={() => addComment(post.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  Post
                </button>
                <button
                  onClick={() => {
                    setCommentingOn(null)
                    setCommentText('')
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCommentingOn(post.id)}
                className="mt-3 text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
              >
                <MessageCircle size={16} />
                <span>Add comment</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">New Post</h3>
              <button
                onClick={() => {
                  setShowPostForm(false)
                  setFormData({ author: 'Mark', title: '', content: '' })
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Trash2 size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Your Name</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., Low Propane, Groceries Needed"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Message</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={4}
                  placeholder="Describe the update or request..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Post
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
