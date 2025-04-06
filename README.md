 # A Food Project

A web application that facilitates food sharing by connecting those with excess food to those in need, using geolocation for efficient matching.

## Overview

This application allows users to:
1. Submit entries for available food they wish to share
2. Report food shortages and needs
3. Match food providers with those in need based on location

## Tech Stack

- **Frontend**: React.js
- **Backend/Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Geolocation**: Google Maps API, Places Autocomplete
- **Geohashing**: GeoFire for location-based queries

## Features

### Food Entry Submission
Users can submit information about excess food they have available:
- Number of meals available
- Location (using Google Places Autocomplete)
- Description of the food

### Food Shortage Reporting
Users can report food shortages:
- Number of meals needed
- Location (using Google Places Autocomplete)
- Description of the need

### Geolocation Features
- Interactive map for visualizing locations
- Location selection via map clicks
- Address autocomplete for easy location input
- Geohashing for efficient proximity searches

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd food-sharing-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following:
   ```
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. Start the development server:
   ```
   npm start
   ```

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Google provider)
3. Create a Firestore database
4. Set up the following collections:
   - `foodEntries` - for storing available food submissions
   - `foodShortages` - for storing food shortage reports

## Google Maps API Setup

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
3. Create an API key with appropriate restrictions

## Project Structure

- `src/FoodEntry.js` - Component for submitting available food
- `src/FoodShortages.js` - Component for reporting food shortages
- `src/MapComponent.js` - Interactive Google Maps component
- `src/PlacesAutocomplete.js` - Google Places autocomplete for location selection
- `src/firebaseConfig.js` - Firebase configuration and initialization
- `src/utils/googleMapsLoader.js` - Utility for loading Google Maps API

## Firestore Data Structure

### Food Entries Collection
```
{
  mealsAvailable: number,
  location: GeoPoint,
  geohash: string,
  description: string,
  address: string,
  timestamp: serverTimestamp
}
```

### Food Shortages Collection
```
{
  mealsNeeded: number,
  location: GeoPoint,
  geohash: string,
  description: string,
  address: string,
  timestamp: serverTimestamp
}
```

 
 
