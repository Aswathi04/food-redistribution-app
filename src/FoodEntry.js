import React, { useState } from 'react';
import { auth, db, googleProvider } from './firebaseConfig';

 // Ensure Firebase is initialized in this file
import { collection, addDoc, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { geohashForLocation } from 'geofire-common';
import PlacesAutocomplete from './PlacesAutocomplete';

const FoodEntry = () => {
  const [mealsAvailable, setMealsAvailable] = useState('');
  const [location, setLocation] = useState({ address: '', lat: null, lng: null });

  const [description, setDescription] = useState('');

  const handleSelect = ({ address, lat, lng }) => {
    setLocation({ address, lat, lng });
    // Additional logic if needed
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
      await addDoc(collection(db, 'foodEntries'), {
        mealsAvailable: Number(mealsAvailable),
        location: new GeoPoint(location.lat, location.lng),
        geohash,
        description,
        address: location.address,
        timestamp: serverTimestamp(),
      });
      alert('Food entry added successfully.');
      // Reset form fields
      setMealsAvailable('');
      setLocation({ address: '', lat: null, lng: null });      setDescription('');
    } catch (error) {
      console.error('Error adding food entry: ', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        placeholder="Number of meals"
        value={mealsAvailable}
        onChange={(e) => setMealsAvailable(e.target.value)}
        required
      />
      <PlacesAutocomplete onSelect={handleSelect} />
      <textarea
        placeholder="Description of the food"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <button type="submit">Submit Food Entry</button>
    </form>
  );
};

export default FoodEntry;
