import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  Card, Typography, Avatar, Input,
  Button, Divider, Grid, FormLabel
} from "@mui/joy";
import { auth } from "../../firebase/firebase";
import EnrollPhone from "./EnrollPhone";

export default function ProfileEdit({ onSubmit }) {
  const { state } = useLocation();
  const locUser   = state?.user;
  const locImage  = state?.imageUrl;
  const uid       = auth.currentUser?.uid;

  const [user, setUser]                 = useState(locUser || {});
  const [profilePreview, setPreview]    = useState(locImage || "");
  const [profileFile, setProfileFile]   = useState(null);
  const [firstName, setFirst]           = useState(locUser?.first_name || "");
  const [lastName, setLast]             = useState(locUser?.last_name || "");
  const [email, setEmail]               = useState(locUser?.email || "");
  const [loading, setLoading]           = useState(false);

  // Track current blob URL for cleanup
  const blobUrlRef = useRef(null);
  const setPreviewSafe = (url) => {
    if (blobUrlRef.current && blobUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(blobUrlRef.current);
    }
    blobUrlRef.current = url;
    setPreview(url);
  };

  // Normalize absolute URLs to relative to avoid mixed content (http vs https)
  const toRelative = (url) => {
    if (!url) return "";
    try {
      const u = new URL(url, window.location.origin);
      if (u.origin === window.location.origin) return u.pathname + u.search;
      if (u.protocol === "http:" || u.protocol === "https:") return u.pathname + u.search;
    } catch {
      if (url.startsWith("/")) return url;
    }
    return url;
  };

  // Build headers for protected requests (API key, Firebase token, and uid)
  const getAuthHeaders = async () => {
    const token = await auth.currentUser?.getIdToken?.();
    const headers = {};
    if (process.env.REACT_APP_API_KEY) headers["x-api-key"] = process.env.REACT_APP_API_KEY;
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (uid) headers["x-user-uid"] = uid; // keep consistent with your server
    return headers;
  };

  // Fetch protected image with headers and return a blob URL
  const fetchProtectedImageAsBlobUrl = async (url) => {
    if (!url) return "";
    const normalized = toRelative(url);
    const headers = await getAuthHeaders();
    const res = await axios.get(normalized, { responseType: "blob", headers });
    return URL.createObjectURL(res.data);
  };

  // Helper: try to fetch staff_id by uid (use your actual API that returns staff_id)
  async function fetchUserByUid(theUid) {
    const r = await axios.get(`/users/${theUid}`);
    const base = r.data || {};
    if (base.staff_id) return base;

    // Fallback example (adjust to your actual route if needed)
    try {
      const s = await axios.get(`/staff/by-uid/${theUid}`);
      return { ...base, staff_id: s.data?.staff_id };
    } catch {
      return base; // no staff_id found
    }
  }

  useEffect(() => {
    // If state provided everything, we’re good
    if (locUser && locUser.staff_id) return;

    if (uid) {
      setLoading(true);
      fetchUserByUid(uid)
        .then((u) => {
          setUser(u);
          setFirst(u.first_name || "");
          setLast(u.last_name || "");
          setEmail(u.email || "");
        })
        .catch((e) => {
          console.error("Failed to fetch user by uid:", e);
        })
        .finally(() => setLoading(false));
    }
  }, [uid, locUser]);

  useEffect(() => {
    let cancelled = false;

    if (!locImage && uid) {
      axios
        .get(`/users/${uid}/profile-image`)
        .then(async (r) => {
          const apiUrl = r.data?.imageUrl || "";
          if (!cancelled && apiUrl) {
            try {
              const blobUrl = await fetchProtectedImageAsBlobUrl(apiUrl);
              if (!cancelled) setPreviewSafe(blobUrl);
            } catch {
              if (!cancelled) setPreviewSafe("");
            }
          } else if (!cancelled) {
            setPreviewSafe("");
          }
        })
        .catch(() => {
          if (!cancelled) setPreviewSafe("");
        });
    }

    return () => {
      cancelled = true;
      if (blobUrlRef.current && blobUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [locImage, uid]);

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewSafe(reader.result); // instant preview
      reader.readAsDataURL(file);
    }
  };

  const displayHandle = useMemo(() => {
    const base = firstName || user.first_name || "user";
    return `@${String(base).toLowerCase()}`;
  }, [firstName, user.first_name]);

  // Update basic info via /active_users_basic/:staffId
  const updateBasicInfo = async () => {
    const headers = await getAuthHeaders();
    const payload = {
      email: email || "",
      first_name: firstName || "",
      last_name: lastName || "",
    };
    await axios.put(
      `/active_users_basic/${user.staff_id}`,
      payload,
      { headers }
    );
  };

  const handleSubmit = async () => {
    if (!uid) {
      alert("No authenticated user.");
      return;
    }
    if (!user?.staff_id) {
      alert("Could not determine staff_id for this user.");
      return;
    }

    setLoading(true);
    try {
      // 1) Always update basic info
      await updateBasicInfo();

      // 2) Conditionally upload image only if a new file is selected
      if (profileFile) {
        const formData = new FormData();
        formData.append("media", profileFile);
        formData.append("name", `${firstName || ""} ${lastName || ""}`.trim());
        formData.append("description", "Profile Image");
        formData.append("assigned_date", new Date().toISOString());
        formData.append("uid", uid);

        const headers = await getAuthHeaders();
        const response = await axios.post(
          `/cases/${user.staff_id}/media`,
          formData,
          { headers: { ...headers, "Content-Type": "multipart/form-data" } }
        );

        if (response.status === 200) {
          const returnedUrl =
            response?.data?.imageUrl ||
            response?.data?.url ||
            response?.data?.path ||
            "";
          if (returnedUrl) {
            try {
              const blobUrl = await fetchProtectedImageAsBlobUrl(returnedUrl);
              setPreviewSafe(blobUrl);
            } catch {
              // ignore preview refresh failure
            }
          }
          onSubmit?.(response.data);
        } else {
          alert("Error uploading image: " + (response.data?.message || "Unknown"));
          setLoading(false);
          return;
        }
      }

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      const msg = (error?.response?.data?.message) || error?.message || "Unknown error";
      alert("Error updating profile: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={2} sx={{ p: { xs: 1.5, md: 4 } }}>
      <Grid xs={12} md={4}>
        <Card sx={{ textAlign: "center", p: { xs: 2, md: 3 } }}>
          <label htmlFor="upload-photo" style={{ cursor: "pointer" }}>
            <input
              id="upload-photo"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImage}
            />
            <Avatar 
              src={profilePreview} 
              sx={{ 
                width: { xs: 80, md: 100 }, 
                height: { xs: 80, md: 100 }, 
                mb: 1 
              }} 
            />
          </label>
          <Typography level="title-md" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
            {displayHandle}
          </Typography>
          <Typography level="body-sm" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
            {email}
          </Typography>
        </Card>

        <Card sx={{ mt: 2, p: { xs: 2, md: 3 } }}>
          <Typography level="title-sm" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
            <strong>Information</strong>
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
            Name: {(firstName || "")} {(lastName || "")}
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
            Email: {email}
          </Typography>
          {/* staff_id helper intentionally left out per your last code */}
        </Card>
      </Grid>

      <Grid xs={12} md={8}>
        <Card sx={{ p: { xs: 2, md: 3 } }}>
          <Typography level="title-md" sx={{ fontSize: { xs: '1rem', md: '1.125rem' } }}>
            User Settings
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={12} sm={6}>
              <FormLabel sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>Name</FormLabel>
              <Input 
                value={firstName} 
                onChange={(e) => setFirst(e.target.value)} 
                fullWidth 
                sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormLabel sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>Last Name</FormLabel>
              <Input 
                value={lastName} 
                onChange={(e) => setLast(e.target.value)} 
                fullWidth 
                sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
              />
            </Grid>
            <Grid xs={12}>
              <FormLabel sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>Email</FormLabel>
              <Input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                fullWidth 
                sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
              />
            </Grid>
          </Grid>

          <Button 
            sx={{ 
              mt: 2,
              fontSize: { xs: '0.875rem', md: '1rem' },
              px: { xs: 2, md: 3 },
              py: { xs: 0.75, md: 1 },
            }} 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? "Saving…" : "Save changes"}
          </Button>

          <Divider sx={{ my: { xs: 2, md: 3 } }}/>
          <Typography level="title-md" mb={1} sx={{ fontSize: { xs: '1rem', md: '1.125rem' } }}>
            Two‑Factor Authentication
          </Typography>
          <EnrollPhone />
        </Card>
      </Grid>
    </Grid>
  );
}