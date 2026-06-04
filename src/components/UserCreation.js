// src/components/UserCreation.js
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "../firebase/firebase";
import { auth } from "../firebase/firebase"; // Adjust path if needed

const UserCreation = () => {
  // This state holds all the fields we want to send
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    middle_initial: "",
    last_name: "",
    address_city: "",
    address_country: "",
    address_state: "",
    address_address1: "",
    address_address2: "",
    address_zip_code: "",
    cell_phone_number: "",
    work_phone_number: "",
    home_phone_number: "",
    type: "Staff", // default type
    title: "Editor", // default title
    active: 1,
    default_hourly_rate: 25.0,
  });
  const [message, setMessage] = useState("");

  // Handle changes for all input fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // When the form is submitted, first create a Firebase user then add staff record in DB
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      // Step 1: Create the Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      // Optionally, if you need to store the firebase uid in your staff record:
      // const firebase_uid = userCredential.user.uid;

      // Step 2: Prepare the staff data for your backend.
      // Remove the password field before sending it to your backend.
      const { password, ...staffData } = formData;
      // You can also add firebase_uid if desired:
      // staffData.firebase_uid = firebase_uid;

      // Step 3: Call your backend /staff endpoint (adjust URL as needed)
      const response = await fetch("http://localhost:3001/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staffData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      const result = await response.json();
      setMessage("User created successfully and staff record added!");
      // Optionally, clear the form
      setFormData({
        email: "",
        password: "",
        first_name: "",
        middle_initial: "",
        last_name: "",
        address_city: "",
        address_country: "",
        address_state: "",
        address_address1: "",
        address_address2: "",
        address_zip_code: "",
        cell_phone_number: "",
        work_phone_number: "",
        home_phone_number: "",
        type: "Staff",
        title: "Editor",
        active: 1,
        default_hourly_rate: 25.0,
      });
    } catch (error) {
      console.error("Error during user/staff creation:", error.message);
      setMessage("Error: " + error.message);
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "auto" }}>
      <h2>Create New User & Staff Record</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email: </label>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password: </label>
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>First Name: </label>
          <input
            name="first_name"
            type="text"
            placeholder="First Name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Middle Initial: </label>
          <input
            name="middle_initial"
            type="text"
            placeholder="Middle Initial"
            value={formData.middle_initial}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Last Name: </label>
          <input
            name="last_name"
            type="text"
            placeholder="Last Name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>City: </label>
          <input
            name="address_city"
            type="text"
            placeholder="City"
            value={formData.address_city}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Country: </label>
          <input
            name="address_country"
            type="text"
            placeholder="Country"
            value={formData.address_country}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>State: </label>
          <input
            name="address_state"
            type="text"
            placeholder="State"
            value={formData.address_state}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Address Line 1: </label>
          <input
            name="address_address1"
            type="text"
            placeholder="Address Line 1"
            value={formData.address_address1}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Address Line 2: </label>
          <input
            name="address_address2"
            type="text"
            placeholder="Address Line 2"
            value={formData.address_address2}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Zip Code: </label>
          <input
            name="address_zip_code"
            type="text"
            placeholder="Zip Code"
            value={formData.address_zip_code}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Cell Phone: </label>
          <input
            name="cell_phone_number"
            type="text"
            placeholder="Cell Phone"
            value={formData.cell_phone_number}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Work Phone: </label>
          <input
            name="work_phone_number"
            type="text"
            placeholder="Work Phone"
            value={formData.work_phone_number}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Home Phone: </label>
          <input
            name="home_phone_number"
            type="text"
            placeholder="Home Phone"
            value={formData.home_phone_number}
            onChange={handleChange}
          />
        </div>
        {/* Additional fields (type, title, active, default_hourly_rate) can be set via Selects or hard-coded as defaults */}
        <div style={{ marginTop: "1rem" }}>
          <button type="submit">Create User & Staff Record</button>
        </div>
      </form>
    </div>
  );
};

export default UserCreation;