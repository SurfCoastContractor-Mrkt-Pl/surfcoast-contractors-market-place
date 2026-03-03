import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';

export default function AvailabilityCalendar({ slots }) {
  const [expandedDate, setExpandedDate] = useState(null);

  if (!slots || slots.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Availability
        </h2>
        <p className="text-slate-500 text-sm">No availability scheduled yet</p>
      </Card>
    );
  }

  // Group slots by date
  const slotsByDate = {};
  slots.forEach(slot => {
    if (!slotsByDate[slot.date]) {
      slotsByDate[slot.date] = [];
    }
    slotsByDate[slot.date].push(slot);
  });

  const sortedDates = Object.keys(slotsByDate).sort();

  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Availability
      </h2>
      <div className="space-y-3">
        {sortedDates.map(date => {
          const daySlots = slotsByDate[date].sort((a, b) => a.start_time.localeCompare(b.start_time));
          const isExpanded = expandedDate === date;

          return (
            <div key={date} className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedDate(isExpanded ? null : date)}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3 text-left">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900">{getDateLabel(date)}</div>
                    <div className="text-xs text-slate-500">{daySlots.length} time slots</div>
                  </div>
                </div>
                <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {isExpanded && (
                <div className="p-3 space-y-2 bg-white">
                  {daySlots.map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-700">
                          {slot.start_time} - {slot.end_time}
                        </span>
                      </div>
                      {slot.available ? (
                        <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Available
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Booked</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}