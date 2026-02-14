'use client'

import { useState } from 'react'
import Calendar from '@/components/Calendar'
import CabinBoard from '@/components/CabinBoard'
import WeatherDashboard from '@/components/WeatherDashboard'
import { CalendarDays, MessageSquare, Cloud } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'board' | 'weather'>('calendar')

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-gray-800">🏔️ Heatzig Cabin App</h1>
          <p className="text-gray-600 mt-2">Your family cabin management hub</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 mt-6">
        <div className="flex space-x-2 bg-white rounded-lg p-2 shadow-md">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-all ${
              activeTab === 'calendar'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CalendarDays size={20} />
            <span className="font-semibold">Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-all ${
              activeTab === 'board'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MessageSquare size={20} />
            <span className="font-semibold">Cabin Board</span>
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-all ${
              activeTab === 'weather'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Cloud size={20} />
            <span className="font-semibold">Weather</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'calendar' && <Calendar />}
        {activeTab === 'board' && <CabinBoard />}
        {activeTab === 'weather' && <WeatherDashboard />}
      </div>
    </main>
  )
}
