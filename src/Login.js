import { useState } from "react";
import { auth, googleProvider } from "./firebaseConfig";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in:", auth.currentUser);
    } catch (err) {
      setError(err.message);
      console.error("Login error:", err);
    }
  };

  const handleGoogleLogin = async () => {
    setError(""); // Clear previous errors
    try {
      await signInWithPopup(auth, googleProvider);
      console.log("User logged in with Google:", auth.currentUser);
    } catch (err) {
      setError(err.message);
      console.error("Google Sign-In error:", err);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ marginBottom: '10px', display: 'block' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginBottom: '10px', display: 'block' }}
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </div>
  );
};

export default Login;
