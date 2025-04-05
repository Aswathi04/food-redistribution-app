import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from "./firebaseConfig";

const db = getFirestore(app);

function FoodShortageList() {
  const [shortages, setShortages] = useState([]);

  useEffect(() => {
    const fetchShortages = async () => {
      const querySnapshot = await getDocs(collection(db, "food_shortages"));
      const shortageList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setShortages(shortageList);
    };

    fetchShortages();
  }, []);

  return (
    <div>
      <h1>Food Shortages</h1>
      {shortages.length === 0 ? (
        <p>No shortages reported.</p>
      ) : (
        <ul>
          {shortages.map((shortage) => (
            <li key={shortage.id}>
              <strong>{shortage.organization_name}</strong> needs {shortage.needed_food} at {shortage.location}. Refrigeration: {shortage.refrigeration ? "Yes" : "No"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FoodShortageList;
