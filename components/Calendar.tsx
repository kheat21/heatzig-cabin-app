'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, User, Calendar as CalendarIcon, Users, StickyNote, Edit, Trash2 } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isWithinInterval, parseISO, isAfter, startOfToday, isBefore } from 'date-fns'
import { supabase } from '@/lib/supabase'

interface Trip {
  id: string
  trip_name: string
  family_members: string[]
  start_date: string
  end_date: string
  guest_count: number
  created_by: string
  notes: string
  color: string
}

const FAMILY_MEMBERS = [
  { name: 'Mark', color: '#3B82F6' },
  { name: 'Alex', color: '#8B5CF6' },
  { name: 'Kate', color: '#EC4899' },
  { name: 'Eric', color: '#10B981' },
  { name: 'Bonnie', color: '#F59E0B' },
  { name: 'Phil', color: '#EF4444' },
  { name: 'Brian', color: '#14B8A6' },
  { name: 'Austin', color: '#6366F1' },
  { name: 'Megan', color: '#FBBF24' },
  { name: 'Mimi', color: '#F472B6' },
  { name: 'Lindsay', color: '#A855F7' },
]

const HOLIDAYS = [
  { date: '2026-01-01', name: "New Year's Day" },
  { date: '2026-01-19', name: 'MLK Day' },
  { date: '2026-02-16', name: 'Presidents Day' },
  { date: '2026-05-25', name: 'Memorial Day' },
  { date: '2026-07-04', name: 'Independence Day' },
  { date: '2026-09-07', name: 'Labor Day' },
  { date: '2026-11-26', name: 'Thanksgiving' },
  { date: '2026-12-25', name: 'Christmas' },
  { date: '2027-01-01', name: "New Year's Day" },
  { date: '2027-01-18', name: 'MLK Day' },
  { date: '2027-02-15', name: 'Presidents Day' },
  { date: '2027-05-31', name: 'Memorial Day' },
  { date: '2027-07-04', name: 'Independence Day' },
  { date: '2027-09-06', name: 'Labor Day' },
  { date: '2027-11-25', name: 'Thanksgiving' },
  { date: '2027-12-25', name: 'Christmas' },
]

type ViewMode = '1month' | '2month' | '4month'

interface PositionedTrip {
  trip: Trip
  startCol: number
  endCol: number
  row: number
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('1month')
  const [trips, setTrips] = useState<Trip[]>([])
  const [showTripForm, setShowTripForm] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [formData, setFormData] = useState({
    tripName: '',
    familyMembers: [] as string[],
    startDate: '',
    endDate: '',
    guestCount: 1,
    createdBy: '',
    notes: '',
  })

  // Load trips from Supabase
  useEffect(() => {
    loadTrips()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('trips_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, () => {
        loadTrips()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadTrips = async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error loading trips:', error)
    } else if (data) {
      setTrips(data)
    }
  }

  const getMonthsToShow = () => {
    switch (viewMode) {
      case '1month': return 1
      case '2month': return 2
      case '4month': return 4
      default: return 1
    }
  }

  const nextPeriod = () => {
    setCurrentDate(addMonths(currentDate, getMonthsToShow()))
  }

  const prevPeriod = () => {
    setCurrentDate(subMonths(currentDate, getMonthsToShow()))
  }

  const getTripsForDay = (day: Date) => {
    return trips.filter((trip) => {
      const start = parseISO(trip.start_date)
      const end = parseISO(trip.end_date)
      return isWithinInterval(day, { start, end })
    })
  }

  const getUpcomingTrips = () => {
    const today = startOfToday()
    return trips
      .filter(trip => isAfter(parseISO(trip.end_date), today) || isSameDay(parseISO(trip.end_date), today))
      .sort((a, b) => parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime())
  }

  const getHolidayForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    return HOLIDAYS.find(h => h.date === dateStr)
  }

  const toggleFamilyMember = (member: string) => {
    if (formData.familyMembers.includes(member)) {
      setFormData({
        ...formData,
        familyMembers: formData.familyMembers.filter(m => m !== member)
      })
    } else {
      setFormData({
        ...formData,
        familyMembers: [...formData.familyMembers, member]
      })
    }
  }

