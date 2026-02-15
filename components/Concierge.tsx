'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Sparkles, AlertCircle } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Concierge() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Good day! I'm delighted to assist you during your stay at Promontory Club. As your personal concierge, I'm here to ensure your experience in this exclusive mountain enclave is nothing short of extraordinary.\n\nWhether you seek recommendations for fine dining, outdoor pursuits, or local insights about Promontory and the greater Park City area, I'm at your service. How may I assist you today?"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)
    setApiError(false)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }]
        })
      })

      const data = await response.json()

      if (data.error) {
        setApiError(true)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "My sincerest apologies, but our AI concierge service is momentarily unavailable. In the interim, I recommend these distinguished resources:\n\n• Promontory Club: promontoryclub.com\n• Park City Chamber: visitparkcity.com\n• Deer Valley Resort: deervalley.com\n• Local Provisions: Whole Foods Market (Kimball Junction)"
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message
        }])
      }
    } catch (error) {
      console.error('Chat error:', error)
      setApiError(true)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "My sincerest apologies, but our AI concierge service is momentarily unavailable. In the interim, I recommend these distinguished resources:\n\n• Promontory Club: promontoryclub.com\n• Park City Chamber: visitparkcity.com\n• Deer Valley Resort: deervalley.com\n• Local Provisions: Whole Foods Market (Kimball Junction)"
      }])
    } finally {
      setLoading(false)
    }
  }

  const suggestedQuestions = [
    "When is the best time of year to go if I want to go hiking?",
    "What is a grocery store closest to Promontory?",
    "What is the closest mountain to Promontory?",
    "What are the best restaurants?"
  ]

  return (
    <div className="backdrop-blur-sm bg-white/60 rounded-2xl shadow-xl p-6 md:p-8 h-[calc(100vh-250px)] flex flex-col">
      {/* Header */}
      <div className="text-center mb-6 pb-6 border-b border-[#7a8c7e]/20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/20 mb-4">
          <Sparkles size={32} className="text-gold" />
        </div>
        <h2 className="text-3xl font-medium text-gray-800 mb-2 tracking-tight">Concierge</h2>
        <p className="text-[#b8a696] font-medium">Your Park City Assistant</p>
        
        {apiError && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2">
            <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800 text-left">
              <strong>Service Note:</strong> AI assistant needs API credits. Using fallback information.
            </p>
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-6 space-y-4 px-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 shadow-md ${
                message.role === 'user'
                  ? 'bg-[#7a8c7e] text-white'
                  : 'bg-white/80 backdrop-blur-sm text-gray-800 border border-[#7a8c7e]/10'
              }`}
            >
              <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-md border border-[#7a8c7e]/10">
              <div className="flex items-center space-x-2">
                <Loader2 size={18} className="animate-spin text-[#7a8c7e]" />
                <span className="text-[#b8a696] text-sm">Researching your request...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => setInput(question)}
              className="text-xs md:text-sm bg-white/60 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full hover:bg-[#7a8c7e20] transition-all duration-200 border border-[#7a8c7e]/10 hover:border-[#7a8c7e]/30"
            >
              {question}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Inquire about dining, activities, or local recommendations..."
          className="flex-1 bg-white/60 backdrop-blur-sm border-2 border-[#7a8c7e]/20 rounded-2xl px-5 py-3 md:py-4 focus:outline-none focus:border-[#7a8c7e] transition-all duration-200 font-medium text-sm md:text-base"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-[#7a8c7e] text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl hover:bg-[#6d7a6e] transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
    </div>
  )
}
