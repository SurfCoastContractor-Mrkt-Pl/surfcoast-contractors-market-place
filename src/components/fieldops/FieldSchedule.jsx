import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Clock, MapPin, ChevronRight, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import WaveFOMonthlyCalendar from './WaveFOMonthlyCalendar';
import WaveFOJobDensityChart from './WaveFOJobDensityChart';
import WaveFOStatusSummary from './WaveFOStatusSummary';
import { useLocalCache } from '@/hooks/useMobileOptimization';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getWeekDays(centerDate) {
  const days = [];
  const start = new Date(centerDate);
  start.setDate(start.getDate() - 3);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function WaveFOSchedule({ contractor, user }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scopes, setScopes] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const weekDays = getWeekDays(selectedDate);
  const { data: cachedScopes, set: setCachedScopes } = useLocalCache('wave_fo_schedule', 10);

  useEffect(() => {
    const load = async () => {
      try {
        const [scopeData, slotData] = await Promise.all([
          base44.entities.ScopeOfWork.filter({ contractor_email: user.email }),
          base44.entities.AvailabilitySlot.filter({ contractor_id: contractor.id }),
        ]);
        if (scopeData) {
          setScopes(scopeData);
          setCachedScopes(scopeData);
        } else if (cachedScopes) {
          setScopes(cachedScopes);
        }
        setSlots(slotData || []);
      } catch {
        if (cachedScopes) setScopes(cachedScopes);
      }
      setLoading(false);
    };
    load();
  }, [user.email, contractor.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const dayJobs = scopes.filter(s => s.agreed_work_date === selectedDateStr);
  const daySlots = slots.filter(s => s.date === selectedDateStr);

  const hasJobOnDate = (date) => {
    const str = date.toISOString().split('T')[0];
    return scopes.some(s => s.agreed_work_date === str);
  };

  return (
    <div className="bg-slate-100 min-h-full">
      <div className="px-4 pt-4">
        {/* Monthly Calendar */}
        <WaveFOMonthlyCalendar
          scopes={scopes}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        {/* Job Density Chart */}
        <WaveFOJobDensityChart scopes={scopes} selectedDate={selectedDate} />

        {/* Status Summary */}
        <WaveFOStatusSummary scopes={scopes} />
      </div>

      {/* Week Strip */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
        {weekDays.map((date, i) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();
          const hasJob = hasJobOnDate(date);
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(date)}
              className={`flex-shrink-0 flex flex-col items-center py-3 px-3 rounded-2xl min-w-[52px] transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : isToday
                  ? 'bg-white text-blue-600 border border-blue-200'
                  : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              <span className="text-xs font-medium">{DAYS[date.getDay()]}</span>
              <span className="text-lg font-bold mt-1">{date.getDate()}</span>
              {hasJob && (
                <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Content */}
      <div className="px-4 mt-6 pb-6">
        <p className="text-slate-600 text-sm font-semibold mb-3">
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : dayJobs.length === 0 && daySlots.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No jobs scheduled</p>
            <p className="text-slate-400 text-sm mt-1">This day is open</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayJobs.map(scope => (
              <div key={scope.id} className="bg-white rounded-2xl p-4 border border-slate-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-semibold truncate">{scope.job_title}</p>
                    <p className="text-slate-500 text-sm">{scope.customer_name}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-green-700 font-semibold">
                        ${scope.cost_amount} {scope.cost_type === 'hourly' ? '/hr' : ''}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        scope.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        scope.status === 'closed' ? 'bg-slate-100 text-slate-500' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {scope.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {daySlots.map(slot => (
              <div key={slot.id} className={`rounded-2xl p-4 border ${
                slot.available
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <Clock className={`w-5 h-5 ${slot.available ? 'text-green-600' : 'text-slate-400'}`} />
                  <div>
                    <p className={`font-semibold text-sm ${slot.available ? 'text-green-700' : 'text-slate-600'}`}>
                      {slot.available ? 'Available Window' : 'Blocked Time'}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {new Date(`2000-01-01T${slot.start_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      {' – '}
                      {new Date(`2000-01-01T${slot.end_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}