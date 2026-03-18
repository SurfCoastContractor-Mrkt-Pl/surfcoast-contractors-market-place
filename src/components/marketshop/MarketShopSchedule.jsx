import React, { useState } from 'react';
import { Calendar, Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function MarketShopSchedule({ shop, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    market_name: '',
    date: '',
    start_time: '05:00',
    end_time: '14:00',
    location: '',
    city: '',
    state: '',
    notes: '',
  });

  const today = new Date().toISOString().split('T')[0];
  const events = shop.market_events || [];
  
  const upcomingEvents = events.filter(e => e.date && e.date >= today).sort((a, b) => new Date(a.date) - new Date(b.date));
  const pastEvents = events.filter(e => e.date && e.date < today).sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      market_name: '',
      date: '',
      start_time: '05:00',
      end_time: '14:00',
      location: '',
      city: '',
      state: '',
      notes: '',
    });
    setShowForm(true);
  };

  const handleEditClick = (event) => {
    setEditingId(event.id);
    setFormData(event);
    setShowForm(true);
  };

  const handleDeleteClick = async (eventId) => {
    if (!window.confirm('Delete this market appearance?')) return;
    setLoading(true);
    try {
      const updated = events.filter(e => e.id !== eventId);
      await base44.entities.MarketShop.update(shop.id, { market_events: updated });
      onUpdate({ market_events: updated });
    } catch (err) {
      console.error(err);
      alert('Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.market_name || !formData.date || !formData.location) {
      alert('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const newEvent = {
        id: editingId || Date.now().toString(),
        market_name: formData.market_name,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location,
        city: formData.city,
        state: formData.state,
        notes: formData.notes,
      };

      let updated = events.filter(e => e.id !== editingId);
      updated.push(newEvent);

      await base44.entities.MarketShop.update(shop.id, { market_events: updated });
      onUpdate({ market_events: updated });
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const EventCard = ({ event, isPast = false }) => (
    <div className={`p-4 rounded-lg border ${isPast ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-semibold text-slate-800">{event.market_name}</p>
          <p className="text-sm text-slate-600 mt-1">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
          <p className="text-sm text-slate-600">{event.location}</p>
          {(event.city || event.state) && (
            <p className="text-xs text-slate-500">{[event.city, event.state].filter(Boolean).join(', ')}</p>
          )}
          {event.start_time && event.end_time && (
            <p className="text-sm text-slate-600 mt-1">{event.start_time} – {event.end_time}</p>
          )}
          {event.notes && (
            <p className="text-xs text-slate-500 italic mt-2">{event.notes}</p>
          )}
        </div>
        {!isPast && (
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => handleEditClick(event)}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={() => handleDeleteClick(event.id)}
              className="p-2 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-800">Market Schedule</h2>
        </div>
        {!showForm && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Appearance
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Market Name (e.g., Hillcrest Farmers Market)"
              value={formData.market_name}
              onChange={e => setFormData({ ...formData, market_name: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">End Time</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Location / Address"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="State"
              value={formData.state}
              onChange={e => setFormData({ ...formData, state: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <textarea
              placeholder="Notes (optional, e.g., 'Look for the blue tent near the east entrance')"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'Saving...' : 'Save Event'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Upcoming Events */}
      <div className="mb-6">
        {upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-slate-500">No upcoming market appearances yet. Add one to get started!</p>
        )}
      </div>

      {/* Past Events Toggle */}
      {pastEvents.length > 0 && (
        <div>
          <button
            onClick={() => setShowPastEvents(!showPastEvents)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors mb-3"
          >
            {showPastEvents ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Show past events ({pastEvents.length})
          </button>
          {showPastEvents && (
            <div className="space-y-3">
              {pastEvents.map(event => (
                <EventCard key={event.id} event={event} isPast />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}