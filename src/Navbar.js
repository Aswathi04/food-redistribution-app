import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{ display: "flex", justifyContent: "space-around", padding: "10px", background: "#eee" }}>
      <Link to="/food-list">Food Entries</Link>
      <Link to="/food-entry">Add Food</Link>
      <Link to="/food-shortages">Food Shortages</Link>
       
      {user && <button onClick={logout}>Logout</button>}
    </nav>
  );
}

export default Navbar;
