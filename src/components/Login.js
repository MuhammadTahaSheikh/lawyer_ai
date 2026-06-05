import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  getRecaptchaVerifier,
} from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Input,
  FormControl,
  FormLabel,
  Alert,
} from "@mui/joy";
import Lottie from "lottie-react";
import wavingAnimation from "../animations/waving-hand-sign.json";
import { Typewriter } from "react-simple-typewriter";
import axios from "axios";

const TEAM_PHOTO_FILES = [
  "Abdul-Rafay-Razzaq.jpg",
  "Ahmad.jpg",
  "Aqib.jpg",
  "Arslan.jpg",
  "Asif.jpg",
  "Hassan-Shoail.jpg",
  "Humayun.jpg",
  "M-Hamza.jpg",
  "Mubsher-Saeed.jpg",
  "Mutahir-ul-haq.jpg",
  "Osama-Razzaq.jpg",
  "Salar.jpg",
  "Sumair.jpg",
];

const allImages = TEAM_PHOTO_FILES.map((file) => `/${file}`);

async function checkUserEnabled(email) {
  const backendUrl = process.env.REACT_APP_BASE_URL;
  const response = await axios.get(
    `${backendUrl}/users/by-email/${encodeURIComponent(email)}`,
    { headers: { "x-api-key": process.env.REACT_APP_API_TOKEN } }
  );
  if (response.data.disabled && String(response.data.disabled).toLowerCase() === "yes") {
    return false;
  }
  return true;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  React.useEffect(() => {
    getRecaptchaVerifier();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(null, email, password);

      try {
        const enabled = await checkUserEnabled(user.email);
        if (!enabled) {
          await signOut();
          setError("Your account has been disabled. Please contact your administrator.");
          return;
        }
      } catch (apiError) {
        if (apiError.response?.status === 404) {
          setError(
            "No staff profile found for this email. Contact your administrator."
          );
          await signOut();
          return;
        }
        console.error("Error checking user status:", apiError);
      }

      nav("/");
    } catch (err) {
      const msg = err.message || "Login failed";
      if (
        err.code === "invalid_credentials" ||
        msg.includes("Invalid login") ||
        err.code === "auth/invalid-credential"
      ) {
        setError(
          "Invalid email or password for Supabase Auth. Your Firebase password does not transfer — ask an admin to run the user import or reset your password in Supabase (Authentication → Users)."
        );
      } else if (err.code === "email_not_confirmed") {
        setError(
          "Email not confirmed yet. Check your inbox for the Supabase confirmation link, or ask an admin to disable “Confirm email” under Authentication → Providers."
        );
      } else if (err.code === "auth/user-not-found") {
        setError("No account found for this email. Ask an admin to create your Supabase login.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [[], [], []];
  allImages.forEach((img, idx) => {
    columns[idx % 3].push(img);
  });

  const getAnim = (idx) => ({
    vertical: idx === 1 ? "scrollDown 30s linear infinite" : "scrollUp 30s linear infinite",
    horizontal: idx === 1 ? "scrollXLeft 30s linear infinite" : "scrollXRight 30s linear infinite",
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
        "@media (max-width:1024px)": { flexDirection: "column" },
        background:
          "linear-gradient(90deg, rgba(26,43,73,1) 0%, rgba(12,33,61,1) 50%, rgba(18,18,17,1) 100%)",
      }}
    >
      <Box
        sx={{
          flexBasis: "40%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
          "@media (max-width:1024px)": { flexBasis: "100%" },
        }}
      >
        <Box sx={{ mb: 2, textAlign: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
            <Typography level="h5" sx={{ color: "#fff", fontSize: "1.5rem", mr: 1 }}>
              Welcome!
            </Typography>
            <Lottie animationData={wavingAnimation} style={{ width: 40, height: 40 }} />
          </Box>
        </Box>

        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{
            maxWidth: "90%",
            width: 550,
            p: 4,
            borderRadius: "30px",
            boxShadow: "md",
            background: "white",
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="Logo"
            sx={{
              width: 40,
              mx: "auto",
              mb: 2,
              backgroundColor: "#1a2c49",
              p: 1,
              borderRadius: "50%",
              display: "block",
            }}
          />

          <Typography level="h4" sx={{ mb: 2, textAlign: "center" }}>
            Sign In
          </Typography>
          {error && <Alert color="danger" sx={{ mb: 2 }}>{error}</Alert>}

          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </FormControl>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </FormControl>

          <Button
            type="submit"
            fullWidth
            loading={loading}
            sx={{ backgroundColor: "#1a2b49", color: "#fff" }}
          >
            Login
          </Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography sx={{ color: "#fff", fontSize: "1.2rem" }}>
            <Typewriter
              words={["Property Damage", "Personal Injury", "SSDI Claims", "Employment Law"]}
              loop={0}
              cursor
              cursorStyle="_"
              typeSpeed={70}
              deleteSpeed={50}
              delaySpeed={1000}
            />
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          flexBasis: "60%",
          display: "flex",
          overflow: "hidden",
          height: "100vh",
          "@media (max-width:1024px)": { flexBasis: "100%", height: "auto", flexDirection: "column", mt: 4 },
        }}
      >
        {columns.map((imgs, idx) => {
          const anim = getAnim(idx);
          return (
            <Box
              key={idx}
              sx={{
                flex: 1,
                overflow: "hidden",
                mr: idx < 2 ? 2 : 0,
                "@media (max-width:1024px)": { mb: 4, mr: 0, flex: "none", width: "100%" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  "@keyframes scrollUp": {
                    "0%": { transform: "translateY(0)" },
                    "100%": { transform: "translateY(-50%)" },
                  },
                  "@keyframes scrollDown": {
                    "0%": { transform: "translateY(-50%)" },
                    "100%": { transform: "translateY(0)" },
                  },
                  "@keyframes scrollXLeft": {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(-50%)" },
                  },
                  "@keyframes scrollXRight": {
                    "0%": { transform: "translateX(-50%)" },
                    "100%": { transform: "translateX(0)" },
                  },
                  animation: anim.vertical,
                  "@media (max-width:1024px)": {
                    flexDirection: "row",
                    animation: anim.horizontal,
                  },
                 filter: "grayscale(1)",
                }}
              >
                {[...imgs, ...imgs].map((src, i) => (
                  <Box
                    key={i}
                    component="img"
                    src={src}
                    alt={src.replace(/^\//, "").replace(/\.(jpe?g|png)$/i, "").replace(/-/g, " ")}
                    sx={{ width: { xs: "50%", md: "100%" }, mb: { md: 2, xs: 0 }, borderRadius: 2, display: "block" }}
                  />
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
