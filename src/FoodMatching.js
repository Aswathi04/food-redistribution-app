import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { 
  collection, 
  query, 
  getDocs, 
  where, 
  doc, 
  updateDoc,
  addDoc,
  serverTimestamp,
  limit,
  orderBy
} from 'firebase/firestore';
import { getDistanceFromLatLonInKm } from './utils'; // We'll create this helper
import PlacesAutocomplete from './PlacesAutocomplete';

const FoodMatching = () => {
  const [userLocation, setUserLocation] = useState({ address: '', lat: null, lng: null });
  const [searchRadius, setSearchRadius] = useState(10); // Default radius in km
  const [availableFoodEntries, setAvailableFoodEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(null);
  
  const handleSelect = ({ address, lat, lng }) => {
    setUserLocation({ address, lat, lng });
  };
  
  // Find available food entries near the user's location
  const searchNearbyFood = async () => {
    if (!userLocation.lat || !userLocation.lng) {
      alert('Please select a valid location.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Get all food entries (in a real app, you'd want to use geohashing for better performance)
      const foodEntriesRef = collection(db, 'foodEntries');
      const q = query(
        foodEntriesRef,
        orderBy('timestamp', 'desc'),
        limit(50) // Limit for performance
      );
      
      const querySnapshot = await getDocs(q);
      
      // Filter entries based on distance and availability
      const nearbyEntries = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        
        // Skip if it's already claimed
        if (data.status === 'claimed') return;
        
        const distance = getDistanceFromLatLonInKm(
          userLocation.lat,
          userLocation.lng,
          data.location.latitude,
          data.location.longitude
        );
        
        // Only include entries within the search radius
        if (distance <= searchRadius) {
          nearbyEntries.push({
            id: doc.id,
            ...data,
            distance: distance.toFixed(1) // Round to 1 decimal place
          });
        }
      });
      
      setAvailableFoodEntries(nearbyEntries);
    } catch (error) {
      console.error('Error searching for nearby food: ', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Send a request for a specific food entry
  const requestFood = async (foodEntryId) => {
    try {
      // Create a match request
      const matchRef = await addDoc(collection(db, 'foodMatches'), {
        foodEntryId: foodEntryId,
        requesterLocation: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          address: userLocation.address
        },
        status: 'pending', // pending, accepted, declined
        timestamp: serverTimestamp(),
        // Add user information (if you have authentication)
        // userId: currentUser.uid,
        // userName: currentUser.displayName,
      });
      
      // Update request status
      setRequestSent({
        id: matchRef.id,
        status: 'pending',
        timestamp: new Date()
      });
      
      alert('Food request sent successfully! Wait for the provider to accept.');
    } catch (error) {
      console.error('Error requesting food: ', error);
    }
  };
  
  return (
    <div className="food-matching-container">
      <h2>Find Available Food Near You</h2>
      
      <div className="search-area">
        <div className="location-input">
          <label>Your Location: </label>
          <PlacesAutocomplete onSelect={handleSelect} />
        </div>
        
        <div className="radius-slider">
          <label>Search Radius: {searchRadius} km</label>
          <input
            type="range"
            min="1"
            max="50"
            value={searchRadius}
            onChange={(e) => setSearchRadius(parseInt(e.target.value))}
          />
        </div>
        
        <button 
          className="search-button"
          onClick={searchNearbyFood}
          disabled={loading || !userLocation.lat}
        >
          {loading ? 'Searching...' : 'Find Food'}
        </button>
      </div>
      
      {/* Display search results */}
      <div className="search-results">
        <h3>Available Food</h3>
        
        {loading ? (
          <p>Searching for food near you...</p>
        ) : availableFoodEntries.length > 0 ? (
          <div className="food-entries-list">
            {availableFoodEntries.map(entry => (
              <div key={entry.id} className="food-entry-card">
                <h4>{entry.description}</h4>
                <p><strong>Meals Available:</strong> {entry.mealsAvailable}</p>
                <p><strong>Distance:</strong> {entry.distance} km</p>
                <p><strong>Location:</strong> {entry.address}</p>
                <p><strong>Posted:</strong> {entry.timestamp?.toDate().toLocaleDateString()}</p>
                <button 
                  onClick={() => requestFood(entry.id)}
                  disabled={requestSent?.foodEntryId === entry.id}
                >
                  {requestSent?.foodEntryId === entry.id ? 'Request Sent' : 'Request This Food'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No available food found nearby. Try increasing your search radius.</p>
        )}
      </div>
      
      {/* Request status display */}
      {requestSent && (
        <div className="request-status">
          <h3>Your Request Status</h3>
          <p>Status: {requestSent.status}</p>
          <p>Requested at: {requestSent.timestamp.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default FoodMatching;