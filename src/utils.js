// utils.js - Helper functions for your application

/**
 * Calculate distance between two coordinates using the Haversine formula
 * @param {number} lat1 - Latitude of first coordinate
 * @param {number} lon1 - Longitude of first coordinate
 * @param {number} lat2 - Latitude of second coordinate
 * @param {number} lon2 - Longitude of second coordinate
 * @returns {number} - Distance in kilometers
 */
export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

/**
 * Convert degrees to radians
 * @param {number} deg - Degrees
 * @returns {number} - Radians
 */
function deg2rad(deg) {
  return deg * (Math.PI/180);
}

/**
 * Format a timestamp to a readable date string
 * @param {Object} timestamp - Firestore timestamp object
 * @returns {string} - Formatted date string
 */
export function formatTimestamp(timestamp) {
  if (!timestamp || !timestamp.toDate) return 'Unknown';
  return timestamp.toDate().toLocaleString();
}