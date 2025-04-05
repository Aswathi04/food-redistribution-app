import React from "react";
import { useAuth } from "./AuthContext";

function LoginPage() {
  const { loginWithGoogle } = useAuth();

  return (
    <div>
      <h1>Sign In to Access Food Listings</h1>
      <button onClick={loginWithGoogle}>Sign in with Google</button>
    </div>
  );
}

export default LoginPage;
