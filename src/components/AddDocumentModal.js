// src/components/AddDocumentModal.js

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  Checkbox,
  Textarea,
  Autocomplete,
  Select,
  Option,
  LinearProgress
} from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import { v4 as uuidv4 } from "uuid";
import { auth } from "../firebase/firebase";

const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB

export default function AddDocumentModal({
  open,
  onClose,
  defaultCaseId,
  fetchDocuments,
  cases: initialCases,
  singleCase,
  caseId: propCaseId,
  selectedFolder: incomingSelectedFolder
}) {
  // Helper to assemble auth headers when needed (fallback to ensure requests carry token)
  const getAuthHeaders = async () => {
    const headers = {};
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken?.();
        if (token) headers.Authorization = `Bearer ${token}`;
        if (user.uid) headers['x-user-uid'] = user.uid;
      }
    } catch (e) {
      // ignore token retrieval errors; interceptor may handle auth
    }
    return headers;
  };
  // Form state
  const [notLinked, setNotLinked] = useState(false);
  const [assignedDate, setAssignedDate] = useState("");
  const [fileSource, setFileSource] = useState([]);
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cases, setCases] = useState(initialCases || []);
  const [loadingCases, setLoadingCases] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [folderOptions, setFolderOptions] = useState([]);
const [currentUserName, setCurrentUserName] = useState(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);
  const currentUser = auth.currentUser?.uid;
  // const currentUserName = auth.currentUser?.displayName;
useEffect(() => {
  if (!open) return;

  const uid = auth.currentUser?.uid;
  const fbName = auth.currentUser?.displayName;

  if (fbName) {
    setCurrentUserName(fbName);
    return;
  }

  if (uid) {
    axios.get(`/users/${uid}`)
      .then(res => {
        // Your console shows this shape:
        // { staff_id, uid, first_name, last_name, email }
        const { first_name, last_name, email, uid } = res.data;
        const full =
          [first_name, last_name].filter(Boolean).join(" ").trim()
          || email
          || uid
          || "Unknown User";
        setCurrentUserName(full);
      })
      .catch(err => {
        console.error("Failed to fetch user from active_users:", err);
        setCurrentUserName("Unknown User");
      });
  }
}, [open]);


  // Initialize when modal opens
  useEffect(() => {
    if (!open) return;
    setFileSource([]);
    setTags("");
    setDescription("");
    setAssignedDate("");
    setSearchTerm("");
    setSelectedFolder(incomingSelectedFolder || "");
    setNotLinked(false);
    setSelectedCase(null);

    const idToUse = propCaseId || defaultCaseId;
    if (idToUse && initialCases?.length) {
      const sel = initialCases.find(c => c.case_id === idToUse);
      if (sel) {
        setSelectedCase(sel);
        setSearchTerm(sel.name);
      }
    }
  }, [open, propCaseId, defaultCaseId, initialCases, incomingSelectedFolder]);

  useEffect(() => {
    if (!open) return;
  
    // If parent passed us a singleCase object, inject it into our options and select it
    if (singleCase) {
      setCases(prev => {
        if (prev.some(c => c.case_id === singleCase.case_id)) return prev;
        return [...prev, singleCase];
      });
      setSelectedCase(singleCase);
      setSearchTerm(singleCase.name || `Case #${singleCase.case_id}`);
    }
    // Otherwise if we only have an ID, fetch that case and select it
    else if (defaultCaseId && !selectedCase) {
      (async () => {
        try {
          const headers = await getAuthHeaders();
          const res = await axios.get(`/cases/${defaultCaseId}`, { headers });
          const c = res.data; // { case_id, name, … }
          setCases(prev => [...prev, c]);
          setSelectedCase(c);
          setSearchTerm(c.name);
        } catch (err) {
          // ignore fetch errors (could be 401 if token missing)
          // console.debug('Could not fetch default case', err?.response?.status);
        }
      })();
    }
  }, [open, singleCase, defaultCaseId]);

  // Fetch folder options when case changes
