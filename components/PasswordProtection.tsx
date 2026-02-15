'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import Image from 'next/image'

interface PasswordProtectionProps {
  onAuthenticate: () => void
}

export default function PasswordProtection({ onAuthenticate }: PasswordProtectionProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'heatzig') {
      onAuthenticate()
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/aspen-hero.jpg"
          alt="Park City Mountains"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      </div>

      {/* Login Form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-10 max-w-md w-full shadow-2xl border border-white/20 animate-scale-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/20 mb-6">
              <Lock size={40} className="text-gold" />
            </div>
            <h1 className="font-serif text-4xl font-bold text-white mb-3 tracking-tight">
              Heatzig Cabin
            </h1>
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="h-px w-8 bg-gold"></div>
              <span className="text-gold text-sm tracking-widest uppercase">Private Access</span>
              <div className="h-px w-8 bg-gold"></div>
            </div>
            <p className="text-white/80 text-sm">
              Please enter the password to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2 tracking-wide uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={`w-full bg-white/10 backdrop-blur-sm border-2 ${
                  error ? 'border-red-500' : 'border-white/20'
                } rounded-2xl px-5 py-4 text-white placeholder-white/50 focus:outline-none focus:border-gold transition-all duration-200`}
                autoFocus
              />
              {error && (
                <p className="text-red-400 text-sm mt-2 animate-fade-in">
                  ❌ Incorrect password. Try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full gold-gradient text-white py-4 rounded-2xl font-medium hover:shadow-xl transition-all duration-300 shine-effect transform hover:scale-105"
            >
              Enter Cabin
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
