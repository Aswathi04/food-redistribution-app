import { Loader } from '@googlemaps/js-api-loader';

let loaderInstance = null;

export const loadGoogleMaps = () => {
  if (loaderInstance) {
    return loaderInstance.load();
  }

  loaderInstance = new Loader({
    apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    version: 'weekly',
    libraries: ['places'],
    authReferrerPolicy: 'origin'
  });

  return loaderInstance.load();
};

export const isGoogleMapsLoaded = () => {
  return window.google && window.google.maps && window.google.maps.places;
};
