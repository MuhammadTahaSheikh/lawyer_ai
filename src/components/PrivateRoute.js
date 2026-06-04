import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, onAuthStateChanged } from "../firebase/firebase";

const PrivateRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Stop loading once the auth state is determined
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Show a loading message while checking auth state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;