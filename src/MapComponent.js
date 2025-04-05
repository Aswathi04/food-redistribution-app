import React, { useEffect, useRef } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  height: '400px',
  width: '100%',
};

const defaultCenter = {
  lat: -34.397,
  lng: 150.644,
};

const MapComponent = ({ location, setLocation }) => {
  const mapRef = useRef(null);

  const onMapClick = (event) => {
    setLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
  };

  useEffect(() => {
    if (mapRef.current && location) {
      mapRef.current.panTo(location);
    }
  }, [location]);

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={8}
      center={location || defaultCenter}
      onClick={onMapClick}
      onLoad={(map) => (mapRef.current = map)}
    >
      {location && <Marker position={location} />}
    </GoogleMap>
  );
};

export default MapComponent;
