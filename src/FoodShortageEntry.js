import { useState } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import app from "./firebaseConfig";

const db = getFirestore(app);

function FoodShortageEntry() {
  const [shortageData, setShortageData] = useState({
    organization_name: "",
    needed_food: "",
    location: "",
    refrigeration: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "food_shortages"), shortageData);
    alert("Food shortage entry added!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Organization Name" onChange={(e) => setShortageData({ ...shortageData, organization_name: e.target.value })} required />
      <input type="text" placeholder="Needed Food (e.g., Rice, Vegetables)" onChange={(e) => setShortageData({ ...shortageData, needed_food: e.target.value })} required />
      <input type="text" placeholder="Location" onChange={(e) => setShortageData({ ...shortageData, location: e.target.value })} required />
      <label>
        <input type="checkbox" onChange={(e) => setShortageData({ ...shortageData, refrigeration: e.target.checked })} />
        Refrigeration Needed
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}

export default FoodShortageEntry;
