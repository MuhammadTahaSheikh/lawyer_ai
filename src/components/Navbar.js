import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [showNavbar, setShowNavbar] = useState(false);

  const handleShowNavbar = () => {
    setShowNavbar(!showNavbar);
  };

  return (
    <nav className="navbar">
      <div className="nav_container">
        <div className="logo">Logo</div>
        <div className="menu-icon" onClick={handleShowNavbar}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="none"
              stroke="#000"
              strokeWidth="2"
              d="M2 7h20M2 12h20M2 17h20"
            />
          </svg>
        </div>
        <div className={`nav-elements ${showNavbar && "active"}`}>
          <ul>
            <li>
              <NavLink to="/" onClick={() => setShowNavbar(false)}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/cases" onClick={() => setShowNavbar(false)}>
                Cases
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;