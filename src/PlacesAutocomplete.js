import React, { useEffect, useState } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { loadGoogleMaps, isGoogleMapsLoaded } from './utils/googleMapsLoader';

const PlacesAutocomplete = ({ onSelect }) => {
  const [isLoaded, setIsLoaded] = useState(isGoogleMapsLoaded());

  useEffect(() => {
    if (!isLoaded) {
      loadGoogleMaps().then(() => setIsLoaded(true));
    }
  }, [isLoaded]);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {},
    debounce: 300,
    enabled: isLoaded
  });

  const handleInput = (e) => {
    setValue(e.target.value);
  };

  const handleSelect = ({ description }) => async () => {
    setValue(description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      onSelect({ address: description, lat, lng });
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const renderSuggestions = () =>
    data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text }
      } = suggestion;

      return (
        <li
          key={place_id}
          onClick={handleSelect(suggestion)}
          style={{ cursor: 'pointer', padding: '8px', borderBottom: '1px solid #eee' }}
        >
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </li>
      );
    });

  return (
    <div>
      <input
        value={value}
        onChange={handleInput}
        disabled={!ready}
        placeholder="Enter a location"
        style={{ width: '100%', padding: '8px' }}
      />
      
      {!isLoaded && (
        <div style={{ color: '#999', fontSize: '0.8rem', marginTop: '4px' }}>
          Loading location search...
        </div>
      )}
      
      {status === "OK" && (
        <ul style={{ 
          listStyle: 'none', 
          margin: 0, 
          padding: 0, 
          border: '1px solid #ccc', 
          maxHeight: '200px', 
          overflowY: 'auto',
          position: 'absolute',
          width: 'calc(100% - 2px)',
          zIndex: 1000,
          backgroundColor: 'white'
        }}>
          {renderSuggestions()}
        </ul>
      )}
    </div>
  );
};

export default PlacesAutocomplete;