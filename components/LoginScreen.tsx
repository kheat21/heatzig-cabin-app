'use client'

import { useState } from 'react'
import { LogIn } from 'lucide-react'

interface LoginScreenProps {
  onLogin: () => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'heatzig') {
      onLogin()
      setError(false)
    } else {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Heatzig Cabin Calendar</h1>
          <p className="text-gray-600">Please enter the password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                error 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="Enter password"
              autoFocus
            />
            {error && (
              <p className="text-red-600 text-sm mt-2">Incorrect password. Please try again.</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition shadow-md flex items-center justify-center space-x-2"
          >
            <LogIn size={20} />
            <span>Enter</span>
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Contact a family member if you need access
        </div>
      </div>
    </div>
  )
}
