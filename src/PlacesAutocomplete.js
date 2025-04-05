import React, { useEffect, useState } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { loadGoogleMaps } from './utils/googleMapsLoader';

const PlacesAutocomplete = ({ onSelect }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadGoogleMaps()
      .then(() => setIsLoaded(true))
      .catch(err => console.error('Error loading Google Maps:', err));
  }, []);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: ['us'] }, // Restrict to US addresses
    },
    debounce: 300,
    enabled: isLoaded // Only enable when library is loaded
  });

  const handleInput = (e) => {
    setValue(e.target.value);
  };

  const handleSelect = async (description) => {
    setValue(description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      onSelect({ address: description, lat, lng });
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  const renderSuggestions = () =>
    data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion;

      return (
        <li key={place_id} onClick={() => handleSelect(suggestion.description)}>
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </li>
      );
    });

  return (
    <div>
      {!isLoaded ? (
        <div>Loading Places API...</div>
      ) : (
        <>
          <input
            value={value}
            onChange={handleInput}
            disabled={!ready}
            placeholder="Enter an address"
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
          {status === 'OK' && (
            <ul style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              border: '1px solid #ccc',
              borderRadius: '4px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {renderSuggestions()}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default PlacesAutocomplete;
