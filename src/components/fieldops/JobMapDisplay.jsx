import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { MapPin, Navigation, Loader } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Custom marker icons
const jobMarkerIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiMzYjgyZjYiIHJ4PSI0Ii8+PHRleHQgeD0iMTYiIHk9IjIyIiBmb250LXNpemU9IjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+v78hPC90ZXh0Pjwvc3ZnPg==',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const contractorMarkerIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiMxMGI5ODEiIHJ4PSI0Ii8+PHRleHQgeD0iMTYiIHk9IjIyIiBmb250LXNpemU9IjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+v78hPC90ZXh0Pjwvc3ZnPg==',
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iIzEwYjk4MSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iMjAiIHk9IjI2IiBmb250LXNpemU9IjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+YOKWjzwvdGV4dD48L3N2Zz4=',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Component to update map center
const MapCenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

export default function JobMapDisplay({ contractor }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contractorLocation, setContractorLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]); // Default to San Francisco
  const [mapZoom, setMapZoom] = useState(11);
  const mapRef = useRef(null);

  // Fetch contractor's jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { base44 } = await import('@/api/base44Client');
        const scopes = await base44.entities.ScopeOfWork.filter({
          contractor_email: contractor?.email || '',
          status: { $ne: 'closed' }
        });
        setJobs(scopes || []);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [contractor?.email]);

  // Get contractor's current location
  const handleGetLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setContractorLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setMapZoom(13);
          setLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocating(false);
          alert('Unable to get your location. Please check permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setLocating(false);
    }
  };

  // Parse location string to coordinates
  const parseLocation = (locationStr) => {
    if (!locationStr) return null;
    // Check if it's already in lat,lng format
    if (locationStr.includes(',')) {
      const [lat, lng] = locationStr.split(',').map(s => parseFloat(s.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        return [lat, lng];
      }
    }
    // For now, return null if not in coordinate format
    // In production, you'd geocode the address
    return null;
  };

  const jobsWithCoords = jobs
    .map(job => ({
      ...job,
      coords: parseLocation(job.location),
    }))
    .filter(job => job.coords);

  // Calculate bounds if we have jobs
  useEffect(() => {
    if (jobsWithCoords.length > 0 && !contractorLocation) {
      const lats = jobsWithCoords.map(j => j.coords[0]);
      const lngs = jobsWithCoords.map(j => j.coords[1]);
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      setMapCenter([centerLat, centerLng]);
      setMapZoom(12);
    }
  }, [jobsWithCoords]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900">
        <div className="text-center text-slate-300">
          <Loader className="w-8 h-8 mx-auto mb-2 animate-spin" />
          <p className="text-sm">Loading job locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Controls */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center gap-3">
        <button
          onClick={handleGetLocation}
          disabled={locating}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {locating ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          My Location
        </button>
        <div className="flex-1 text-xs text-slate-400">
          {jobsWithCoords.length} job{jobsWithCoords.length !== 1 ? 's' : ''} with location data
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {jobsWithCoords.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-50">
            <div className="text-center text-slate-300">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No job locations available</p>
              <p className="text-xs text-slate-500 mt-1">Jobs need coordinates (lat,lng format)</p>
            </div>
          </div>
        )}

        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* Contractor current location */}
          {contractorLocation && (
            <>
              <Marker position={contractorLocation} icon={contractorMarkerIcon}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-900">Your Location</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {contractorLocation[0].toFixed(4)}, {contractorLocation[1].toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={contractorLocation}
                radius={500}
                pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1 }}
              />
            </>
          )}

          {/* Job locations */}
          {jobsWithCoords.map(job => (
            <Marker key={job.id} position={job.coords} icon={jobMarkerIcon}>
              <Popup>
                <div className="text-sm min-w-[200px]">
                  <p className="font-semibold text-slate-900">{job.job_title}</p>
                  <p className="text-xs text-slate-600 mt-1">{job.customer_name}</p>
                  {job.status && (
                    <p className="text-xs text-slate-500 mt-2">
                      Status: <span className="font-medium capitalize">{job.status}</span>
                    </p>
                  )}
                  {job.cost_amount && (
                    <p className="text-xs text-slate-500 mt-1">
                      Cost: <span className="font-medium">${job.cost_amount}</span>
                    </p>
                  )}
                  {job.agreed_work_date && (
                    <p className="text-xs text-slate-500 mt-1">
                      Date: <span className="font-medium">{job.agreed_work_date}</span>
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          <MapCenter center={mapCenter} />
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-3 text-xs text-slate-400 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-sm" />
          <span>Job Location</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full" />
          <span>Your Location</span>
        </div>
      </div>
    </div>
  );
}