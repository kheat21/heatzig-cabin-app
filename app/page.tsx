'use client'

import { useState } from 'react'
import Calendar from '@/components/Calendar'
import CabinBoard from '@/components/CabinBoard'
import Weather from '@/components/Weather'
import Concierge from '@/components/Concierge'
import PasswordProtection from '@/components/PasswordProtection'
import Image from 'next/image'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'board' | 'weather' | 'concierge'>('calendar')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <PasswordProtection onAuthenticate={() => setIsAuthenticated(true)} />
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fafaf8] via-[#f5f3f0] to-[#ebe8e3]">
      {/* Hero Section - Fixed Height */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
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
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-[#fafaf8]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <div className="animate-fade-in-up">
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight drop-shadow-2xl">
              Heatzig Cabin
            </h1>
            <div className="flex items-center justify-center space-x-3">
              <div className="h-px w-12 bg-gold"></div>
              <p className="text-gold text-lg md:text-xl font-medium tracking-widest uppercase">
                Park City, Utah
              </p>
              <div className="h-px w-12 bg-gold"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Sticky Tab Navigation */}
        <div className="sticky top-4 z-40 flex justify-center mb-8 animate-fade-in overflow-x-auto">
          <div className="glass rounded-3xl p-2 shadow-2xl inline-flex gap-2 border border-white/20">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 md:px-8 py-3 md:py-4 rounded-2xl font-medium transition-all duration-300 text-sm md:text-base whitespace-nowrap ${
                activeTab === 'calendar'
                  ? 'gold-gradient text-gray-800 shadow-lg scale-105'
                  : 'text-gray-700 hover:text-[#7a8c7e] hover:bg-white/50'
              }`}
            >
              📅 Calendar
            </button>
            <button
              onClick={() => setActiveTab('board')}
              className={`px-4 md:px-8 py-3 md:py-4 rounded-2xl font-medium transition-all duration-300 text-sm md:text-base whitespace-nowrap ${
                activeTab === 'board'
                  ? 'gold-gradient text-gray-800 shadow-lg scale-105'
                  : 'text-gray-700 hover:text-[#7a8c7e] hover:bg-white/50'
              }`}
            >
              💬 Message Board
            </button>
            <button
              onClick={() => setActiveTab('weather')}
              className={`px-4 md:px-8 py-3 md:py-4 rounded-2xl font-medium transition-all duration-300 text-sm md:text-base whitespace-nowrap ${
                activeTab === 'weather'
                  ? 'gold-gradient text-gray-800 shadow-lg scale-105'
                  : 'text-gray-700 hover:text-[#7a8c7e] hover:bg-white/50'
              }`}
            >
              ☀️ Weather
            </button>
            <button
              onClick={() => setActiveTab('concierge')}
              className={`px-4 md:px-8 py-3 md:py-4 rounded-2xl font-medium transition-all duration-300 text-sm md:text-base whitespace-nowrap ${
                activeTab === 'concierge'
                  ? 'gold-gradient text-gray-800 shadow-lg scale-105'
                  : 'text-gray-700 hover:text-[#7a8c7e] hover:bg-white/50'
              }`}
            >
              ✨ Concierge
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-scale-in pb-12">
          {activeTab === 'calendar' && <Calendar />}
          {activeTab === 'board' && <CabinBoard />}
          {activeTab === 'weather' && <Weather />}
          {activeTab === 'concierge' && <Concierge />}
        </div>
      </div>
    </main>
  )
}
