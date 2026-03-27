import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WaveFOMonthlyCalendar({ scopes, selectedDate, onDateSelect }) {
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const calendarDays = [];
  const tempDate = new Date(startDate);
  while (tempDate <= lastDay || tempDate.getDay() !== 0) {
    calendarDays.push(new Date(tempDate));
    tempDate.setDate(tempDate.getDate() + 1);
  }

  const hasJobOnDate = (date) => {
    const str = date.toISOString().split('T')[0];
    return scopes.some(s => s.agreed_work_date === str);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateSelect(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateSelect(newDate);
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 mb-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold">{MONTHS[currentMonth]} {currentYear}</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(day => (
          <div key={day} className="text-center text-slate-500 text-xs font-semibold py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, i) => {
          const isCurrentMonth = date.getMonth() === currentMonth;
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();
          const hasJob = hasJobOnDate(date);

          return (
            <button
              key={i}
              onClick={() => onDateSelect(date)}
              className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all relative ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : isToday
                  ? 'bg-slate-800 text-blue-400 ring-2 ring-blue-500/50'
                  : isCurrentMonth
                  ? 'text-slate-200 hover:bg-slate-800'
                  : 'text-slate-600'
              }`}
            >
              {date.getDate()}
              {hasJob && (
                <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                  isSelected ? 'bg-white' : 'bg-blue-400'
                }`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}