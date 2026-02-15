'use client'

import { useState, useEffect } from 'react'
import { Plus, MessageCircle, Check, RotateCcw, Trash2, X } from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'

interface Comment {
  id: string
  author: string
  text: string
  date: string
}

interface Post {
  id: string
  author: string
  title: string
  content: string
  status: 'open' | 'done'
  comments: Comment[]
  created_at: string
}

export default function CabinBoard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [showPostForm, setShowPostForm] = useState(false)
  const [formData, setFormData] = useState({
    author: 'Kate',
    title: '',
    content: '',
  })
  const [commentText, setCommentText] = useState('')
  const [commentingOn, setCommentingOn] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadPosts()
    const channel = supabase
      .channel('posts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
        console.log('Post change detected:', payload)
        loadPosts()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadPosts = async () => {
    console.log('Loading posts...')
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error loading posts:', error)
    } else if (data) {
      console.log('Posts loaded:', data)
      // Sort: Open posts first (newest first), then resolved posts (newest first)
      const sortedPosts = data.sort((a, b) => {
        if (a.status === 'open' && b.status === 'done') return -1
        if (a.status === 'done' && b.status === 'open') return 1
        // Same status - sort by created_at descending (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      setPosts(sortedPosts)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    
    const { error } = await supabase
      .from('posts')
      .insert([{
        author: formData.author,
        title: formData.title,
        content: formData.content,
        status: 'open',
        comments: [],
      }])
    if (error) {
      console.error('Error creating post:', error)
      setErrorMessage(`Error: ${error.message}`)
    } else {
      setShowPostForm(false)
      setFormData({ author: 'Kate', title: '', content: '' })
      await loadPosts() // Force reload
    }
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    console.log('Toggling status for post:', id, 'from', currentStatus)
    const newStatus = currentStatus === 'open' ? 'done' : 'open'
    
    const { error } = await supabase
      .from('posts')
      .update({ status: newStatus })
      .eq('id', id)
    
    if (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status: ' + error.message)
    } else {
      console.log('Status updated successfully to:', newStatus)
      await loadPosts() // Force reload
    }
  }

  const addComment = async (postId: string) => {
    if (!commentText.trim()) return
    const post = posts.find(p => p.id === postId)
    if (!post) return
    const newComment: Comment = {
      id: Date.now().toString(),
      author: formData.author,
      text: commentText,
      date: new Date().toISOString().split('T')[0],
    }
    const updatedComments = [...post.comments, newComment]
    const { error } = await supabase
      .from('posts')
      .update({ comments: updatedComments })
      .eq('id', postId)
    if (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment')
    } else {
      setCommentText('')
      setCommentingOn(null)
      await loadPosts() // Force reload
    }
  }

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
    if (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    } else {
      await loadPosts() // Force reload
    }
  }

  const openPosts = posts.filter(p => p.status === 'open')
  const resolvedPosts = posts.filter(p => p.status === 'done')

  return (
    <div className="backdrop-blur-sm bg-white/60 rounded-2xl shadow-xl p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-medium text-gray-800 tracking-tight">Message Board</h2>
        <button
          onClick={() => setShowPostForm(true)}
          className="bg-[#7a8c7e] text-white px-6 py-3 rounded-2xl hover:bg-[#6d7a6e] transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl font-medium"
        >
          <Plus size={20} />
          <span>New Post</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Open Posts Section */}
        {openPosts.length > 0 && (
          <>
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-1 w-1 rounded-full bg-[#7a8c7e]"></div>
              <h3 className="text-sm font-medium text-[#7a8c7e] uppercase tracking-wide">Open ({openPosts.length})</h3>
            </div>
            {openPosts.map((post) => (
              <div
                key={post.id}
                className="backdrop-blur-sm rounded-2xl p-6 transition-all duration-200 shadow-md hover:shadow-lg bg-white/60"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-xl text-gray-800 mb-2 tracking-tight">{post.title}</h3>
                    <p className="text-sm text-[#b8a696] font-medium">
                      by {post.author} on {format(new Date(post.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => toggleStatus(post.id, post.status)}
                      className="flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md bg-[#7a8c7e20] text-[#7a8c7e] hover:bg-[#7a8c7e30]"
                    >
                      <Check size={16} />
                      <span>Mark Resolved</span>
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                    >
                      <Trash2 size={16} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 font-medium">{post.content}</p>

                {post.comments.length > 0 && (
                  <div className="mt-6 space-y-3 bg-[#7a8c7e20] backdrop-blur-sm p-5 rounded-2xl">
                    <h4 className="font-medium text-sm flex items-center space-x-2 text-[#7a8c7e]">
                      <MessageCircle size={16} />
                      <span>Comments ({post.comments.length})</span>
                    </h4>
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border-l-3 shadow-sm" style={{ borderLeftWidth: '3px', borderLeftColor: '#7a8c7e' }}>
                        <p className="text-sm text-gray-800 font-medium mb-2">{comment.text}</p>
                        <p className="text-xs text-[#b8a696] font-medium">
                          {comment.author} • {format(new Date(comment.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {commentingOn === post.id ? (
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 bg-white/60 backdrop-blur-sm border-2 border-[#7a8c7e20] rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-[#7a8c7e] transition-all duration-200 font-medium"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addComment(post.id)
                        }
                      }}
                    />
                    <button
                      onClick={() => addComment(post.id)}
                      className="bg-[#7a8c7e] text-white px-6 py-3 rounded-2xl hover:bg-[#6d7a6e] text-sm font-medium transition-all duration-200 shadow-md"
                    >
                      Post
                    </button>
                    <button
                      onClick={() => {
                        setCommentingOn(null)
                        setCommentText('')
                      }}
                      className="bg-[#7a8c7e20] text-[#7a8c7e] px-6 py-3 rounded-2xl hover:bg-[#7a8c7e30] text-sm font-medium transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setCommentingOn(post.id)}
                    className="mt-4 text-[#7a8c7e] hover:text-[#6d7a6e] text-sm flex items-center space-x-2 font-medium transition-colors"
                  >
                    <MessageCircle size={16} />
                    <span>Add comment</span>
                  </button>
                )}
              </div>
            ))}
          </>
        )}

        {/* Resolved Posts Section */}
        {resolvedPosts.length > 0 && (
          <>
            <div className="flex items-center space-x-3 mb-4 mt-12">
              <div className="h-1 w-1 rounded-full bg-green-600"></div>
              <h3 className="text-sm font-medium text-green-600 uppercase tracking-wide">Resolved ({resolvedPosts.length})</h3>
            </div>
            {resolvedPosts.map((post) => (
              <div
                key={post.id}
                className="backdrop-blur-sm rounded-2xl p-6 transition-all duration-200 shadow-md hover:shadow-lg bg-gray-100/60 opacity-75"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-xl text-gray-600 mb-2 tracking-tight line-through">{post.title}</h3>
                    <p className="text-sm text-gray-500 font-medium">
                      by {post.author} on {format(new Date(post.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => toggleStatus(post.id, post.status)}
                      className="flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md bg-green-100 text-green-700 hover:bg-green-200"
                    >
                      <RotateCcw size={16} />
                      <span>Reopen</span>
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                    >
                      <Trash2 size={16} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 font-medium">{post.content}</p>
                
                <div className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1.5 rounded-full mb-4 font-medium">
                  ✓ Resolved
                </div>

                {post.comments.length > 0 && (
                  <div className="mt-6 space-y-3 bg-gray-200/60 backdrop-blur-sm p-5 rounded-2xl">
                    <h4 className="font-medium text-sm flex items-center space-x-2 text-gray-600">
                      <MessageCircle size={16} />
                      <span>Comments ({post.comments.length})</span>
                    </h4>
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border-l-3 shadow-sm" style={{ borderLeftWidth: '3px', borderLeftColor: '#9ca3af' }}>
                        <p className="text-sm text-gray-700 font-medium mb-2">{comment.text}</p>
                        <p className="text-xs text-gray-500 font-medium">
                          {comment.author} • {format(new Date(comment.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {posts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-4 text-[#b8a696]" />
            <p className="text-sm font-medium">No messages yet</p>
            <button
              onClick={() => setShowPostForm(true)}
              className="mt-6 text-[#7a8c7e] hover:text-[#6d7a6e] font-medium text-sm transition-colors"
            >
              Create the first post
            </button>
          </div>
        )}
      </div>

      {showPostForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#fafaf8] rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-medium text-gray-800 tracking-tight">New Post</h3>
              <button
                onClick={() => {
                  setShowPostForm(false)
                  setFormData({ author: 'Kate', title: '', content: '' })
                  setErrorMessage('')
                }}
                className="p-2 hover:bg-[#7a8c7e20] rounded-full transition-all duration-200"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>
            
            {errorMessage && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4">
                <p className="text-sm text-red-800">{errorMessage}</p>
                <p className="text-xs text-red-600 mt-2">Check your Supabase connection and RLS policies.</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#b8a696] mb-2 tracking-wide uppercase">Your Name</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full bg-white/60 backdrop-blur-sm border-2 border-[#7a8c7e20] rounded-2xl px-5 py-3 focus:outline-none focus:border-[#7a8c7e] transition-all duration-200 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#b8a696] mb-2 tracking-wide uppercase">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white/60 backdrop-blur-sm border-2 border-[#7a8c7e20] rounded-2xl px-5 py-3 focus:outline-none focus:border-[#7a8c7e] transition-all duration-200 font-medium"
                  placeholder="e.g., Low Propane, Groceries Needed"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#b8a696] mb-2 tracking-wide uppercase">Message</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-white/60 backdrop-blur-sm border-2 border-[#7a8c7e20] rounded-2xl px-5 py-3 focus:outline-none focus:border-[#7a8c7e] transition-all duration-200 font-medium"
                  rows={4}
                  placeholder="Describe the update or request..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#7a8c7e] text-white py-4 rounded-2xl hover:bg-[#6d7a6e] transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
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
