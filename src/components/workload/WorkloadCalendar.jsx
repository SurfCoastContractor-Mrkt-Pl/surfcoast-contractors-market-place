import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function WorkloadCalendar({ contractor, onSelectDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState({});

  // Fetch all scopes for this contractor
  const { data: scopes = [] } = useQuery({
    queryKey: ['contractorScopes', contractor?.email],
    queryFn: async () => {
      if (!contractor?.email) return [];
      return await base44.entities.ScopeOfWork.filter({
        contractor_email: contractor.email,
      });
    },
    enabled: !!contractor?.email,
  });

  // Build availability map
  useEffect(() => {
    const availMap = {};
    scopes.forEach((scope) => {
      if (scope.agreed_work_date) {
        if (!availMap[scope.agreed_work_date]) {
          availMap[scope.agreed_work_date] = {
            count: 0,
            approved: 0,
          };
        }
        availMap[scope.agreed_work_date].count += 1;
        if (scope.status === 'approved') {
          availMap[scope.agreed_work_date].approved += 1;
        }
      }
    });
    setAvailability(availMap);
  }, [scopes]);

  // Calendar logic
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleSelectDate = (day) => {
    const date = new Date(year, month, day);
    onSelectDate(date);
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const dateStr = (day) => {
    return new Date(year, month, day).toISOString().split('T')[0];
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all"
            >
              <ChevronRight className="w-6 h-6 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Weekday Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-semibold text-slate-600 py-2">
              {day}
            </div>
          ))}

          {/* Days */}
          {days.map((day, idx) => {
            const date = day ? dateStr(day) : null;
            const dayAvail = date ? availability[date] : null;
            const hasJobs = dayAvail && dayAvail.count > 0;
            const allApproved = dayAvail && dayAvail.count === dayAvail.approved;
            const today = isToday(day);

            return (
              <div key={idx} className="aspect-square">
                {day ? (
                  <button
                    onClick={() => handleSelectDate(day)}
                    className={`w-full h-full rounded-lg font-semibold text-sm transition-all flex flex-col items-center justify-center p-2 ${
                      today
                        ? 'bg-blue-600 text-white border-2 border-blue-600'
                        : hasJobs
                        ? allApproved
                          ? 'bg-green-100 text-green-900 border-2 border-green-300 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-900 border-2 border-yellow-300 hover:bg-yellow-200'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{day}</span>
                    {hasJobs && <span className="text-xs mt-1">{dayAvail.count} jobs</span>}
                  </button>
                ) : (
                  <div className="w-full h-full"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-8 border-t border-slate-200 grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-600"></div>
            <span className="text-sm text-slate-600">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300"></div>
            <span className="text-sm text-slate-600">All Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-300"></div>
            <span className="text-sm text-slate-600">Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}