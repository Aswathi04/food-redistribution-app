// src/googleMapsLoader.js
let isLoading = false;
let isLoaded = false;
let callbacks = [];

export function loadGoogleMapsAPI(apiKey) {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (window.google && window.google.maps && window.google.maps.places) {
      isLoaded = true;
      resolve(window.google);
      return;
    }
    
    // Add to callback queue if currently loading
    if (isLoading) {
      callbacks.push(resolve);
      return;
    }
    
    // Start loading
    isLoading = true;
    
    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    // Set up callbacks
    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      resolve(window.google);
      callbacks.forEach(cb => cb(window.google));
      callbacks = [];
    };
    
    script.onerror = (error) => {
      isLoading = false;
      reject(error);
      callbacks.forEach(cb => cb(null));
      callbacks = [];
    };
    
    document.head.appendChild(script);
  });
}