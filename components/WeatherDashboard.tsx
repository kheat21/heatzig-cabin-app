'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets, CloudDrizzle } from 'lucide-react'
import { format, fromUnixTime } from 'date-fns'

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
  const [location, setLocation] = useState('Promontory Club, Park City')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY
      const lat = process.env.NEXT_PUBLIC_CABIN_LAT
      const lon = process.env.NEXT_PUBLIC_CABIN_LON

      if (!apiKey || !lat || !lon) {
        const mockWeather: WeatherDay[] = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() + i)
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
        setWeather(mockWeather)
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
        )
        
        if (!response.ok) throw new Error('Failed to fetch weather data')

        const data = await response.json()
        setLocation(data.city.name + ', Utah')

        const dailyData: { [key: string]: any[] } = {}
        data.list.forEach((item: any) => {
          const date = format(fromUnixTime(item.dt), 'yyyy-MM-dd')
          if (!dailyData[date]) dailyData[date] = []
          dailyData[date].push(item)
        })

        const forecast: WeatherDay[] = Object.keys(dailyData).slice(0, 7).map((date) => {
          const dayData = dailyData[date]
          const temps = dayData.map((d) => d.main.temp)
          const weatherIcon = dayData[0].weather[0].main.toLowerCase()
          
          return {
            date,
            day: format(new Date(date), 'EEEE'),
            icon: weatherIcon,
            description: dayData[0].weather[0].description,
            high: Math.round(Math.max(...temps)),
            low: Math.round(Math.min(...temps)),
            humidity: dayData[0].main.humidity,
            wind: Math.round(dayData[0].wind.speed),
          }
        })

        setWeather(forecast)
        setLoading(false)
      } catch (err) {
        console.error('Weather fetch error:', err)
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  const getWeatherIcon = (icon: string, size: number = 48) => {
    const iconName = icon.toLowerCase()
    if (iconName.includes('clear') || iconName.includes('sun')) {
      return <Sun size={size} className="text-yellow-500" />
    } else if (iconName.includes('rain')) {
      return <CloudRain size={size} className="text-blue-500" />
    } else if (iconName.includes('drizzle')) {
      return <CloudDrizzle size={size} className="text-blue-400" />
    } else if (iconName.includes('snow')) {
      return <CloudSnow size={size} className="text-blue-300" />
    } else if (iconName.includes('cloud')) {
      return <Cloud size={size} className="text-gray-500" />
    } else {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
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

            <p className="text-center text-gray-700 font-medium mb-3 capitalize text-sm">
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
    </div>
  )
}
