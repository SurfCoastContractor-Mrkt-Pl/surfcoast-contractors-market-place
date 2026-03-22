import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];

export default function ProjectSchedulingCalendar({ scopeId, contractorEmail, isContractor, onDateSelect }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [scope, setScope] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedulingData();
  }, [scopeId, contractorEmail]);

  const loadSchedulingData = async () => {
    try {
      setLoading(true);
      
      // Fetch scope
      const scopes = await base44.asServiceRole.entities.ScopeOfWork.filter({ id: scopeId });
      if (scopes?.length > 0) setScope(scopes[0]);

      // Fetch availability slots for this contractor/scope
      const slots = await base44.asServiceRole.entities.AvailabilitySlot.filter({
        contractor_email: contractorEmail,
        scope_id: scopeId
      });
      setAvailability(slots || []);

      // Fetch blocked dates
      const blocked = await base44.asServiceRole.entities.RateLimitTracker.filter({
        key: `blocked:${scopeId}:${contractorEmail}`,
        action: 'blocked_date'
      });
      setBlockedDates(blocked || []);
    } catch (error) {
      console.error('Error loading scheduling data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateAvailable = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    return availability.some(slot => slot.date === dateStr && slot.available);
  };

  const isDateBlocked = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    return blockedDates.some(block => block.created_date.startsWith(dateStr));
  };

  const isWithinScopeRange = (day) => {
    if (!scope?.agreed_work_date) return true;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const scopeDate = new Date(scope.agreed_work_date);
    return date >= scopeDate;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date.toISOString().split('T')[0]);
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-600">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-slate-700" />
          <h2 className="text-xl font-bold text-slate-900">Project Schedule</h2>
        </div>
        {scope?.agreed_work_date && (
          <Badge variant="outline" className="text-xs">
            Work date: {new Date(scope.agreed_work_date).toLocaleDateString()}
          </Badge>
        )}
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h3 className="text-lg font-semibold text-slate-900">
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-slate-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const isAvailable = isDateAvailable(day);
            const isBlocked = isDateBlocked(day);
            const inRange = isWithinScopeRange(day);
            const isSelected = selectedDate?.getDate() === day && 
                             selectedDate?.getMonth() === currentDate.getMonth();

            return (
              <button
                key={day}
                onClick={() => inRange && !isBlocked && handleDateClick(day)}
                disabled={isBlocked || !inRange}
                className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                  isBlocked
                    ? 'bg-red-100 text-red-700 cursor-not-allowed'
                    : !inRange
                    ? 'bg-slate-50 text-slate-400 cursor-not-allowed'
                    : isAvailable
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded" />
          <span className="text-slate-700">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-100 rounded" />
          <span className="text-slate-700">Unavailable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 rounded" />
          <span className="text-slate-700">Blocked</span>
        </div>
      </div>

      {selectedDate && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-900">
            Selected: {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      )}
    </div>
  );
}