// // src/components/WeeklyHoursGuard.jsx
// import React, { useEffect, useState, useMemo } from "react";
// import axios from "axios";
// import { getAuth, onAuthStateChanged } from "../firebase/firebase";
// import {
//   Modal,
//   Sheet,
//   Typography,
//   Alert,
//   Box,
//   Button,
//   List,
//   ListItem,
//   ListItemContent,
//   CircularProgress
// } from "@mui/joy";

// // ---- helpers (same logic you had) ----
// const getWeekRange = (date = new Date()) => {
//   const day = date.getDay(); // 0 = Sun, 1 = Mon, ... 4 = Thu
//   const diffToMonday = day === 0 ? -6 : 1 - day;

//   const monday = new Date(date);
//   monday.setDate(date.getDate() + diffToMonday);
//   monday.setHours(0, 0, 0, 0);

//   // const sunday = new Date(monday);
//   // sunday.setDate(monday.getDate() + 6);
//   // sunday.setHours(23, 59, 59, 999);
//  // end on Wednesday 23:59:59.999
//   const wednesday = new Date(monday);
//   wednesday.setDate(monday.getDate() + 2);
//   wednesday.setHours(23, 59, 59, 999);
//   return {
//     start: monday.toISOString().split("T")[0],
//     end: wednesday.toISOString().split("T")[0],
//     display: `${monday.toLocaleDateString()} - ${wednesday.toLocaleDateString()}`
//   };
// };

// const shouldCheckWeeklyHours = () => {
//   const today = new Date();
//   const isThursday = today.getDay() === 4; // Thu
//   if (!isThursday) return false;

//   const lastCheckedKey = `weeklyHoursChecked_${today.toISOString().split("T")[0]}`;
//   const alreadyChecked = localStorage.getItem(lastCheckedKey);
//   return !alreadyChecked;
// };

// export default function WeeklyHoursGuard() {
//   const auth = useMemo(() => getAuth(), []);
//   const [showWeeklyHoursModal, setShowWeeklyHoursModal] = useState(false);
//   const [weeklyHoursData, setWeeklyHoursData] = useState({
//     totalHours: 0,
//     timeEntries: [],
//     weekRange: ""
//   });
//   const [isLoading, setIsLoading] = useState(false);

//   const checkWeeklyHours = async (user) => {
//     if (!user) return;

//     const weekRange = getWeekRange();
//     const lastCheckedKey = `weeklyHoursChecked_${new Date().toISOString().split("T")[0]}`;

//     setIsLoading(true);
//     try {
//       const token = await user.getIdToken(true);

//       const response = await axios.get("/time_entries", {
//         params: {
//           user_id: user.uid,
//           page: 1,
//           start_date: weekRange.start,
//           end_date: weekRange.end,
//           per_page: 100
//         },
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       const entries = response.data?.data || [];
//       const totalHours = entries.reduce(
//         (sum, entry) => sum + parseFloat(entry.hours || 0),
//         0
//       );

//       setWeeklyHoursData({
//         totalHours,
//         timeEntries: entries,
//         weekRange: weekRange.display
//       });

//       // Show modal if less than 24 hours (same as before)
//       if (totalHours < 24) {
//         setShowWeeklyHoursModal(true);
//       }

//       // Mark as checked for today
//       localStorage.setItem(lastCheckedKey, "true");
//     } catch (error) {
//       console.error("Error checking weekly hours:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Run on mount for already-signed-in users
//   useEffect(() => {
//     const user = auth.currentUser;
//     if (user && shouldCheckWeeklyHours()) {
//       checkWeeklyHours(user);
//     }
//   }, [auth]);

