import React, { createContext, useContext, useState } from "react";

const PortalAuthContext = createContext(null);

export function PortalAuthProvider({ children }) {
  const [portalUser, setPortalUser] = useState(() => {
    try {
      const stored = localStorage.getItem("portalUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [portalToken, setPortalToken] = useState(
    () => localStorage.getItem("portalToken") || null
  );

  const loginPortal = (token, user) => {
    localStorage.setItem("portalToken", token);
    localStorage.setItem("portalUser", JSON.stringify(user));
    setPortalToken(token);
    setPortalUser(user);
  };

  const logoutPortal = () => {
    localStorage.removeItem("portalToken");
    localStorage.removeItem("portalUser");
    setPortalToken(null);
    setPortalUser(null);
  };

  return (
    <PortalAuthContext.Provider value={{ portalUser, portalToken, loginPortal, logoutPortal }}>
      {children}
    </PortalAuthContext.Provider>
  );
}

export const usePortalAuth = () => useContext(PortalAuthContext);