  const getMemberColor = (name: string) => {
    return FAMILY_MEMBERS.find(m => m.name === name)?.color || '#6B7280'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const primaryMember = formData.familyMembers[0] || formData.createdBy
    
    if (editingTrip) {
      // Update existing trip
      const { error } = await supabase
        .from('trips')
        .update({
          trip_name: formData.tripName,
          family_members: formData.familyMembers,
          start_date: formData.startDate,
          end_date: formData.endDate,
          guest_count: formData.guestCount,
          created_by: formData.createdBy,
          notes: formData.notes,
          color: getMemberColor(primaryMember),
        })
        .eq('id', editingTrip.id)

      if (error) {
        console.error('Error updating trip:', error)
        alert('Failed to update trip')
      } else {
        setEditingTrip(null)
      }
    } else {
      // Create new trip
      const { error } = await supabase
        .from('trips')
        .insert([{
          trip_name: formData.tripName,
          family_members: formData.familyMembers,
          start_date: formData.startDate,
          end_date: formData.endDate,
          guest_count: formData.guestCount,
          created_by: formData.createdBy,
          notes: formData.notes,
          color: getMemberColor(primaryMember),
        }])

      if (error) {
        console.error('Error creating trip:', error)
        alert('Failed to create trip')
      }
    }
    
    setShowTripForm(false)
    setFormData({
      tripName: '',
      familyMembers: [],
      startDate: '',
      endDate: '',
      guestCount: 1,
      createdBy: '',
      notes: '',
    })
  }

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip)
    setFormData({
      tripName: trip.trip_name,
      familyMembers: trip.family_members,
      startDate: trip.start_date,
      endDate: trip.end_date,
      guestCount: trip.guest_count,
      createdBy: trip.created_by,
      notes: trip.notes,
    })
    setSelectedTrip(null)
    setShowTripForm(true)
  }

  const handleDelete = async (tripId: string) => {
    if (confirm('Are you sure you want to delete this trip?')) {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId)

      if (error) {
        console.error('Error deleting trip:', error)
        alert('Failed to delete trip')
      } else {
        setSelectedTrip(null)
      }
    }
  }

  const handleDayClick = (day: Date) => {
    const dayTrips = getTripsForDay(day)
    if (dayTrips.length > 0) {
      setSelectedTrip(dayTrips[0])
    }
  }

  const calculateTripPositions = (calendarDays: Date[], trips: Trip[]): PositionedTrip[][] => {
    const weeks: PositionedTrip[][] = []
    
    for (let weekStart = 0; weekStart < calendarDays.length; weekStart += 7) {
      const weekDays = calendarDays.slice(weekStart, weekStart + 7)
      const weekTrips: PositionedTrip[] = []
      
      trips.forEach(trip => {
        const tripStart = parseISO(trip.start_date)
        const tripEnd = parseISO(trip.end_date)
        
        const weekStartDate = weekDays[0]
        const weekEndDate = weekDays[6]
        
        if (isWithinInterval(tripStart, { start: weekStartDate, end: weekEndDate }) ||
            isWithinInterval(tripEnd, { start: weekStartDate, end: weekEndDate }) ||
            (isBefore(tripStart, weekStartDate) && isAfter(tripEnd, weekEndDate))) {
          
          let startCol = 0
          let endCol = 6
          
          for (let i = 0; i < weekDays.length; i++) {
            if (isSameDay(weekDays[i], tripStart) || isAfter(weekDays[i], tripStart)) {
              startCol = i
              break
            }
          }
          
          for (let i = weekDays.length - 1; i >= 0; i--) {
            if (isSameDay(weekDays[i], tripEnd) || isBefore(weekDays[i], tripEnd)) {
              endCol = i
              break
            }
          }
          
          weekTrips.push({
            trip,
            startCol,
            endCol,
            row: Math.floor(weekStart / 7)
          })
        }
      })
      
      weeks.push(weekTrips)
    }
    
    return weeks
  }

  const renderMonth = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    
    const tripPositions = calculateTripPositions(calendarDays, trips)

    return (
      <div key={format(monthDate, 'yyyy-MM')} className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-xl font-bold text-center mb-4">{format(monthDate, 'MMMM yyyy')}</h3>
        
        <div className="relative">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-semibold text-gray-600 py-2 text-xs">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const holiday = getHolidayForDay(day)
              const isCurrentMonth = isSameMonth(day, monthDate)
              const isToday = isSameDay(day, new Date())

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-24 p-2 border rounded-lg transition-all cursor-pointer relative ${
                    isCurrentMonth ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-100'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''} hover:shadow-md`}
                >
                  <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                    {format(day, 'd')}
                  </div>
                  {holiday && (
                    <div className="text-xs text-red-600 font-semibold bg-red-50 px-1 py-0.5 rounded truncate">
                      {holiday.name}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          <div className="absolute top-12 left-0 right-0 pointer-events-none" style={{ zIndex: 10 }}>
            {tripPositions.map((weekTrips, weekIdx) => (
              <div key={weekIdx} className="relative" style={{ height: '6.5rem', marginBottom: '0.5rem' }}>
                {weekTrips.map((posTrip, tripIdx) => {
                  const width = ((posTrip.endCol - posTrip.startCol + 1) / 7) * 100
                  const left = (posTrip.startCol / 7) * 100
                  
                  return (
                    <div
                      key={posTrip.trip.id}
                      className="absolute pointer-events-auto cursor-pointer hover:opacity-90 transition"
                      style={{
                        left: `calc(${left}% + ${posTrip.startCol * 0.5}rem)`,
                        width: `calc(${width}% - ${0.5}rem)`,
                        top: `${2.5 + (tripIdx * 1.75)}rem`,
                        backgroundColor: posTrip.trip.color,
                        height: '1.5rem',
                        borderRadius: '0.375rem',
                        padding: '0.25rem 0.5rem',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                      onClick={() => setSelectedTrip(posTrip.trip)}
                    >
                      {posTrip.trip.trip_name || posTrip.trip.family_members.join(', ')}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const upcomingTrips = getUpcomingTrips()
  const gridClass = viewMode === '1month' ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <button onClick={prevPeriod} className="p-2 hover:bg-gray-100 rounded-full transition">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-3xl font-bold text-gray-800">{format(currentDate, 'yyyy')}</h2>
            <button onClick={nextPeriod} className="p-2 hover:bg-gray-100 rounded-full transition">
              <ChevronRight size={24} />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
              <button
                onClick={() => setViewMode('1month')}
                className={`px-4 py-2 rounded font-medium transition ${
                  viewMode === '1month' ? 'bg-white shadow-sm' : 'text-gray-600'
                }`}
              >
                1 Month
              </button>
              <button
                onClick={() => setViewMode('2month')}
                className={`px-4 py-2 rounded font-medium transition ${
                  viewMode === '2month' ? 'bg-white shadow-sm' : 'text-gray-600'
                }`}
              >
                2 Months
              </button>
              <button
                onClick={() => setViewMode('4month')}
                className={`px-4 py-2 rounded font-medium transition ${
                  viewMode === '4month' ? 'bg-white shadow-sm' : 'text-gray-600'
                }`}
              >
                4 Months
              </button>
            </div>
            
            <button
              onClick={() => setShowTripForm(true)}
              className="bg-[#7fa895] hover:bg-[#6d9280] text-white px-6 py-3 rounded-lg font-semibold transition shadow-md w-full sm:w-auto"
            >
              + Plan a Trip
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {FAMILY_MEMBERS.map((member) => (
            <div key={member.name} className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: member.color }}></div>
              <span className="text-sm">{member.name}</span>
            </div>
          ))}
        </div>

        <div className={`grid ${gridClass} gap-6`}>
          {Array.from({ length: getMonthsToShow() }, (_, i) => 
            renderMonth(addMonths(currentDate, i))
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Trips:</h3>
          
          {upcomingTrips.length > 0 ? (
            <div className="space-y-4">
              {upcomingTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="border-l-4 pl-4 py-2 cursor-pointer hover:bg-gray-50 transition rounded-r"
                  style={{ borderLeftColor: trip.color }}
                  onClick={() => setSelectedTrip(trip)}
                >
                  <div className="text-sm font-semibold text-gray-600 mb-1">
                    {format(parseISO(trip.start_date), 'MMM d')} - {format(parseISO(trip.end_date), 'MMM d')}
                  </div>
                  <div className="font-bold text-gray-800 mb-2">
                    {trip.trip_name || 'Cabin Trip'}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {trip.family_members.join(', ')}
                  </div>
                  <div className="text-xs text-gray-500">
                    Total Guests: {trip.guest_count}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No upcoming trips</p>
              <button
                onClick={() => setShowTripForm(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Plan your first trip
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Trip Details</h3>
              <button
                onClick={() => setSelectedTrip(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {selectedTrip.trip_name && (
                <div>
                  <h4 className="text-lg font-bold" style={{ color: selectedTrip.color }}>
                    {selectedTrip.trip_name}
                  </h4>
                </div>
              )}

              <div className="flex items-center space-x-3 text-gray-700">
                <CalendarIcon size={20} className="text-gray-500" />
                <div>
                  <p className="font-semibold">Dates</p>
                  <p>{format(parseISO(selectedTrip.start_date), 'MMM d, yyyy')} - {format(parseISO(selectedTrip.end_date), 'MMM d, yyyy')}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-gray-700">
                <Users size={20} className="text-gray-500" />
                <div>
                  <p className="font-semibold">Attendees</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedTrip.family_members.map(member => (
                      <span key={member} className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: getMemberColor(member) }}>
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-gray-700">
                <Users size={20} className="text-gray-500" />
                <div>
                  <p className="font-semibold">Guest Count</p>
                  <p>{selectedTrip.guest_count} people</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-gray-700">
                <User size={20} className="text-gray-500" />
                <div>
                  <p className="font-semibold">Created By</p>
                  <p>{selectedTrip.created_by}</p>
                </div>
              </div>

              {selectedTrip.notes && (
                <div className="flex items-start space-x-3 text-gray-700">
                  <StickyNote size={20} className="text-gray-500 mt-1" />
                  <div>
                    <p className="font-semibold">Notes</p>
                    <p className="text-gray-600 mt-1">{selectedTrip.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleEdit(selectedTrip)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Edit size={18} />
                Edit Trip
              </button>
              <button
                onClick={() => handleDelete(selectedTrip.id)}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>

            <button
              onClick={() => setSelectedTrip(null)}
              className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showTripForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingTrip ? 'Edit Trip' : 'Plan a Trip'}
              </h3>
              <button
                onClick={() => {
                  setShowTripForm(false)
                  setEditingTrip(null)
                  setFormData({
                    tripName: '',
                    familyMembers: [],
                    startDate: '',
                    endDate: '',
                    guestCount: 1,
                    createdBy: '',
                    notes: '',
                  })
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  TRIP NAME <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.tripName}
                  onChange={(e) => setFormData({ ...formData, tripName: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                  placeholder="e.g., Spring Break, Dad's Birthday"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">ARRIVAL</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">DEPARTURE</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-3">WHO'S GOING</label>
                <div className="flex flex-wrap gap-2">
                  {FAMILY_MEMBERS.map((member) => (
                    <button
                      key={member.name}
                      type="button"
                      onClick={() => toggleFamilyMember(member.name)}
                      className={`px-4 py-2 rounded-full font-medium transition ${
                        formData.familyMembers.includes(member.name)
                          ? 'text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={formData.familyMembers.includes(member.name) ? { backgroundColor: member.color } : {}}
                    >
                      {member.name}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Tap names to add them to this trip</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  GUEST COUNT <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="number"
                  value={formData.guestCount}
                  onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) })}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                  placeholder="Total headcount, e.g. 6"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">CREATED BY</label>
                <select
                  value={formData.createdBy}
                  onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                  required
                >
                  <option value="">Pick your name</option>
                  {FAMILY_MEMBERS.map((member) => (
                    <option key={member.name} value={member.name}>{member.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  NOTES <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                  rows={4}
                  placeholder="Any details for the family..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTripForm(false)
                    setEditingTrip(null)
                    setFormData({
                      tripName: '',
                      familyMembers: [],
                      startDate: '',
                      endDate: '',
                      guestCount: 1,
                      createdBy: '',
                      notes: '',
                    })
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#7fa895] text-white py-3 rounded-lg font-semibold hover:bg-[#6d9280] transition shadow-md"
                >
                  {editingTrip ? 'Save Changes' : 'Create Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