useEffect(() => {
  if (!open || !selectedCase?.case_id) return;

  const flattenFolders = (folders, result = [], depth = 0) => {
    for (const f of folders) {
      result.push({
        path: f.path,
        label: f.name || f.path.split("/").pop(),
        depth
      });
      if (Array.isArray(f.children) && f.children.length > 0) {
        flattenFolders(f.children, result, depth + 1);
      }
    }
    return result;
  };

  (async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(`/cases/${selectedCase.case_id}/folders`, { headers });
      const flat = flattenFolders(res.data.folders || []);
      setFolderOptions(flat);
    } catch (e) {
      setFolderOptions([]);
    }
  })();
}, [open, selectedCase]);



  // Search cases
  useEffect(() => {
    if (!open || notLinked) return;
    const timer = setTimeout(() => {
      if (searchTerm) fetchCases(searchTerm);
      else setCases(initialCases || []);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, open, notLinked, initialCases]);

  const fetchCases = async term => {
    setLoadingCases(true);
    try {
      const res = await axios.get(`/cases?search=${encodeURIComponent(term)}`);
      setCases(res.data.cases || []);
    } catch {
      setCases([]);
    } finally {
      setLoadingCases(false);
    }
  };

  const handleFileChange = e => {
    setFileSource(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    const finalCaseId = notLinked ? "unlinked" : selectedCase?.case_id;
    if (!finalCaseId && !notLinked) {
      alert("Please select a case or check 'Not linked'.");
      return;
    }
    if (!fileSource.length) {
      alert("Please select at least one file.");
      return;
    }
    if (!currentUser) {
      alert("You must be signed in.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // total bytes across all files
    const totalBytes = fileSource.reduce((sum, f) => sum + f.size, 0);
    let uploadedAcc = 0;

    try {
      for (const file of fileSource) {
        if (file.size < CHUNK_SIZE) {
          // small file: direct upload
          const form = new FormData();
          form.append("documents", file);
          form.append("name", file.name);
          form.append("description", description);
          form.append("assigned_date", assignedDate);
          form.append("tags", tags);
          form.append("folder", selectedFolder || "");
        form.append("uploader_name", currentUserName);
          const uploadHeaders = await getAuthHeaders();
          await axios.post(
            `/cases/${finalCaseId}/documents`,
            form,
            {
              headers: {
                ...uploadHeaders,
                "x-user-uid":    currentUser,
                "x-folder-name": selectedFolder || "",
                "Content-Type":  "multipart/form-data"
              },
              onUploadProgress: evt => {
                // update the cumulative progress
                const cumul = uploadedAcc + evt.loaded;
                setUploadProgress(Math.min(100, (cumul / totalBytes) * 100));
              }
            }
          );
        
          uploadedAcc += file.size;
        }else {
          // large file: chunked upload
          const fileId = uuidv4();
          const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
          for (let idx = 0; idx < totalChunks; idx++) {
            const start = idx * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const blob = file.slice(start, end);
            const form = new FormData();
            form.append("fileId", fileId);
            form.append("chunkIndex", idx);
            form.append("totalChunks", totalChunks);
            form.append("fileName", file.name);
            form.append("chunk", blob, file.name);
            const chunkHeaders = await getAuthHeaders();
            await axios.post(
              `/cases/${finalCaseId}/documents/chunk`,
              form,
              {
                headers: {
                  ...chunkHeaders,
                  "x-user-uid": currentUser,
                  "x-folder-name": selectedFolder || ""
                },
                onUploadProgress: evt => {
                  const cumul = uploadedAcc + evt.loaded;
                  setUploadProgress(Math.min(100, (cumul / totalBytes) * 100));
                }
              }
            );
            uploadedAcc += blob.size;
          }
          // stitch on server
          const completeHeaders = await getAuthHeaders();
          await axios.post(
            `/cases/${finalCaseId}/documents/complete`,
            // { fileId, fileName: file.name },
            { fileId, fileName: file.name, uploader_name: currentUserName },
            {
              headers: {
                ...completeHeaders,
                "x-user-uid":    currentUser,
                "x-folder-name": selectedFolder || ""
              }
            }
          );
        }
      }

      alert("Upload successful!");
      fetchDocuments?.();
      onClose();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. See console for details.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          maxWidth: "80vw",
          maxHeight: "80vh",
          overflowY: "auto",
          p: 2
        }}
      >
        <ModalClose onClick={onClose} />
        <Typography level="h5" mb={2}>
          Upload New Document
        </Typography>

        {/* Case Link */}
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Case Link</FormLabel>
          <Checkbox
            label="Not linked to a case"
            checked={notLinked}
            onChange={e => setNotLinked(e.target.checked)}
            disabled={uploading}
          />
          <Autocomplete
            fullWidth
            options={cases}
            getOptionLabel={opt => opt.name || `Case #${opt.case_id}`}
            value={selectedCase}
            onChange={(e, v) => {
              setSelectedCase(v);
              setSearchTerm(v?.name || "");
            }}
            inputValue={searchTerm}
            onInputChange={(e, v) => setSearchTerm(v)}
            renderInput={params => (
              <Input
                {...params}
                placeholder="Search case..."
                disabled={notLinked || loadingCases || uploading}
              />
            )}
            disabled={notLinked}
            loading={loadingCases}
          />
        </FormControl>

        {/* Assigned Date */}
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Assigned Date</FormLabel>
          <Input
            type="date"
            value={assignedDate}
            onChange={e => setAssignedDate(e.target.value)}
            disabled={uploading}
          />
        </FormControl>

        {/* File Source */}
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Source</FormLabel>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
            >
              Choose File(s)
            </Button>
            <Typography level="body2">
              {fileSource.length
                ? fileSource.map(f => f.name).join(", ")
                : "No files selected"}
            </Typography>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
              multiple
              disabled={uploading}
            />
          </Box>
        </FormControl>

        {/* Tags */}
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Tags</FormLabel>
          <Input
            placeholder="Enter tags"
            value={tags}
            onChange={e => setTags(e.target.value)}
            disabled={uploading}
          />
        </FormControl>

        {/* Folder */}
        {folderOptions.length > 0 && (
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Folder</FormLabel>
            <Select
              placeholder="Select folder"
              value={selectedFolder}
              onChange={(e, v) => setSelectedFolder(v)}
              disabled={uploading}
              slotProps={{
        listbox: {
          sx: {
            maxHeight: 300,
            overflowY: "auto",
            width: "100%",
          },
        },
      }}
            >
              <Option value="">None</Option>
              {folderOptions.map(f => (
  <Option
    key={f.path}
    value={f.path}
    sx={{ pl: `${f.depth * 1.5 + 1}rem` }}
  >
    {f.label}
  </Option>
))}

            </Select>
          </FormControl>
        )}

        {/* Description */}
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Description</FormLabel>
          <Textarea
            minRows={2}
            placeholder="Document description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={uploading}
          />
        </FormControl>

        {/* Progress */}
        {uploading && (
          <Box sx={{ mb: 2 }}>
            <Typography level="body2" mb={1}>
              Uploading… {Math.round(uploadProgress)}%
            </Typography>
            <LinearProgress
              determinate
              variant="soft"
              value={uploadProgress}
            />
          </Box>
        )}

        {/* Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1
          }}
        >
          <Button onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            startDecorator={<AddIcon />}
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading…" : "Upload Document"}
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
}