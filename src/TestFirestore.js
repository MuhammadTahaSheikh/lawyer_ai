import React, { useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase/firebase";

const TestFirestore = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        console.log("Fetched documents:", querySnapshot.docs.map(doc => doc.data()));
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    fetchData();
  }, []);

  return <div>Testing Firestore Query</div>;
};

export default TestFirestore;