import { useEffect, useRef } from 'react';

export const useGooglePlacesAutocomplete = (inputRef, onPlaceSelected) => {
  const autocompleteRef = useRef(null);

  useEffect(() => {
    // Check if Google Maps API is loaded
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn('Google Places API not loaded');
      return;
    }

    if (!inputRef.current) return;

    // Initialize autocomplete
    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        componentRestrictions: { country: 'us' },
        types: ['geocode'],
      }
    );

    // Listen for place selection
    const placeChangedListener = autocompleteRef.current.addListener(
      'place_changed',
      () => {
        const place = autocompleteRef.current.getPlace();

        if (!place.geometry) {
          console.log('No geometry data for selected place');
          return;
        }

        // Extract address components
        const addressComponents = {};
        place.address_components?.forEach((component) => {
          const componentType = component.types[0];
          const shortName = component.short_name;
          const longName = component.long_name;

          if (componentType === 'street_number') {
            addressComponents.streetNumber = shortName;
          } else if (componentType === 'route') {
            addressComponents.route = longName;
          } else if (componentType === 'locality') {
            addressComponents.city = longName;
          } else if (componentType === 'administrative_area_level_1') {
            addressComponents.state = shortName;
          } else if (componentType === 'postal_code') {
            addressComponents.zip = shortName;
          } else if (componentType === 'country') {
            addressComponents.country = shortName;
          }
        });

        // Construct full address
        const streetAddress = addressComponents.streetNumber
          ? `${addressComponents.streetNumber} ${addressComponents.route}`
          : addressComponents.route || '';

        const placeData = {
          streetAddress: streetAddress.trim(),
          city: addressComponents.city || '',
          state: addressComponents.state || '',
          zip: addressComponents.zip || '',
          country: addressComponents.country || 'US',
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          formattedAddress: place.formatted_address,
        };

        onPlaceSelected(placeData);
      }
    );

    return () => {
      if (placeChangedListener) {
        window.google.maps.event.removeListener(placeChangedListener);
      }
    };
  }, [inputRef, onPlaceSelected]);

  return autocompleteRef;
};