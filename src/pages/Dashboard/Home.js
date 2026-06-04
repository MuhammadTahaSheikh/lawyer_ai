import React, { useEffect, useState } from "react";
import { CssBaseline, Box, Grid } from "@mui/joy";
import { getAuth, onAuthStateChanged } from "../../firebase/firebase";
import AddItemComponent from "./AddItemComponent";
import EmployeesMilestones from "./EmployeesMilestones";
import MyTask from "./MyTask";
import TodayEvents from "./TodayEvents";
import Timesheet from "./MyTimeSheet";
import RecentActivityAll from "./RecentActivity/RecentActivityAll";
import axios from "axios";

const HomeTab = () => {
  const [userTitle, setUserTitle] = useState("");
  const [isLoadingUserProfile, setIsLoadingUserProfile] = useState(true);

  const fetchCurrentUserTitle = async (user) => {
    if (!user) {
      setUserTitle("");
      setIsLoadingUserProfile(false);
      return;
    }

    try {
      const response = await axios.get("/active_users");
      const activeUsers = response?.data || [];
      const currentUser = activeUsers.find((u) => u?.uid === user.uid);
      setUserTitle((currentUser?.title || "").trim());
    } catch (error) {
      console.error("Error fetching active user profile:", error);
      setUserTitle("");
    } finally {
      setIsLoadingUserProfile(false);
    }
  };

  // Hide Employee Milestones for JB-Bryson title only; everyone else can see it.
  const isJbBrysonUser = userTitle === "JB-Bryson";

  useEffect(() => {
    const auth = getAuth();
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Now that we know there is a signed‐in user, fetch the ID token
        user
          .getIdToken(/* forceRefresh= */ true)
          .then((token) => {
            console.log("✅ ID token:", token);
          })
          .catch((err) => {
            console.error("❌ Error fetching ID token:", err);
          });

        await fetchCurrentUserTitle(user);
      } else {
        console.warn("⚠️ No user is signed in yet.");
        setUserTitle("");
        setIsLoadingUserProfile(false);
      }
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []); // run once on mount

  return (
    <Box sx={{ 
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box"
    }}>
      {/* <AddItemComponent/> */}
      {!isLoadingUserProfile && !isJbBrysonUser && <EmployeesMilestones />}
      <CssBaseline />
      <Grid container spacing={2} sx={{ width: "100%", maxWidth: "100%" }}>
        <Grid xs={12} md={8} sx={{ mt: 2 }}>
          <RecentActivityAll />
          {/* <Timesheet /> */}
        </Grid>
        <Grid xs={12} md={4}>
          {/* <MyTask /> */}
          <Box sx={{ mt: 2 }}>
            <TodayEvents />
          </Box>
        </Grid>
      </Grid>
                <Box sx={{ mt: 2 }}>
      <AddItemComponent/>
</Box>
    </Box>
  );
};

export default HomeTab;