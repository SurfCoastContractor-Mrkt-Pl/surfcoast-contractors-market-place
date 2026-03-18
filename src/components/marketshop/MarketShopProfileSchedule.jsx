import React from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';

export default function MarketShopProfileSchedule({ shop }) {
  const today = new Date().toISOString().split('T')[0];
  const events = (shop.market_events || [])
    .filter(e => e.date && e.date >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (events.length === 0) {
    return (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 sm:p-8 text-center">
        <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">No upcoming appearances scheduled.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 sm:p-8">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Where to Find Us
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event) => (
          <div key={event.id} className="bg-slate-700 rounded-xl p-4 border border-slate-600">
            <p className="font-semibold text-slate-100 mb-3">{event.market_name}</p>
            <div className="space-y-2 text-sm text-slate-300">
              <p>
                <Calendar className="w-4 h-4 inline mr-2 flex-shrink-0" />
                {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              {event.location && (
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{event.location}</span>
                </p>
              )}
              {event.start_time && event.end_time && (
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  {event.start_time} – {event.end_time}
                </p>
              )}
              {event.notes && (
                <p className="text-xs text-slate-400 italic mt-2">{event.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}