import React, { useRef, useState } from 'react';
import { useGooglePlacesAutocomplete } from '@/hooks/useGooglePlacesAutocomplete';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

export default function AddressAutocompleteInput({
  label = 'Address',
  placeholder = 'Enter address...',
  value = '',
  onChange,
  onPlaceSelected,
  className = '',
  required = false,
}) {
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState(value);

  useGooglePlacesAutocomplete(inputRef, (placeData) => {
    setInputValue(placeData.formattedAddress);
    if (onChange) onChange(placeData.formattedAddress);
    if (onPlaceSelected) onPlaceSelected(placeData);
  });

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) onChange(newValue);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          className="pl-9"
          required={required}
          autoComplete="off"
        />
      </div>
      <p className="text-xs text-slate-500 mt-1">Start typing to see address suggestions</p>
    </div>
  );
}