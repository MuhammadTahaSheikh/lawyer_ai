import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Sheet, Table, IconButton,
  Alert, CircularProgress, Chip,
} from "@mui/joy";
import { usePortalAuth } from "../../context/PortalAuthContext";
import { apiUrl } from "../../config/apiBaseUrl";

function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function PortalDashboard() {
  const { portalUser, portalToken, logoutPortal } = usePortalAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef();

  useEffect(() => {
    if (!portalToken) { navigate("/portal/login"); return; }
    fetchDocuments();
  }, [portalToken]);

  const authHeaders = () => ({
    Authorization: `Bearer ${portalToken}`,
  });

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/portal/documents"), {
        headers: authHeaders(),
      });
      if (res.status === 401) { logoutPortal(); navigate("/portal/login"); return; }
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch {
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("documents", f));

    try {
      const res = await fetch(apiUrl("/portal/documents"), {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setSuccess(`${data.uploaded.length} file(s) uploaded successfully.`);
      fetchDocuments();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDownload = async (doc) => {
    try {
      const res = await fetch(
        apiUrl(`/portal/documents/${doc.id}/download`),
        { headers: authHeaders() }
      );
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.original_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download document.");
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.original_name}"?`)) return;
    try {
      const res = await fetch(
        apiUrl(`/portal/documents/${doc.id}`),
        { method: "DELETE", headers: authHeaders() }
      );
      if (!res.ok) throw new Error("Delete failed");
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch {
      setError("Failed to delete document.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography level="h3">My Documents</Typography>
          <Typography level="body-sm" textColor="neutral.500">
            Welcome, {portalUser?.first_name || portalUser?.email}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={handleUpload}
          />
          <Button
            variant="solid"
            loading={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Documents
          </Button>
          <Button variant="outlined" color="neutral" onClick={() => { logoutPortal(); navigate("/portal/login"); }}>
            Sign Out
          </Button>
        </Box>
      </Box>

      {error && <Alert color="danger" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert color="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {portalUser?.case_id && (
        <Alert color="primary" sx={{ mb: 2 }}>
          Your uploads are automatically added to your case file and visible to your legal team.
        </Alert>
      )}

      <Sheet variant="outlined" sx={{ borderRadius: "md", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress />
          </Box>
        ) : documents.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography level="body-lg" textColor="neutral.400">No documents yet.</Typography>
            <Typography level="body-sm" textColor="neutral.400" mt={1}>
              Click "Upload Documents" to get started.
            </Typography>
          </Box>
        ) : (
          <Table hoverRow>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {doc.original_name}
                      {doc.case_document_id && (
                        <Chip size="sm" color="primary" variant="soft">In Case File</Chip>
                      )}
                    </Box>
                  </td>
                  <td>{formatBytes(doc.size)}</td>
                  <td>{formatDate(doc.uploaded_at)}</td>
                  <td>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton size="sm" variant="plain" onClick={() => handleDownload(doc)} title="Download">
                        ⬇
                      </IconButton>
                      <IconButton size="sm" variant="plain" color="danger" onClick={() => handleDelete(doc)} title="Delete">
                        🗑
                      </IconButton>
                    </Box>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Sheet>
    </Box>
  );
}
