import { useEffect, useState } from "react";
import { db } from "./firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const FoodEntryList = () => {
  const [foodEntries, setFoodEntries] = useState([]);

  useEffect(() => {
    const fetchFoodEntries = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "foodEntries"));
        setFoodEntries(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching food entries:", error);
      }
    };

    fetchFoodEntries();
  }, []);

  return (
    <div>
      <h2>Food Entries</h2>
      <ul>
        {foodEntries.map((entry) => (
          <li key={entry.id}>
          {entry.name} - {entry.quantity} (Location: {entry.location?.lat}, {entry.location?.lng})
        </li>
        
        ))}
      </ul>
    </div>
  );
};

export default FoodEntryList;
