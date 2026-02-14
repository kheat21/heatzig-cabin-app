'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets } from 'lucide-react'
import { format, addDays } from 'date-fns'

interface WeatherDay {
  date: string
  day: string
  icon: string
  description: string
  high: number
  low: number
  humidity: number
  wind: number
}

export default function WeatherDashboard() {
  const [weather, setWeather] = useState<WeatherDay[]>([])
  const [location, setLocation] = useState('Cabin Location')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const mockWeather: WeatherDay[] = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(new Date(), i)
      const conditions = ['sunny', 'cloudy', 'rain', 'snow']
      const condition = conditions[Math.floor(Math.random() * conditions.length)]
      
      return {
        date: format(date, 'yyyy-MM-dd'),
        day: format(date, 'EEEE'),
        icon: condition,
        description: condition.charAt(0).toUpperCase() + condition.slice(1),
        high: Math.floor(Math.random() * 30) + 50,
        low: Math.floor(Math.random() * 20) + 30,
        humidity: Math.floor(Math.random() * 40) + 40,
        wind: Math.floor(Math.random() * 15) + 5,
      }
    })

    setTimeout(() => {
      setWeather(mockWeather)
      setLoading(false)
    }, 500)
  }, [])

  const getWeatherIcon = (icon: string, size: number = 48) => {
    switch (icon) {
      case 'sunny':
        return <Sun size={size} className="text-yellow-500" />
      case 'cloudy':
        return <Cloud size={size} className="text-gray-500" />
      case 'rain':
        return <CloudRain size={size} className="text-blue-500" />
      case 'snow':
        return <CloudSnow size={size} className="text-blue-300" />
      default:
        return <Cloud size={size} className="text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading weather data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">7-Day Forecast</h2>
        <p className="text-gray-600">{location}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {weather.map((day, index) => (
          <div
            key={day.date}
            className={`border rounded-lg p-4 transition-all hover:shadow-md ${
              index === 0 ? 'bg-blue-50 border-blue-500 border-2' : 'bg-white'
            }`}
          >
            <div className="text-center">
              <h3 className="font-bold text-lg">
                {index === 0 ? 'Today' : day.day}
              </h3>
              <p className="text-sm text-gray-600">{format(new Date(day.date), 'MMM d')}</p>
            </div>

            <div className="flex justify-center my-4">
              {getWeatherIcon(day.icon)}
            </div>

            <p className="text-center text-gray-700 font-medium mb-3">
              {day.description}
            </p>

            <div className="flex justify-center items-center space-x-4 mb-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{day.high}°</p>
                <p className="text-xs text-gray-500">High</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{day.low}°</p>
                <p className="text-xs text-gray-500">Low</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 border-t pt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Droplets size={16} />
                  <span>Humidity</span>
                </div>
                <span className="font-semibold">{day.humidity}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Wind size={16} />
                  <span>Wind</span>
                </div>
                <span className="font-semibold">{day.wind} mph</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="font-bold text-blue-800 mb-2">💡 Planning Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Check weather before your trip to pack appropriately</li>
          <li>• Snow conditions may affect road access</li>
          <li>• Bring extra layers if temperatures drop below 40°F</li>
          <li>• Consider rescheduling if severe weather is predicted</li>
        </ul>
      </div>

      <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
        <p className="text-yellow-800">
          <strong>Note:</strong> This is showing mock weather data. To get real weather:
        </p>
        <ol className="list-decimal ml-5 mt-2 text-yellow-700 space-y-1">
          <li>Sign up for a free API key at <a href="https://openweathermap.org/api" target="_blank" className="underline">OpenWeatherMap</a></li>
          <li>Add your API key to a <code className="bg-yellow-100 px-1 rounded">.env.local</code> file</li>
          <li>Update the component to fetch real data</li>
        </ol>
      </div>
    </div>
  )
}
