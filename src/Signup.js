// Signup.js
import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { SignUp } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await SignUp(email, password);
      alert("Signup Successful!");
      navigate("/"); // Redirect to home page
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="signup-container">
      <h1>Sign Up</h1>
      <form onSubmit={handleSignup}>
        <input 
          type="email" 
          placeholder="Email" 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ marginBottom: '10px', display: 'block' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ marginBottom: '10px', display: 'block' }}
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignUp;