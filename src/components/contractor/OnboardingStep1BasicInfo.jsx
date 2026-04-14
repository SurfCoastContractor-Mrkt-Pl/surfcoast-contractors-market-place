import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin } from 'lucide-react';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

function DOBPicker({ value, onChange, error }) {
  const parsed = value ? value.split('-') : ['', '', ''];
  const [year, setYear] = useState(parsed[0] || '');
  const [month, setMonth] = useState(parsed[1] || '');
  const [day, setDay] = useState(parsed[2] || '');

  useEffect(() => {
    if (year && month && day) {
      onChange(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`);
    }
  }, [year, month, day]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const daysInMonth = month && year ? new Date(year, parseInt(month), 0).getDate() : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const selectStyle = {
    background: "rgba(255,255,255,0.12)",
    border: `1.5px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.55)'}`,
    borderRadius: "8px",
    color: "#ffffff",
    padding: "10px 8px",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    colorScheme: "dark",
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <select value={month} onChange={e => setMonth(e.target.value)} style={selectStyle}>
        <option value="">Month</option>
        {MONTHS.map((m, i) => (
          <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>
        ))}
      </select>
      <select value={day} onChange={e => setDay(e.target.value)} style={selectStyle}>
        <option value="">Day</option>
        {days.map(d => (
          <option key={d} value={String(d).padStart(2, '0')}>{d}</option>
        ))}
      </select>
      <select value={year} onChange={e => setYear(e.target.value)} style={selectStyle}>
        <option value="">Year</option>
        {years.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}

export default function OnboardingStep1BasicInfo({
  formData,
  detectionLoading,
  onDetectLocation,
  age,
  isMinor,
}) {
  const { register, formState: { errors }, watch, setValue } = useFormContext();
  const inputStyle = {
    background: "rgba(255,255,255,0.12)",
    border: "1.5px solid rgba(255,255,255,0.55)",
    borderRadius: "8px",
    color: "#ffffff",
    padding: "10px 14px",
    width: "100%",
    fontSize: "14px",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: "6px",
  };

  return (
    <div style={{ background:"rgba(10,22,40,0.65)", backdropFilter:"blur(20px)", border:"1.5px solid rgba(255,255,255,0.18)", borderRadius:"16px", padding:"28px", marginBottom:"16px" }}>
      <h2 style={{ fontSize:"16px", fontWeight:"700", color:"#ffffff", marginBottom:"20px", paddingBottom:"12px", borderBottom:"1px solid rgba(255,255,255,0.15)" }}>Basic Information</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" style={labelStyle}>Full Name *</label>
          <input
            id="name"
            {...register('name')}
            style={{ ...inputStyle, borderColor: errors.name ? '#ef4444' : 'rgba(255,255,255,0.55)' }}
            placeholder="Your full name"
          />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label style={labelStyle}>
            Date of Birth * <span style={{ fontWeight:"400", color:"#94a3b8" }}>(must be 13+)</span>
          </label>
          <DOBPicker
            value={watch('date_of_birth')}
            onChange={(val) => setValue('date_of_birth', val)}
            error={errors.date_of_birth}
          />
          {errors.date_of_birth && <p className="text-xs text-red-400 mt-1">{errors.date_of_birth.message}</p>}
          {isMinor && (
            <p className="text-xs mt-1 font-medium" style={{ color:"#fb923c" }}>⚠ Parental consent required — see later steps</p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" style={labelStyle}>Email *</label>
            <input
              id="email"
              type="email"
              {...register('email')}
              style={{ ...inputStyle, borderColor: errors.email ? '#ef4444' : 'rgba(255,255,255,0.55)' }}
              placeholder="you@email.com"
            />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="phone" style={labelStyle}>Phone</label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              style={inputStyle}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="location" style={labelStyle}>Location *</label>
            <button
              type="button"
              onClick={onDetectLocation}
              disabled={detectionLoading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#fbbf24",
                background: "rgba(251,191,36,0.15)",
                border: "1px solid rgba(251,191,36,0.4)",
                borderRadius: "6px",
                padding: "4px 10px",
                cursor: detectionLoading ? "not-allowed" : "pointer",
                opacity: detectionLoading ? 0.6 : 1,
              }}
            >
              {detectionLoading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <MapPin className="w-3 h-3" />
                  Auto-Detect
                </>
              )}
            </button>
          </div>
          <input
            id="location"
            {...register('location')}
            placeholder="City, State"
            style={{ ...inputStyle, borderColor: errors.location ? '#ef4444' : 'rgba(255,255,255,0.55)' }}
          />
          {errors.location && <p className="text-xs text-red-400 mt-1">{errors.location.message}</p>}
        </div>
      </div>
    </div>
  );
}