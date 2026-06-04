import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, role } = useContext(AuthContext);

  // While checking authentication and role, you can render a loading indicator
  if (user && role === null) {
    return <div>Loading...</div>;
  }
  
  // If no user or if the user is not an admin, redirect to login.
  if (!user || role !== "Admin") {
    return <Navigate to="/login" />;
  }

  return children;
};

export default AdminRoute;