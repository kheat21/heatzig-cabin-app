'use client'

import { useState, useEffect } from 'react'
import Calendar from '@/components/Calendar'
import CabinBoard from '@/components/CabinBoard'
import WeatherDashboard from '@/components/WeatherDashboard'
import LoginScreen from '@/components/LoginScreen'
import { CalendarDays, MessageSquare, Cloud, LogOut } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'board' | 'weather'>('calendar')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const loggedIn = localStorage.getItem('heatzig_logged_in')
    if (loggedIn === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    localStorage.setItem('heatzig_logged_in', 'true')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('heatzig_logged_in')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Heatzig Cabin Calendar</h1>
              <p className="text-gray-600 mt-2">Making it easy!</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-gray-700"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

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
            <span className="font-semibold">Message Board</span>
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

      <div className="container mx-auto px-4 py-6">
        {activeTab === 'calendar' && <Calendar />}
        {activeTab === 'board' && <CabinBoard />}
        {activeTab === 'weather' && <WeatherDashboard />}
      </div>
    </main>
  )
}
