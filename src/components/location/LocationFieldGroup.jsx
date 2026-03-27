import React, { useRef } from 'react';
import AddressAutocompleteInput from './AddressAutocompleteInput';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function LocationFieldGroup({
  address = '',
  city = '',
  state = '',
  zip = '',
  onAddressChange,
  onCityChange,
  onStateChange,
  onZipChange,
  onLocationData,
  showAddress = true,
  required = false,
  className = '',
}) {
  const addressInputRef = useRef(null);

  const handlePlaceSelected = (placeData) => {
    // Auto-populate fields
    if (onAddressChange && placeData.streetAddress) {
      onAddressChange(placeData.streetAddress);
    }
    if (onCityChange && placeData.city) {
      onCityChange(placeData.city);
    }
    if (onStateChange && placeData.state) {
      onStateChange(placeData.state);
    }
    if (onZipChange && placeData.zip) {
      onZipChange(placeData.zip);
    }
    if (onLocationData) {
      onLocationData(placeData);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {showAddress && (
        <AddressAutocompleteInput
          label="Street Address"
          placeholder="123 Main St"
          value={address}
          onChange={onAddressChange}
          onPlaceSelected={handlePlaceSelected}
          required={required}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            City {required && <span className="text-red-500">*</span>}
          </label>
          <Input
            type="text"
            placeholder="San Francisco"
            value={city}
            onChange={(e) => onCityChange?.(e.target.value)}
            required={required}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            State {required && <span className="text-red-500">*</span>}
          </label>
          <Select value={state} onValueChange={onStateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            ZIP Code {required && <span className="text-red-500">*</span>}
          </label>
          <Input
            type="text"
            placeholder="94102"
            value={zip}
            onChange={(e) => onZipChange?.(e.target.value)}
            maxLength="5"
            required={required}
          />
        </div>
      </div>
    </div>
  );
}