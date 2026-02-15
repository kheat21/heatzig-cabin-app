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
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    tripName: '',
    familyMembers: [] as string[],
    startDate: '',
    endDate: '',
    guestCount: 1,
    createdBy: '',
    notes: '',
  })

  useEffect(() => {
    loadTrips()
    
    const channel = supabase
      .channel('trips_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'trips' 
      }, (payload) => {
        console.log('Trip change detected:', payload)
        loadTrips()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadTrips = async () => {
    console.log('Loading trips...')
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('start_date', { ascending: true })
    
    if (error) {
      console.error('Error loading trips:', error)
    } else if (data) {
      console.log('Trips loaded:', data)
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
      .filter(trip => {
        const endDate = parseISO(trip.end_date)
        return isAfter(endDate, today) || isSameDay(endDate, today)
      })
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
    setErrorMessage('')
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (end < start) {
        setErrorMessage('Departure date must be after arrival date')
        return
      }
    }
    
    const primaryMember = formData.familyMembers[0] || formData.createdBy
    
    if (editingTrip) {
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
        setErrorMessage(`Error: ${error.message}`)
      } else {
        setEditingTrip(null)
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
        await loadTrips()
      }
    } else {
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
        setErrorMessage(`Error: ${error.message}`)
      } else {
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
        await loadTrips()
      }
    }
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
        await loadTrips()
      }
    }
  }

  const handleDayClick = (day: Date) => {
    const dayTrips = getTripsForDay(day)
    if (dayTrips.length > 0) {
      setSelectedTrip(dayTrips[0])
    }
  }

  const handleTripClick = (e: React.MouseEvent, trip: Trip) => {
    e.stopPropagation()
    setSelectedTrip(trip)
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
      <div key={format(monthDate, 'yyyy-MM')} className="backdrop-blur-sm bg-white/40 rounded-2xl p-8 shadow-lg">
        <h3 className="text-2xl font-medium text-gray-800 text-center mb-6 tracking-tight">{format(monthDate, 'MMMM yyyy')}</h3>
        
        <div className="relative">
          <div className="grid grid-cols-7 gap-3 mb-3">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-medium text-[#b8a696] py-3 text-xs tracking-wide uppercase">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-3">
            {calendarDays.map((day, idx) => {
              const holiday = getHolidayForDay(day)
              const isCurrentMonth = isSameMonth(day, monthDate)
              const isToday = isSameDay(day, new Date())

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-28 p-4 rounded-2xl transition-all duration-200 cursor-pointer relative ${
                    isCurrentMonth ? 'bg-white shadow-md hover:shadow-lg hover:scale-[1.02]' : 'bg-[#7a8c7e20]'
                  } ${isToday ? 'ring-2 ring-[#7a8c7e] ring-offset-2' : ''}`}
                >
                  <div className={`text-sm font-medium mb-2 ${isToday ? 'text-[#7a8c7e]' : 'text-gray-700'}`}>
                    {format(day, 'd')}
                  </div>
                  {holiday && (
                    <div className="text-xs text-red-700 font-medium bg-red-50/80 backdrop-blur-sm px-2 py-1 rounded-lg truncate">
                      {holiday.name}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          <div className="absolute top-16 left-0 right-0 pointer-events-none" style={{ zIndex: 10 }}>
            {tripPositions.map((weekTrips, weekIdx) => (
              <div key={weekIdx} className="relative" style={{ height: '7.5rem', marginBottom: '0.75rem' }}>
                {weekTrips.map((posTrip, tripIdx) => {
                  const width = ((posTrip.endCol - posTrip.startCol + 1) / 7) * 100
                  const left = (posTrip.startCol / 7) * 100
                  
                  return (
                    <div
                      key={posTrip.trip.id}
                      className="absolute pointer-events-auto cursor-pointer hover:scale-[1.02] transition-all duration-200 backdrop-blur-sm"
                      style={{
                        left: `calc(${left}% + ${posTrip.startCol * 0.75}rem)`,
                        width: `calc(${width}% - ${0.75}rem)`,
                        top: `${3 + (tripIdx * 2)}rem`,
                        background: `linear-gradient(135deg, ${posTrip.trip.color}ee, ${posTrip.trip.color})`,
                        borderLeft: `3px solid ${posTrip.trip.color}`,
                        height: '1.75rem',
                        borderRadius: '1rem',
                        padding: '0.375rem 0.75rem',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      onClick={(e) => handleTripClick(e, posTrip.trip)}
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 backdrop-blur-sm bg-white/60 rounded-2xl shadow-xl p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-6">
          <div className="flex items-center space-x-6">
            <button onClick={prevPeriod} className="p-3 hover:bg-[#7a8c7e20] rounded-full transition-all duration-200">
              <ChevronLeft size={24} className="text-[#7a8c7e]" />
            </button>
            <h2 className="text-3xl font-medium text-gray-800 tracking-tight">{format(currentDate, 'yyyy')}</h2>
            <button onClick={nextPeriod} className="p-3 hover:bg-[#7a8c7e20] rounded-full transition-all duration-200">
              <ChevronRight size={24} className="text-[#7a8c7e]" />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <div className="flex bg-[#7a8c7e20] backdrop-blur-sm rounded-2xl p-1.5 w-full sm:w-auto shadow-sm">
              <button
                onClick={() => setViewMode('1month')}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  viewMode === '1month' ? 'bg-white shadow-md text-[#7a8c7e]' : 'text-[#b8a696] hover:text-[#7a8c7e]'
                }`}
              >
                1 Month
              </button>
              <button
                onClick={() => setViewMode('2month')}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  viewMode === '2month' ? 'bg-white shadow-md text-[#7a8c7e]' : 'text-[#b8a696] hover:text-[#7a8c7e]'
                }`}
              >
                2 Months
              </button>
              <button
                onClick={() => setViewMode('4month')}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  viewMode === '4month' ? 'bg-white shadow-md text-[#7a8c7e]' : 'text-[#b8a696] hover:text-[#7a8c7e]'
                }`}
              >
                4 Months
              </button>
            </div>
            
            <button
              onClick={() => setShowTripForm(true)}
              className="bg-[#7a8c7e] hover:bg-[#6d7a6e] text-white px-8 py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] w-full sm:w-auto tracking-tight"
            >
              + Plan a Trip
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          {FAMILY_MEMBERS.map((member) => (
            <div key={member.name} className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: member.color }}></div>
              <span className="text-sm font-medium text-gray-700">{member.name}</span>
            </div>
          ))}
        </div>

        <div className={`grid ${gridClass} gap-8`}>
          {Array.from({ length: getMonthsToShow() }, (_, i) => 
            renderMonth(addMonths(currentDate, i))
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="backdrop-blur-sm bg-white/60 rounded-2xl shadow-xl p-8 sticky top-6">
          <h3 className="text-2xl font-medium text-gray-800 mb-6 tracking-tight">Upcoming Trips</h3>
          
          {upcomingTrips.length > 0 ? (
            <div className="space-y-4">
              {upcomingTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] shadow-md"
                  style={{ borderLeft: `3px solid ${trip.color}` }}
                  onClick={() => setSelectedTrip(trip)}
                >
                  <div className="text-sm font-medium text-[#b8a696] mb-2 tracking-wide">
                    {format(parseISO(trip.start_date), 'MMM d')} - {format(parseISO(trip.end_date), 'MMM d')}
                  </div>
                  <div className="font-medium text-gray-800 mb-3 text-lg tracking-tight">
                    {trip.trip_name || 'Cabin Trip'}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {trip.family_members.join(', ')}
                  </div>
                  <div className="text-xs text-[#b8a696] font-medium">
                    Total Guests: {trip.guest_count}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon size={48} className="mx-auto mb-4 text-[#b8a696]" />
              <p className="text-sm font-medium">No upcoming trips</p>
              <button
                onClick={() => setShowTripForm(true)}
                className="mt-6 text-[#7a8c7e] hover:text-[#6d7a6e] font-medium text-sm transition-colors"
              >
                Plan your first trip
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trip Details Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#fafaf8] rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-medium text-gray-800 tracking-tight">Trip Details</h3>
              <button
                onClick={() => setSelectedTrip(null)}
                className="p-2 hover:bg-[#7a8c7e20] rounded-full transition-all duration-200"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              {selectedTrip.trip_name && (
                <div>
                  <h4 className="text-2xl font-medium tracking-tight" style={{ color: selectedTrip.color }}>
                    {selectedTrip.trip_name}
                  </h4>
                </div>
              )}

              <div className="flex items-center space-x-4 text-gray-700 bg-white/60 backdrop-blur-sm p-4 rounded-2xl">
                <CalendarIcon size={22} className="text-[#7a8c7e]" />
                <div>
                  <p className="font-medium text-[#b8a696] text-sm mb-1">Dates</p>
                  <p className="font-medium">{format(parseISO(selectedTrip.start_date), 'MMM d, yyyy')} - {format(parseISO(selectedTrip.end_date), 'MMM d, yyyy')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 text-gray-700 bg-white/60 backdrop-blur-sm p-4 rounded-2xl">
                <Users size={22} className="text-[#7a8c7e] mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-[#b8a696] text-sm mb-2">Attendees</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrip.family_members.map(member => (
                      <span key={member} className="px-4 py-2 rounded-full text-sm text-white font-medium shadow-sm" style={{ backgroundColor: getMemberColor(member) }}>
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-gray-700 bg-white/60 backdrop-blur-sm p-4 rounded-2xl">
                <Users size={22} className="text-[#7a8c7e]" />
                <div>
                  <p className="font-medium text-[#b8a696] text-sm mb-1">Guest Count</p>
                  <p className="font-medium">{selectedTrip.guest_count} people</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-gray-700 bg-white/60 backdrop-blur-sm p-4 rounded-2xl">
                <User size={22} className="text-[#7a8c7e]" />
                <div>
                  <p className="font-medium text-[#b8a696] text-sm mb-1">Created By</p>
                  <p className="font-medium">{selectedTrip.created_by}</p>
                </div>
              </div>

              {selectedTrip.notes && (
                <div className="flex items-start space-x-4 text-gray-700 bg-white/60 backdrop-blur-sm p-4 rounded-2xl">
                  <StickyNote size={22} className="text-[#7a8c7e] mt-1" />
                  <div>
                    <p className="font-medium text-[#b8a696] text-sm mb-1">Notes</p>
                    <p className="text-gray-600 font-medium">{selectedTrip.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => handleEdit(selectedTrip)}
                className="flex-1 bg-[#7a8c7e] text-white py-4 rounded-2xl font-medium hover:bg-[#6d7a6e] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Edit size={18} />
                Edit Trip
              </button>
              <button
                onClick={() => handleDelete(selectedTrip.id)}
                className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-medium hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>

            <button
              onClick={() => setSelectedTrip(null)}
              className="w-full mt-4 bg-[#7a8c7e20] text-[#7a8c7e] py-4 rounded-2xl font-medium hover:bg-[#7a8c7e30] transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Trip Form Modal (continues in next part...) */}
      {showTripForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#fafaf8] rounded-3xl p-8 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-medium text-gray-800 tracking-tight">
                {editingTrip ? 'Edit Trip' : 'Plan a Trip'}
              </h3>
              <button
                onClick={() => {
                  setShowTripForm(false)
                  setEditingTrip(null)
                  setErrorMessage('')
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
                className="p-2 hover:bg-[#7a8c7e20] rounded-full transition-all duration-200"
              >
                <X size={24} />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
                <p className="text-sm text-red-800 font-medium">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#b8a696] mb-2 tracking-wide uppercase">
                  Trip Name <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.tripName}
                  onChange={(e) => setFormData({ ...formData, tripName: e.target.value })}
                  className="w-full bg-white/60 backdrop-blur-sm border-2 border-[#7a8c7e20] rounded-2xl px-5 py-3 focus:outline-none focus:border-[#7a8c7e] transition-all duration-200 font-medium"
                  placeholder="e.g., Spring Break, Dad's Birthday"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#b8a696] mb-2 tracking-wide uppercase">
                    Arrival <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-white/60 backdrop-blur-sm border-2 border-[#7a8c7e20] rounded-2xl px-5 py-3 focus:outline-none focus:border-[#7a8c7e] transition-all duration-200 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b8a696] mb-2 tracking-wide uppercase">
                    Departure <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-white/60 backdrop-blur-sm border-2 border-[#7a8c7e20] rounded-2xl px-5 py-3 focus:outline-none focus:border-[#7a8c7e] transition-all duration-200 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b8a696] mb-3 tracking-wide uppercase">Who's Going</label>
                <div className="flex flex-wrap gap-3">
                  {FAMILY_MEMBERS.map((member) => (
                    <button
                      key={member.name}
                      type="button"
                      onClick={() => toggleFamilyMember(member.name)}
                      className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 shadow-sm ${
                        formData.familyMembers.includes(member.name)
                          ? 'text-white shadow-md scale-105'
                          : 'bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md'
                      }`}
                      style={formData.familyMembers.includes(member.name) ? { backgroundColor: member.color } : {}}
                    >
                      {member.name}
                    </button>
                  ))}
                </div>
                {formData.familyMembers.length === 0 && (
                  <p className="text-xs text-[#b8a696] mt-3 font-medium">Tap names to add them to this trip</p>
                )}
                {formData.familyMembers.length > 0 && (
                  <p className="text-xs text-green-600 mt-3 font-medium">✓ {formData.familyMembers.length} {formData.familyMembers.length === 1 ? 'person' : 'people'} selected</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b8a696] mb-2 tracking-wide uppercase">
                  Guest Count <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="number"
                  value={formData.guestCount}
                  onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) })}
                  className="w-full bg-white/60 backdrop-blur-sm border-2 border-[#7a8c7e20] rounded-2xl px-5 py-3 focus:outline-none focus:border-[#7a8c7e] transition-all duration-200 font-medium"
                  placeholder="Total headcount, e.g. 6"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b8a696] mb-2 tracking-wide uppercase">
                  Created By <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.createdBy}
                  onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                  className="w-full bg-white/60 backdrop-blur-sm border-2 border-[#7a8c7e20] rounded-2xl px-5 py-3 focus:outline-none focus:border-[#7a8c7e] transition-all duration-200 font-medium"
                  required
                >
                  <option value="">Pick your name</option>
                  {FAMILY_MEMBERS.map((member) => (
                    <option key={member.name} value={member.name}>{member.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b8a696] mb-2 tracking-wide uppercase">
                  Notes <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white/60 backdrop-blur-sm border-2 border-[#7a8c7e20] rounded-2xl px-5 py-3 focus:outline-none focus:border-[#7a8c7e] transition-all duration-200 font-medium"
                  rows={4}
                  placeholder="Any details for the family..."
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTripForm(false)
                    setEditingTrip(null)
                    setErrorMessage('')
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
                  className="flex-1 bg-[#7a8c7e20] text-[#7a8c7e] py-4 rounded-2xl font-medium hover:bg-[#7a8c7e30] transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#7a8c7e] text-white py-4 rounded-2xl font-medium hover:bg-[#6d7a6e] transition-all duration-200 shadow-lg hover:shadow-xl"
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
