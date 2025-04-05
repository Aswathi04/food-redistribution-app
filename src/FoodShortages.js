import React, { useState } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { geohashForLocation } from 'geofire-common';
import PlacesAutocomplete from './PlacesAutocomplete';

const FoodShortage = () => {
  const [mealsNeeded, setMealsNeeded] = useState('');
  const [location, setLocation] = useState({ address: '', lat: null, lng: null });
  const [description, setDescription] = useState('');

  const handleSelect = ({ address, lat, lng }) => {
    setLocation({ address, lat, lng });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location.lat || !location.lng) {
      alert('Please select a valid location.');
      return;
    }

    // Generate geohash
    const geohash = geohashForLocation([location.lat, location.lng]);

    try {
      await addDoc(collection(db, 'foodShortages'), {
        mealsNeeded: Number(mealsNeeded),
        location: new GeoPoint(location.lat, location.lng),
        geohash,
        description,
        address: location.address,
        timestamp: serverTimestamp(),
      });
      alert('Food shortage request added successfully.');
      // Reset form fields
      setMealsNeeded('');
      setLocation({ address: '', lat: null, lng: null });
      setDescription('');
      // Redirect to matching page or trigger matching logic here
    } catch (error) {
      console.error('Error adding food shortage request: ', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        placeholder="Number of meals needed"
        value={mealsNeeded}
        onChange={(e) => setMealsNeeded(e.target.value)}
        required
      />
      <PlacesAutocomplete onSelect={handleSelect} />
      <textarea
        placeholder="Description of the need"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <button type="submit">Submit Food Shortage Request</button>
    </form>
  );
};

export default FoodShortage;
