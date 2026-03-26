import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin } from 'lucide-react';

export default function OnboardingStep1BasicInfo({
  formData,
  dobError,
  detectionLoading,
  onFieldChange,
  onDetectLocation,
  age,
  isMinor,
}) {
  return (
    <div style={{ background:"rgba(10,22,40,0.55)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"16px", padding:"28px", marginBottom:"16px" }}>
      <h2 style={{ fontSize:"16px", fontWeight:"700", color:"#ffffff", marginBottom:"20px", paddingBottom:"12px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>Basic Information</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onFieldChange('name', e.target.value)}
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="dob">Date of Birth * <span className="text-slate-400 font-normal">(must be 13+)</span></Label>
          <Input
            id="dob"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => { onFieldChange('date_of_birth', e.target.value); }}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
            className="mt-1.5"
          />
          {dobError && <p className="text-xs text-red-600 mt-1">{dobError}</p>}
          {isMinor && (
            <p className="text-xs text-orange-600 mt-1 font-medium">⚠ Parental consent required — see later steps</p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onFieldChange('email', e.target.value)}
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => onFieldChange('phone', e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="location">Location *</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDetectLocation}
              disabled={detectionLoading}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              {detectionLoading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <MapPin className="w-3 h-3 mr-1" />
                  Auto-Detect
                </>
              )}
            </Button>
          </div>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => onFieldChange('location', e.target.value)}
            placeholder="City, State"
            required
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  );
}