//   // Also run on auth state change (sign in)
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user && shouldCheckWeeklyHours()) {
//         checkWeeklyHours(user);
//       }
//     });
//     return () => unsubscribe();
//   }, [auth]);

//   return (
//     <Modal
//       open={showWeeklyHoursModal}
//       onClose={() => setShowWeeklyHoursModal(false)}
//       sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
//     >
//       <Sheet
//         sx={{
//           width: "100%",
//           maxWidth: "600px",
//           maxHeight: "80vh",
//           borderRadius: "md",
//           p: 3,
//           boxShadow: "lg",
//           bgcolor: "background.surface"
//         }}
//       >
//         {isLoading ? (
//           <Box sx={{ display: "flex", justifyContent: "center" }}>
//             <CircularProgress />
//           </Box>
//         ) : (
//           <>
//             <Alert color="warning" variant="soft" sx={{ mb: 2 }}>
//               <Typography level="h4" component="h2">
//                 ⚠️ Weekly Hours Alert
//               </Typography>
//             </Alert>

//             <Typography level="body1" sx={{ mb: 2 }}>
//               Your total hours for this week ({weeklyHoursData.weekRange}) are{" "}
//               <strong>{weeklyHoursData.totalHours.toFixed(2)} hours</strong>, which is
//               less than the required 24 hours.
//             </Typography>

//             {!!weeklyHoursData.timeEntries.length && (
//               <>
//                 <Typography level="body2" sx={{ mb: 1, fontWeight: "bold" }}>
//                   Your time entries this week:
//                 </Typography>
//                 <Box sx={{ maxHeight: "200px", overflowY: "auto", mb: 2 }}>
//                   <List>
//                     {weeklyHoursData.timeEntries.map((entry) => (
//                       <ListItem key={entry.time_entry_id}>
//                         <ListItemContent>
//                           <Typography fontSize="sm">
//                             {entry.entry_date}: {entry.description || "No description"} - {entry.hours} hours
//                           </Typography>
//                         </ListItemContent>
//                       </ListItem>
//                     ))}
//                   </List>
//                 </Box>
//               </>
//             )}

//             <Button
//               fullWidth
//               sx={{ mt: 2 }}
//               onClick={() => setShowWeeklyHoursModal(false)}
//               variant="solid"
//               color="primary"
//             >
//               Acknowledge
//             </Button>
//           </>
//         )}
//       </Sheet>
//     </Modal>
//   );
// }



// src/components/WeeklyHoursGuard.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "../firebase/firebase";
import {
  Modal,
  Sheet,
  Typography,
  Alert,
  Box,
  Button,
  List,
  ListItem,
  ListItemContent,
  CircularProgress
} from "@mui/joy";

// ---- helpers ----
const getDayRange = (dateObj) => {
  const d = new Date(dateObj);
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);

  const end = new Date(d);
  end.setHours(23, 59, 59, 999);

  return {
    startIsoDate: start.toISOString().split("T")[0], // YYYY-MM-DD
    endIsoDate: end.toISOString().split("T")[0],     // YYYY-MM-DD
    display: d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "short", day: "numeric" }),
    weekdayName: d.toLocaleDateString(undefined, { weekday: "long" })
  };
};

// Returns the previous business day relative to "today".
// Mon -> Fri (3 days back); Tue-Fri -> yesterday; Sat/Sun -> null (skip checks)
const getPreviousBusinessDay = (today = new Date()) => {
  const dow = today.getDay(); // 0 Sun, 1 Mon, 2 Tue, 3 Wed, 4 Thu, 5 Fri, 6 Sat
  if (dow === 0 || dow === 6) return null; // Sunday or Saturday -> skip

  const prev = new Date(today);
  const offset = (dow === 1) ? -3 : -1; // Monday -> Friday; else -> yesterday
  prev.setDate(today.getDate() + offset);
  prev.setHours(0, 0, 0, 0);
  return prev;
};

// Only show once per calendar day for the current user device
const shouldCheckDailyHours = (uid) => {
  const dateKey = new Date().toISOString().split("T")[0];
  const todayKey = `dailyHoursChecked_${uid}_${dateKey}`;
  const already = localStorage.getItem(todayKey);
  return { todayKey, shouldCheck: !already };
};


