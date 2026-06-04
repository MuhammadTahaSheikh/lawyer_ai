import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { auth, onAuthStateChanged } from "../firebase/firebase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        try {
          const res = await axios.get("/active_users");
          const match = (res.data || []).find(
            (u) => u.email?.toLowerCase() === currentUser.email.toLowerCase()
          );
          setRole(match?.type || null);
        } catch {
          setRole(null);
        }
      } else {
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role }}>
      {children}
    </AuthContext.Provider>
  );
};