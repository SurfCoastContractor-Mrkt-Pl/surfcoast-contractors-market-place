import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  MapPin, Camera, CheckCircle, LogIn, LogOut, Clock,
  Upload, X, Loader2, Send, Image, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

function CheckInPanel({ scope, onRefresh }) {
  const [loading, setLoading] = useState('');
  const [note, setNote] = useState('');
  const [location, setLocation] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  const isCheckedIn = !!scope.contractor_checkin_time && !scope.contractor_checkout_time;
  const isCheckedOut = !!scope.contractor_checkout_time;

  const getLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { timeout: 8000 }
    );
  };

  const handleAction = async (action) => {
    setLoading(action);
    try {
      await base44.functions.invoke('fieldOpsSiteAction', {
        scope_id: scope.id,
        action,
        location: location || undefined,
        note: note || undefined,
      });
      toast.success(action === 'checkin' ? 'Checked in! Client notified.' : 'Checked out! Client notified.');
      setNote('');
      onRefresh();
    } catch (e) {
      toast.error('Action failed. Try again.');
    }
    setLoading('');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-3">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-blue-500" />
        <span className="text-slate-800 font-semibold text-sm">Site Check-In</span>
        {isCheckedIn && (
          <span className="ml-auto text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
            ● ON SITE
          </span>
        )}
        {isCheckedOut && (
          <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">
            COMPLETED
          </span>
        )}
      </div>

      {/* Timestamps */}
      {scope.contractor_checkin_time && (
        <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          In: {new Date(scope.contractor_checkin_time).toLocaleTimeString()}
          {scope.contractor_checkout_time && (
            <> · Out: {new Date(scope.contractor_checkout_time).toLocaleTimeString()}</>
          )}
        </div>
      )}

      {/* Location capture */}
      {!isCheckedOut && (
        <div className="mb-3">
          <button
            onClick={getLocation}
            disabled={geoLoading}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors"
          >
            {geoLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
            {location ? `📌 ${location}` : 'Capture GPS location (optional)'}
          </button>
        </div>
      )}

      {/* Note for checkout */}
      {isCheckedIn && (
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add a note for the client (optional)..."
          className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-3 mb-3 resize-none border border-slate-300 focus:border-blue-500 focus:outline-none"
          rows={2}
        />
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {!isCheckedIn && !isCheckedOut && (
          <button
            onClick={() => handleAction('checkin')}
            disabled={!!loading}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            {loading === 'checkin' ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            Check In
          </button>
        )}
        {isCheckedIn && (
          <button
            onClick={() => handleAction('checkout')}
            disabled={!!loading}
            className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            {loading === 'checkout' ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Check Out &amp; Notify Client
          </button>
        )}
        {isCheckedOut && (
          <div className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-500 text-sm py-3 rounded-xl">
            <CheckCircle className="w-4 h-4 text-green-500" /> Day Complete
          </div>
        )}
      </div>
    </div>
  );
}

function PhotoUploadPanel({ scope, onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState('');
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [showGallery, setShowGallery] = useState(false);

  const existingPhotos = scope.field_ops_photo_urls || [];

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    const urls = selected.map(f => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const removePreview = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const result = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(result.file_url);
      }
      await base44.functions.invoke('fieldOpsSiteAction', {
        scope_id: scope.id,
        action: 'photo_update',
        photo_urls: uploadedUrls,
        note: note || undefined,
      });
      toast.success(`${uploadedUrls.length} photo(s) uploaded! Client notified.`);
      setFiles([]);
      setPreviews([]);
      setNote('');
      onRefresh();
    } catch (e) {
      toast.error('Upload failed. Please try again.');
    }
    setUploading(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-3">
      <div className="flex items-center gap-2 mb-3">
        <Camera className="w-4 h-4 text-purple-500" />
        <span className="text-slate-800 font-semibold text-sm">Photo Documentation</span>
        {existingPhotos.length > 0 && (
          <button
            onClick={() => setShowGallery(!showGallery)}
            className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            {existingPhotos.length} photo{existingPhotos.length !== 1 ? 's' : ''}
            {showGallery ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Existing photo gallery */}
      {showGallery && existingPhotos.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {existingPhotos.map((url, i) => (
            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-slate-100">
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* New photo previews */}
      {previews.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {previews.map((url, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removePreview(i)}
                className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Note */}
      {files.length > 0 && (
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add a note about these photos (optional)..."
          className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl p-3 mb-3 resize-none border border-slate-300 focus:border-purple-500 focus:outline-none"
          rows={2}
        />
      )}

      <div className="flex gap-2">
        <label className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm py-3 rounded-xl cursor-pointer transition-colors">
          <Image className="w-4 h-4 text-purple-400" />
          {files.length > 0 ? `${files.length} selected` : 'Select Photos'}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>
        {files.length > 0 && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Upload & Notify'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SurfCoastWaveFOView({ contractor, user }) {
  const [activeScopes, setActiveScopes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScope, setSelectedScope] = useState(null);

  const fetchScopes = async () => {
    try {
      const scopes = await base44.entities.ScopeOfWork.filter({
        contractor_email: user.email,
        status: 'approved',
      });
      setActiveScopes(scopes || []);
      // Refresh selected scope if open
      if (selectedScope) {
        const updated = (scopes || []).find(s => s.id === selectedScope.id);
        if (updated) setSelectedScope(updated);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScopes();
  }, [user.email]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (activeScopes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <AlertCircle className="w-12 h-12 text-slate-600 mb-3" />
        <p className="text-slate-400 text-sm font-medium">No active jobs</p>
        <p className="text-slate-600 text-xs mt-1">Approved scopes of work will appear here</p>
      </div>
    );
  }

  // Detail view
  if (selectedScope) {
    return (
      <div className="p-4">
        <button
          onClick={() => setSelectedScope(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm mb-4 transition-colors"
        >
          ← Back to Jobs
        </button>

        <div className="mb-4">
          <h2 className="text-slate-800 font-bold text-base">{selectedScope.job_title}</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Client: {selectedScope.client_name} · {selectedScope.cost_type === 'hourly'
              ? `$${selectedScope.cost_amount}/hr`
              : `$${selectedScope.cost_amount} fixed`}
          </p>
          {selectedScope.agreed_work_date && (
            <p className="text-slate-400 text-xs mt-0.5">
              📅 Work date: {selectedScope.agreed_work_date}
            </p>
          )}
        </div>

        <CheckInPanel scope={selectedScope} onRefresh={fetchScopes} />
        <PhotoUploadPanel scope={selectedScope} onRefresh={fetchScopes} />

        {/* Notification notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
          <Send className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-blue-700 text-xs leading-relaxed">
            Your client is automatically notified by email when you check in, check out, or upload new photos.
          </p>
        </div>
      </div>
    );
  }

  // Job list
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
       <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 rounded-full">
         <span className="text-blue-700 text-[10px] font-bold">🏄 BREAKER</span>
       </div>
       <p className="text-slate-500 text-xs">SurfCoast Waves FO — select a job to check in</p>
      </div>

      <div className="space-y-3">
        {activeScopes.map(scope => {
          const isCheckedIn = !!scope.contractor_checkin_time && !scope.contractor_checkout_time;
          const isCheckedOut = !!scope.contractor_checkout_time;
          const photoCount = scope.field_ops_photo_urls?.length || 0;

          return (
            <button
              key={scope.id}
              onClick={() => setSelectedScope(scope)}
              className="w-full text-left bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-4 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-slate-800 font-semibold text-sm truncate">{scope.job_title}</p>
                  <p className="text-slate-500 text-xs mt-0.5 truncate">{scope.client_name}</p>
                </div>
                <div className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isCheckedIn ? 'bg-green-100 text-green-700' :
                  isCheckedOut ? 'bg-slate-100 text-slate-500' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {isCheckedIn ? '● ON SITE' : isCheckedOut ? 'DONE' : 'NOT STARTED'}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                {scope.agreed_work_date && <span>📅 {scope.agreed_work_date}</span>}
                {photoCount > 0 && <span>📸 {photoCount} photo{photoCount !== 1 ? 's' : ''}</span>}
                {isCheckedIn && scope.contractor_checkin_time && (
                  <span className="text-green-500">
                    In: {new Date(scope.contractor_checkin_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}