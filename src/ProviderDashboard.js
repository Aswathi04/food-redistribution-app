import React, { useState, useEffect } from 'react';
import { db, auth } from './firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  onSnapshot,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

const ProviderDashboard = () => {
  const [myFoodEntries, setMyFoodEntries] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Use the actual auth or a simple state
  const [userId, setUserId] = useState(auth.currentUser?.uid || "temp-user-id");
  
  // Fetch all food entries
  useEffect(() => {
    const foodEntriesRef = collection(db, 'foodEntries');
    
    // Get all food entries initially
    const q = query(foodEntriesRef);
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entries = [];
      querySnapshot.forEach((doc) => {
        // Fixed: Handle timestamp properly with type checking
        const data = doc.data();
        let timestamp;
        
        try {
          // Try to safely convert the timestamp
          if (data.timestamp && typeof data.timestamp.toDate === 'function') {
            timestamp = data.timestamp.toDate();
          } else if (data.timestamp && data.timestamp.seconds) {
            // Handle Firestore timestamp object manually
            timestamp = new Date(data.timestamp.seconds * 1000);
          } else if (data.timestamp instanceof Date) {
            timestamp = data.timestamp;
          } else if (data.timestamp) {
            // Handle string or number timestamp
            timestamp = new Date(data.timestamp);
          } else {
            timestamp = new Date();
          }
        } catch (err) {
          console.error("Error converting timestamp:", err);
          timestamp = new Date();
        }
        
        entries.push({
          id: doc.id,
          ...data,
          timestamp: timestamp
        });
      });
      
      console.log("Food entries fetched:", entries.length);
      setMyFoodEntries(entries);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Fetch all food match requests
  useEffect(() => {
    if (myFoodEntries.length === 0) return;
    
    const entryIds = myFoodEntries.map(entry => entry.id);
    console.log("Looking for requests for entries:", entryIds);
    
    const requestsRef = collection(db, 'foodMatches');
    
    // If there are no entries yet, don't query with empty array
    if (entryIds.length === 0) {
      setRequests([]);
      return;
    }
    
    // To avoid potential "in" clause limitations, chunk the array if it's large
    const chunkSize = 10; // Firestore allows up to 10 items in an 'in' query
    const entryChunks = [];
    
    for (let i = 0; i < entryIds.length; i += chunkSize) {
      entryChunks.push(entryIds.slice(i, i + chunkSize));
    }
    
    // Create an unsubscribe function array to clean up all listeners
    const unsubscribes = [];
    
    entryChunks.forEach(chunk => {
      const q = query(requestsRef, where('foodEntryId', 'in', chunk));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const newRequests = [];
        querySnapshot.forEach((doc) => {
          // Fixed: Handle timestamp properly with type checking
          const data = doc.data();
          let timestamp;
          
          try {
            // Try to safely convert the timestamp
            if (data.timestamp && typeof data.timestamp.toDate === 'function') {
              timestamp = data.timestamp.toDate();
            } else if (data.timestamp && data.timestamp.seconds) {
              // Handle Firestore timestamp object manually
              timestamp = new Date(data.timestamp.seconds * 1000);
            } else if (data.timestamp instanceof Date) {
              timestamp = data.timestamp;
            } else if (data.timestamp) {
              // Handle string or number timestamp
              timestamp = new Date(data.timestamp);
            } else {
              timestamp = new Date();
            }
          } catch (err) {
            console.error("Error converting timestamp:", err);
            timestamp = new Date();
          }
          
          const request = {
            id: doc.id,
            ...data,
            timestamp: timestamp
          };
          
          newRequests.push(request);
        });
        
        // Merge with existing requests (avoid duplicates)
        setRequests(prev => {
          const existingIds = new Set(prev.map(r => r.id));
          const uniqueNewRequests = newRequests.filter(r => !existingIds.has(r.id));
          return [...prev, ...uniqueNewRequests];
        });
      });
      
      unsubscribes.push(unsubscribe);
    });
    
    // Attach food details to requests after all are loaded
    if (myFoodEntries.length > 0) {
      setRequests(currentRequests => 
        currentRequests.map(request => {
          const relatedEntry = myFoodEntries.find(entry => entry.id === request.foodEntryId);
          if (relatedEntry) {
            return { ...request, foodDetails: relatedEntry };
          }
          return request;
        })
      );
    }
    
    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
  }, [myFoodEntries]);
  
  // Format timestamp to readable string
  const formatTimestamp = (timestamp) => {
    // Handle possible undefined
    if (!timestamp) return 'Unknown';
    
    // Ensure timestamp is a Date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }
    
    // Handle Firestore timestamp object
    if (typeof timestamp === 'object' && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }
    
    // Try to convert to Date if it's a number or string
    try {
      return new Date(timestamp).toLocaleString();
    } catch (e) {
      console.error("Error formatting timestamp:", e);
      return 'Invalid Date';
    }
  };
  
  // Handle request acceptance
  const acceptRequest = async (requestId, foodEntryId) => {
    try {
      // Update request status
      console.log(`Accepting request ${requestId} for food entry ${foodEntryId}`);
      await updateDoc(doc(db, 'foodMatches', requestId), {
        status: 'accepted',
        updatedAt: serverTimestamp() // Use Firestore's serverTimestamp for consistency
      });
      
      // Update food entry status
      await updateDoc(doc(db, 'foodEntries', foodEntryId), {
        status: 'claimed',
        claimedAt: serverTimestamp(),
        claimedByRequestId: requestId
      });
      
      // Reject all other requests for this food entry
      const otherRequests = requests.filter(
        req => req.foodEntryId === foodEntryId && req.id !== requestId
      );
      
      for (const req of otherRequests) {
        await updateDoc(doc(db, 'foodMatches', req.id), {
          status: 'declined',
          updatedAt: serverTimestamp()
        });
      }
      
      alert('Request accepted successfully!');
    } catch (error) {
      console.error('Error accepting request: ', error);
      alert(`Error accepting request: ${error.message}`);
    }
  };
  
  // Handle request rejection
  const declineRequest = async (requestId) => {
    try {
      await updateDoc(doc(db, 'foodMatches', requestId), {
        status: 'declined',
        updatedAt: serverTimestamp()
      });
      
      alert('Request declined.');
    } catch (error) {
      console.error('Error declining request: ', error);
      alert(`Error declining request: ${error.message}`);
    }
  };
  
  // Delete a food entry
  const deleteEntry = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this food entry?')) {
      try {
        await deleteDoc(doc(db, 'foodEntries', entryId));
        alert('Food entry deleted successfully!');
      } catch (error) {
        console.error('Error deleting food entry: ', error);
        alert(`Error deleting food entry: ${error.message}`);
      }
    }
  };
  
  return (
    <div className="provider-dashboard">
      <h2>Provider Dashboard</h2>
      
      {loading ? (
        <p>Loading your food entries...</p>
      ) : (
        <>
          <h3>Available Food Entries</h3>
          {myFoodEntries.length > 0 ? (
            <div className="food-entries-container">
              {myFoodEntries.map(entry => (
                <div key={entry.id} className="food-entry-card" style={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '16px',
                  margin: '16px 0',
                  background: entry.status === 'claimed' ? '#f2f2f2' : 'white'
                }}>
                  <div className="card-header" style={{display: 'flex', justifyContent: 'space-between'}}>
                    <h4>{entry.description || 'No description'}</h4>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: entry.status === 'claimed' ? '#6c757d' : '#28a745',
                      color: 'white'
                    }}>
                      {entry.status || 'Available'}
                    </span>
                  </div>
                  
                  <p><strong>Meals:</strong> {entry.mealsAvailable}</p>
                  <p><strong>Location:</strong> {entry.address}</p>
                  <p><strong>Posted:</strong> {formatTimestamp(entry.timestamp)}</p>
                  
                  <div className="actions" style={{marginTop: '16px'}}>
                    <button 
                      onClick={() => deleteEntry(entry.id)}
                      disabled={entry.status === 'claimed'}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: entry.status === 'claimed' ? 'not-allowed' : 'pointer',
                        opacity: entry.status === 'claimed' ? 0.5 : 1
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>You haven't posted any food entries yet.</p>
          )}
          
          <h3>Food Requests</h3>
          {requests.length > 0 ? (
            <div className="requests-container">
              {requests.map(request => (
                <div key={request.id} className="request-card" style={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '16px',
                  margin: '16px 0',
                  background: '#f8f9fa'
                }}>
                  <h4>Request for: {request.foodDetails?.description || 'Unknown food entry'}</h4>
                  <p><strong>Status:</strong> {request.status || 'pending'}</p>
                  <p><strong>Requested At:</strong> {formatTimestamp(request.timestamp)}</p>
                  <p><strong>Requester Location:</strong> {request.requesterLocation?.address || 'Unknown location'}</p>
                  
                  {(!request.status || request.status === 'pending') && (
                    <div className="actions" style={{marginTop: '16px', display: 'flex', gap: '8px'}}>
                      <button 
                        onClick={() => acceptRequest(request.id, request.foodEntryId)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => declineRequest(request.id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No requests for your food entries yet.</p>
          )}
        </>
      )}
    </div>
  );
};

export default ProviderDashboard;