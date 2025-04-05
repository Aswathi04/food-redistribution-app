import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <p>Loading...</p>;
  return user ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
