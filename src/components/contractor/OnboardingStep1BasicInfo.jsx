import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin } from 'lucide-react';

export default function OnboardingStep1BasicInfo({
  formData,
  detectionLoading,
  onDetectLocation,
  age,
  isMinor,
}) {
  const { register, formState: { errors }, watch } = useFormContext();
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
          <label htmlFor="dob" style={labelStyle}>
            Date of Birth * <span style={{ fontWeight:"400", color:"#94a3b8" }}>(must be 13+)</span>
          </label>
          <input
            id="dob"
            type="date"
            {...register('date_of_birth')}
            style={{ ...inputStyle, colorScheme: "dark", borderColor: errors.date_of_birth ? '#ef4444' : 'rgba(255,255,255,0.55)' }}
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