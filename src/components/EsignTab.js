// src/components/EsignTab.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DocusealBuilder } from "@docuseal/react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  Link,
} from "@mui/joy";

export default function EsignTab({ caseId: propCaseId, clientEmail }) {
  const { id: paramId } = useParams();
  const caseId = propCaseId || paramId;
  const API    = process.env.REACT_APP_BASE_URL;

  const [token, setToken]       = useState(null);
  const [loadingToken, setLoadingToken] = useState(true);
  const [templateId, setTemplateId]     = useState(null);
  const [sending, setSending]           = useState(false);
  const [sentAt, setSentAt]             = useState(null);
  const [signedDocs, setSignedDocs]     = useState([]);
  const [error, setError]               = useState(null);

  // ── 1) get builder token (includes caseId metadata)
  useEffect(() => {
    axios.post(`${API}/api/docuseal/builder_token`, { case_id: caseId })
      .then(r => setToken(r.data.token))
      .catch(e => setError("Couldn’t load e-sign builder"))
      .finally(() => setLoadingToken(false));
  }, [API, caseId]);

  // ── when user finishes uploading in builder, grab the template_id
  const onTemplateCreate = ({ template_id }) => {
    setTemplateId(template_id);
  };

  // ── 2) “Send to client” calls /api/docuseal/submission
  const sendToClient = async () => {
    setSending(true);
    try {
      // **you must have already uploaded your PDF** to case-documents and know its URL
      const document_url = `${API}/case-documents/${caseId}/my-uploaded-file.pdf`;
      await axios.post(
        `${API}/api/docuseal/submission`,
        { case_id: caseId, document_url, email: clientEmail },
        { headers: { "Content-Type": "application/json" } }
      );
      setSentAt(new Date().toISOString());
      fetchSigned();
    } catch (e) {
      console.error(e);
      setError("Send failed");
    } finally {
      setSending(false);
    }
  };

  // ── 3) Poll signature status
  const fetchSigned = () => {
    axios.get(`${API}/api/cases/${caseId}/esign/status`)
      .then(r => setSignedDocs(r.data.documents))
      .catch(e => setError("Status fetch failed"));
  };

  useEffect(() => {
    if (sentAt) {
      const iv = setInterval(fetchSigned, 15000);
      return () => clearInterval(iv);
    }
  }, [sentAt]);

  return (
    <Box p={2}>
      <Typography level="h4">E-Sign</Typography>
      {error && <Alert color="danger">{error}</Alert>}
      {loadingToken
        ? <CircularProgress />
        : !templateId
          ? <DocusealBuilder token={token} onTemplateCreate={onTemplateCreate} />
          : sentAt
            ? (
              <>
                <Alert color="info">Sent at {new Date(sentAt).toLocaleString()}</Alert>
                <Box mt={3}>
                  <Typography level="h5">Signed PDFs</Typography>
                  {signedDocs.length
                    ? (
                      <List>
                        {signedDocs.map((d,i)=>(
                          <ListItem key={i}>
                            <Link href={d.document_url} target="_blank">Download</Link>
                            {" • "} signed {new Date(d.signed_at).toLocaleString()}
                          </ListItem>
                        ))}
                      </List>
                    )
                    : <Typography>No signatures yet.</Typography>
                  }
                </Box>
              </>
            )
            : (
              <Button
                variant="solid"
                onClick={sendToClient}
                disabled={sending}
                sx={{ mt: 2 }}
              >
                {sending ? "Sending…" : "Send to Client"}
              </Button>
            )
      }
    </Box>
  );
}