export default function WeeklyHoursGuard() {
  const firedOnceRef = useRef(false); // prevents duplicate checks in dev/strict + dual effects

  const auth = useMemo(() => getAuth(), []);
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState({
    totalHours: 0,
    timeEntries: [],
    rangeDisplay: "",
    dayName: ""
  });
  const [isLoading, setIsLoading] = useState(false);
// --- NEW: fetch user type from active_users ---
// --- fetch user type using existing GET /active_users ---
const getUserType = async (user) => {
  try {
    const token = await user.getIdToken(true);
    const res = await axios.get("/active_users", {
      headers: { Authorization: `Bearer ${token}` }
    });
    // /active_users returns all active users (SELECT * ...). Find current user.
    const me = (res.data || []).find((u) => u.uid === user.uid);
    return me?.type ?? null; // "admin", "paralegal", etc.
  } catch (e) {
    console.error("Failed to load user type:", e);
    return null;
  }
};


  const checkPreviousDayHours = async (user) => {
    if (!user) return;
    
    console.log("Checking daily hours for user:", user.uid);
    
    const userType = await getUserType(user);
    console.log("User type:", userType);
    
    if (userType === "Admin") {
      console.log("User is Admin, skipping daily hours check");
      return;
    }
    
    // Determine the previous business day (Mon checks Fri; Tue-Fri check yesterday)
    const prevBiz = getPreviousBusinessDay(new Date());
    console.log("Previous business day:", prevBiz);
    
    if (!prevBiz) {
      console.log("No previous business day (weekend), skipping check");
      return; // Weekend: do nothing
    }

    const { todayKey, shouldCheck } = shouldCheckDailyHours(user.uid);
    console.log("Should check daily hours:", shouldCheck, "Today key:", todayKey);
    
    if (!shouldCheck) {
      console.log("Already checked today, skipping");
      return;
    }

    const dayRange = getDayRange(prevBiz);

    setIsLoading(true);
    try {
      const token = await user.getIdToken(true);

      // Fetch entries only for that previous business day
      const response = await axios.get("/time_entries", {
        params: {
          user_id: user.uid, // Use actual user UID instead of hardcoded
          page: 1,
          start_date: dayRange.startIsoDate,
          end_date: dayRange.startIsoDate,
          // start_date: dayRange.endIsoDate,  for pk local time
          // end_date: dayRange.endIsoDate, for pk local time
          limit: 1000
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      const entries = response.data?.data || [];      
      const totalHours = entries.reduce(
        (sum, entry) => sum + parseFloat(entry.hours || 0),
        0
      );
      
      console.log("Daily hours check:", {
        day: dayRange.weekdayName,
        totalHours: totalHours,
        entries: entries.length,
        isLessThan7: totalHours < 7 - 0.001
      });
      
      setData({
        totalHours,
        timeEntries: entries,
        rangeDisplay: dayRange.display,
        dayName: dayRange.weekdayName
      });

      // Show modal if less than 7 hours for that day
      // Use a small epsilon to handle floating-point precision issues
      if (totalHours < 7 - 0.001) {
        setShowModal(true);
      }

      // Mark as checked for today
      localStorage.setItem(todayKey, "true");
    } catch (error) {
      console.error("Error checking daily hours:", error);
    } finally {
      setIsLoading(false);
    }
  };

// Run on mount for already-signed-in users
useEffect(() => {
  const user = auth.currentUser;
  if (user && !firedOnceRef.current) {
    firedOnceRef.current = true;
    checkPreviousDayHours(user);
  }
}, [auth]);

// Also run on auth state change (sign in)
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user && !firedOnceRef.current) {
      firedOnceRef.current = true;
      checkPreviousDayHours(user);
    }
  });
  return () => unsubscribe();
}, [auth]);


  return (
    <Modal
      open={showModal}
      onClose={() => setShowModal(false)}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Sheet
        sx={{
          width: "100%",
          maxWidth: "600px",
          maxHeight: "80vh",
          borderRadius: "md",
          p: 3,
          boxShadow: "lg",
          bgcolor: "background.surface"
        }}
      >
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Alert color="warning" variant="soft" sx={{ mb: 2 }}>
              <Typography level="h4" component="h2">
                ⚠️ Daily Hours Alert
              </Typography>
            </Alert>

            <Typography level="body1" sx={{ mb: 2 }}>
              Your total hours for <strong>{data.dayName}</strong> ({data.rangeDisplay}) are{" "}
              <strong>{data.totalHours.toFixed(2)} hours</strong>, which is less than the required 7 hours.
            </Typography>

            {!!data.timeEntries.length && (
              <>
                <Typography level="body2" sx={{ mb: 1, fontWeight: "bold" }}>
                  Your time entries for that day:
                </Typography>
                <Box sx={{ maxHeight: "200px", overflowY: "auto", mb: 2 }}>
                  <List>
                    {data.timeEntries.map((entry) => (
                      <ListItem key={entry.time_entry_id}>
                        <ListItemContent>
                          <Typography fontSize="sm">
                            {entry.entry_date}: {entry.description || "No description"} — {entry.hours} hours
                          </Typography>
                        </ListItemContent>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </>
            )}

            <Button
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => setShowModal(false)}
              variant="solid"
              color="primary"
            >
              Acknowledge
            </Button>
          </>
        )}
      </Sheet>
    </Modal>
  );
}
