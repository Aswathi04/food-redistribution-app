import React, { useEffect, useState } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

const PlacesAutocomplete = ({ onSelect }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load the Google Maps script with Places library
  useEffect(() => {
    // Check if script is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    // Using the React environment variable format
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsScriptLoaded(true);
    
    document.head.appendChild(script);
    
    return () => {
      // Clean up script if component unmounts before loading
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Only use Places Autocomplete when script is loaded
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions
  } = usePlacesAutocomplete({
    requestOptions: {},
    debounce: 300,
    enabled: isScriptLoaded // Only enable when script is loaded
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

  if (!isScriptLoaded) {
    return <div>Loading Places API...</div>;
  }

  return (
    <div>
      <input
        value={value}
        onChange={handleInput}
        disabled={!ready}
        placeholder="Enter a location"
        style={{ width: '100%', padding: '8px' }}
      />
      
      {status === "OK" && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, border: '1px solid #ccc', maxHeight: '200px', overflowY: 'auto' }}>
          {renderSuggestions()}
        </ul>
      )}
    </div>
  );
};

export default PlacesAutocomplete;