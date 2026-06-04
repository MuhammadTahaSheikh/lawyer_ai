import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import PhoneInput from "react-phone-number-input";
import {
  Box,
  Typography,
  Button,
  Select,
  Option,
  Divider,
  Table,
  Chip,
  CircularProgress,
  IconButton,
} from "@mui/joy";
import SendIcon from "@mui/icons-material/Send";
import FaxIcon from "@mui/icons-material/PrintOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";
import "react-phone-number-input/style.css";

const statusColorMap = {
  queued: "neutral",
  processing: "primary",
  sending: "primary",
  delivered: "success",
  failed: "danger",
  unknown: "warning",
};

const FaxTab = ({ caseId, documents, defaultFaxNumber }) => {
  const [recipientFax, setRecipientFax] = useState(defaultFaxNumber || "");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [faxHistory, setFaxHistory] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Build a flat list of documents with folder info
  const docOptions = (documents || []).map((d) =>
    typeof d === "string"
      ? { fileName: d, folder: "" }
      : { fileName: d.fileName, folder: d.folder || "" }
  );

  const fetchFaxHistory = useCallback(() => {
    axios
      .get(`/fax/case/${caseId}`)
      .then((res) => {
        setFaxHistory(res.data.faxes || []);
      })
      .catch((err) => {
        console.error("Error fetching fax history:", err);
      });
  }, [caseId]);

  // Load fax history on mount
  useEffect(() => {
    fetchFaxHistory();
  }, [fetchFaxHistory]);

  const handleSendFax = async () => {
    if (!selectedDoc) {
      setError("Please select a document to fax.");
      return;
    }
    if (!recipientFax) {
      setError("Please enter a recipient fax number.");
      return;
    }

    setError("");
    setSending(true);

    try {
      const payload = {
        case_id: caseId,
        document_name: selectedDoc.fileName,
        recipient_fax_number: recipientFax,
      };
      if (selectedDoc.folder) {
        payload.folder_name = selectedDoc.folder;
      }

      const res = await axios.post("/fax/send", payload);

      if (res.data.success) {
        setFaxHistory((prev) => {
          if (prev.some((f) => f.id === res.data.fax.id)) return prev;
          return [res.data.fax, ...prev];
        });
        setSelectedDoc(null);
        // Refresh history after a delay to pick up status updates
        setTimeout(fetchFaxHistory, 5000);
      }
    } catch (err) {
      console.error("Error sending fax:", err);
      setError(
        err.response?.data?.error || "Failed to send fax. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        p: { xs: 1.5, sm: 2 },
        gap: 2,
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        overflowX: "clip",
      }}
    >
      <Typography level="h3" startDecorator={<FaxIcon />}>
        Send Fax
      </Typography>

      {/* Document Selector */}
      <Box sx={{ width: "100%" }}>
        <Typography level="body-sm" sx={{ mb: 0.5 }}>
          Select Document
        </Typography>
        <Select
          placeholder="Choose a document to fax..."
          value={
            selectedDoc
              ? `${selectedDoc.folder}/${selectedDoc.fileName}`
              : null
          }
          onChange={(_, val) => {
            if (!val) {
              setSelectedDoc(null);
              return;
            }
            const doc = docOptions.find(
              (d) => `${d.folder}/${d.fileName}` === val
            );
            setSelectedDoc(doc || null);
          }}
          sx={{ width: "100%" }}
        >
          {docOptions.map((doc) => (
            <Option
              key={`${doc.folder}/${doc.fileName}`}
              value={`${doc.folder}/${doc.fileName}`}
            >
              {doc.folder ? `${doc.folder} / ${doc.fileName}` : doc.fileName}
            </Option>
          ))}
        </Select>
      </Box>

      {/* Fax Number Input */}
      <Box sx={{ width: "100%" }}>
        <Typography level="body-sm" sx={{ mb: 0.5 }}>
          Recipient Fax Number
        </Typography>
        <PhoneInput
          defaultCountry="US"
          placeholder="Enter fax number"
          value={recipientFax}
          onChange={setRecipientFax}
          international
          withCountryCallingCode
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: "10px 12px",
            width: "100%",
            boxSizing: "border-box",
            minHeight: 40,
          }}
        />
      </Box>

      {/* Error Message */}
      {error && (
        <Typography level="body-sm" color="danger">
          {error}
        </Typography>
      )}

      {/* Send Button */}
      <Button
        variant="solid"
        color="primary"
        startDecorator={
          sending ? <CircularProgress size="sm" /> : <SendIcon />
        }
        onClick={handleSendFax}
        disabled={sending}
        sx={{
          alignSelf: { xs: "stretch", sm: "flex-start" },
          width: { xs: "100%", sm: "auto" },
        }}
      >
        {sending ? "Sending..." : "Send Fax"}
      </Button>

      <Divider sx={{ my: 1 }} />

      {/* Fax History */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Typography level="h4">Fax History</Typography>
        <IconButton size="sm" variant="plain" onClick={fetchFaxHistory}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {faxHistory.length === 0 ? (
        <Typography level="body-sm" sx={{ color: "text.secondary" }}>
          No faxes sent for this case yet.
        </Typography>
      ) : (
        <>
          <Box
            sx={{
              display: { xs: "grid", md: "none" },
              gap: 1.25,
              width: "100%",
            }}
          >
            {faxHistory.map((fax) => (
              <Box
                key={fax.id}
                sx={{
                  p: 1.25,
                  borderRadius: "sm",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.body",
                }}
              >
                <Typography
                  level="body-sm"
                  sx={{ fontWeight: 600, mb: 0.75, wordBreak: "break-word" }}
                >
                  {fax.document_name}
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: 0.5,
                    columnGap: 1,
                    alignItems: "center",
                  }}
                >
                  <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                    Recipient:
                  </Typography>
                  <Typography level="body-sm" sx={{ wordBreak: "break-word" }}>
                    {fax.recipient_fax_number}
                  </Typography>
                  <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                    Status:
                  </Typography>
                  <Chip
                    size="sm"
                    variant="soft"
                    color={statusColorMap[fax.status] || "neutral"}
                    sx={{ width: "fit-content" }}
                  >
                    {fax.status}
                  </Chip>
                  <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                    Pages:
                  </Typography>
                  <Typography level="body-sm">{fax.pages_sent || "—"}</Typography>
                  <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                    Sent By:
                  </Typography>
                  <Typography level="body-sm" sx={{ wordBreak: "break-word" }}>
                    {fax.sent_by_name || fax.sent_by_uid || "—"}
                  </Typography>
                  <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                    Date:
                  </Typography>
                  <Typography level="body-sm">
                    {fax.created_at ? new Date(fax.created_at).toLocaleString() : "—"}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              overflowX: "hidden",
              display: { xs: "none", md: "block" },
              width: "100%",
            }}
          >
            <Table
              stripe="odd"
              hoverRow
              sx={{
                width: "100%",
                minWidth: 0,
                tableLayout: "fixed",
                "& th, & td": {
                  verticalAlign: "top",
                  whiteSpace: "normal",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                },
                "& th:nth-of-type(1), & td:nth-of-type(1)": { width: "27%" },
                "& th:nth-of-type(2), & td:nth-of-type(2)": { width: "16%" },
                "& th:nth-of-type(3), & td:nth-of-type(3)": { width: "12%" },
                "& th:nth-of-type(4), & td:nth-of-type(4)": { width: "8%" },
                "& th:nth-of-type(5), & td:nth-of-type(5)": { width: "15%" },
                "& th:nth-of-type(6), & td:nth-of-type(6)": { width: "22%" },
                "& td:nth-of-type(1)": {
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                },
              }}
            >
            <thead>
              <tr>
                <th>Document</th>
                <th>Recipient</th>
                <th>Status</th>
                <th>Pages</th>
                <th>Sent By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {faxHistory.map((fax) => (
                <tr key={fax.id}>
                  <td>{fax.document_name}</td>
                  <td>{fax.recipient_fax_number}</td>
                  <td>
                    <Chip
                      size="sm"
                      variant="soft"
                      color={statusColorMap[fax.status] || "neutral"}
                    >
                      {fax.status}
                    </Chip>
                  </td>
                  <td>{fax.pages_sent || "—"}</td>
                  <td>{fax.sent_by_name || fax.sent_by_uid || "—"}</td>
                  <td>
                    {fax.created_at
                      ? new Date(fax.created_at).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            </Table>
          </Box>
        </>
      )}
    </Box>
  );
};

FaxTab.propTypes = {
  caseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  documents: PropTypes.array,
  defaultFaxNumber: PropTypes.string,
};

export default FaxTab;
