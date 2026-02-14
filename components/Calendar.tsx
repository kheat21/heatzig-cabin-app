'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Edit2, Trash2 } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns'

interface Trip {
  id: string
  familyMember: string
  startDate: string
  endDate: string
  attendees: string
  guestCount: number
  notes: string
  color: string
}

const FAMILY_MEMBERS = [
  { name: 'John', color: 'bg-blue-500' },
  { name: 'Sarah', color: 'bg-purple-500' },
  { name: 'Mike', color: 'bg-green-500' },
  { name: 'Emily', color: 'bg-pink-500' },
  { name: 'David', color: 'bg-orange-500' },
]

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: '1',
      familyMember: 'John',
      startDate: '2026-02-20',
      endDate: '2026-02-23',
      attendees: 'John, Sarah',
      guestCount: 2,
      notes: 'Weekend getaway',
      color: 'bg-blue-500',
    },
  ])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showTripForm, setShowTripForm] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [formData, setFormData] = useState({
    familyMember: 'John',
    startDate: '',
    endDate: '',
    attendees: '',
    guestCount: 1,
    notes: '',
  })

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const getTripsForDay = (day: Date) => {
    return trips.filter((trip) => {
      const start = parseISO(trip.startDate)
      const end = parseISO(trip.endDate)
      return isWithinInterval(day, { start, end })
    })
  }

  const getCurrentGuests = () => {
    const today = new Date()
    return trips.filter((trip) => {
      const start = parseISO(trip.startDate)
      const end = parseISO(trip.endDate)
      return isWithinInterval(today, { start, end })
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const member = FAMILY_MEMBERS.find((m) => m.name === formData.familyMember)
    
    if (editingTrip) {
      setTrips(trips.map((t) => 
        t.id === editingTrip.id 
          ? { ...t, ...formData, color: member?.color || 'bg-blue-500' }
          : t
      ))
      setEditingTrip(null)
    } else {
      const newTrip: Trip = {
        id: Date.now().toString(),
        ...formData,
        color: member?.color || 'bg-blue-500',
      }
      setTrips([...trips, newTrip])
    }
    
    setShowTripForm(false)
    setFormData({
      familyMember: 'John',
      startDate: '',
      endDate: '',
      attendees: '',
      guestCount: 1,
      notes: '',
    })
  }

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip)
    setFormData({
      familyMember: trip.familyMember,
      startDate: trip.startDate,
      endDate: trip.endDate,
      attendees: trip.attendees,
      guestCount: trip.guestCount,
      notes: trip.notes,
    })
    setShowTripForm(true)
  }

  const handleDelete = (id: string) => {
    setTrips(trips.filter((t) => t.id !== id))
  }

  const currentGuests = getCurrentGuests()

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {currentGuests.length > 0 && (
        <div className="mb-6 bg-green-100 border-l-4 border-green-500 p-4 rounded">
          <h3 className="font-bold text-green-800">🏠 Currently at the Cabin</h3>
          <div className="mt-2">
            {currentGuests.map((trip) => (
              <div key={trip.id} className="text-green-700">
                {trip.attendees} ({format(parseISO(trip.startDate), 'MMM d')} - {format(parseISO(trip.endDate), 'MMM d')})
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {FAMILY_MEMBERS.map((member) => (
          <div key={member.name} className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded ${member.color}`}></div>
            <span className="text-sm">{member.name}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
        {calendarDays.map((day, idx) => {
          const dayTrips = getTripsForDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isToday = isSameDay(day, new Date())

          return (
            <div
              key={idx}
              onClick={() => setSelectedDate(day)}
              className={`min-h-24 p-2 border rounded-lg cursor-pointer transition-all ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${isToday ? 'ring-2 ring-blue-500' : ''} hover:shadow-md`}
            >
              <div className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                {format(day, 'd')}
              </div>
              <div className="mt-1 space-y-1">
                {dayTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className={`${trip.color} text-white text-xs px-1 py-0.5 rounded truncate`}
                  >
                    {trip.familyMember}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{format(selectedDate, 'MMMM d, yyyy')}</h3>
              <button onClick={() => setSelectedDate(null)} className="p-1 hover:bg-gray-100 rounded">
                <X size={24} />
              </button>
            </div>
            {getTripsForDay(selectedDate).length > 0 ? (
              <div className="space-y-4">
                {getTripsForDay(selectedDate).map((trip) => (
                  <div key={trip.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg">{trip.familyMember}'s Trip</h4>
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(trip)} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(trip.id)} className="text-red-600 hover:bg-red-50 p-1 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(trip.startDate), 'MMM d')} - {format(parseISO(trip.endDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm mt-2"><strong>Attendees:</strong> {trip.attendees}</p>
                    <p className="text-sm"><strong>Guests:</strong> {trip.guestCount}</p>
                    {trip.notes && <p className="text-sm mt-2"><strong>Notes:</strong> {trip.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No trips scheduled for this day</p>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setShowTripForm(true)}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
      >
        <Plus size={20} />
        <span>Plan a Trip</span>
      </button>

      {showTripForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingTrip ? 'Edit Trip' : 'Plan a Trip'}</h3>
              <button onClick={() => {
                setShowTripForm(false)
                setEditingTrip(null)
                setFormData({
                  familyMember: 'John',
                  startDate: '',
                  endDate: '',
                  attendees: '',
                  guestCount: 1,
                  notes: '',
                })
              }} className="p-1 hover:bg-gray-100 rounded">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Family Member</label>
                <select
                  value={formData.familyMember}
                  onChange={(e) => setFormData({ ...formData, familyMember: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  {FAMILY_MEMBERS.map((member) => (
                    <option key={member.name} value={member.name}>{member.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Attendees</label>
                <input
                  type="text"
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="John, Sarah, Kids"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Guest Count</label>
                <input
                  type="number"
                  value={formData.guestCount}
                  onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Any additional information..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingTrip ? 'Update Trip' : 'Create Trip'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
