import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Autocomplete, FormControl, FormLabel, Stack, TextField, Typography } from "@mui/joy";

export default function TicketCrmFields({ value, onChange }) {
  const [caseSearch, setCaseSearch] = useState("");
  const [cases, setCases] = useState([]);
  const [initialCases, setInitialCases] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCases = useCallback(async (search) => {
    setLoading(true);
    try {
      const res = await axios.get(`/cases?search=${encodeURIComponent(search)}`);
      const list = res.data?.cases || res.data || [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await fetchCases("");
      if (!cancelled) {
        setInitialCases(list);
        setCases(list);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchCases]);

  useEffect(() => {
    const term = caseSearch.trim();
    if (!term) {
      setCases(initialCases);
      return;
    }
    const t = setTimeout(async () => {
      const list = await fetchCases(term);
      setCases(list.slice(0, 8));
    }, 300);
    return () => clearTimeout(t);
  }, [caseSearch, initialCases, fetchCases]);

  const selectedCase =
    cases.find((c) => c.case_id === value?.caseId) ||
    (value?.caseId
      ? { case_id: value.caseId, name: value.caseName, case_name: value.caseName }
      : null);

  return (
    <Stack spacing={1.5}>
      <Typography level="body-sm" sx={{ color: "neutral.600" }}>
        Optional: link this ticket to a case in the CMS (helps technicians find context).
      </Typography>
      <FormControl>
        <FormLabel>Search case</FormLabel>
        <Autocomplete
          options={cases}
          loading={loading}
          getOptionLabel={(option) =>
            option?.name || option?.case_name || `Case #${option?.case_id || ""}`
          }
          isOptionEqualToValue={(option, selected) =>
            option?.case_id === selected?.case_id
          }
          value={selectedCase}
          onChange={(e, nextCase) => {
            onChange({
              caseId: nextCase?.case_id || null,
              caseName: nextCase?.name || nextCase?.case_name || "",
              clientId: nextCase?.client_id || null,
            });
            setCaseSearch(nextCase?.name || nextCase?.case_name || "");
          }}
          inputValue={caseSearch}
          onInputChange={(e, newInputValue) => setCaseSearch(newInputValue)}
          noOptionsText={loading ? "Loading..." : "No cases found"}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search case..."
              placeholder="Case name or number..."
            />
          )}
        />
      </FormControl>
      {value?.caseId && (
        <Typography level="body-sm">
          Linked case: <strong>{value.caseName}</strong> (#{value.caseId})
        </Typography>
      )}
    </Stack>
  );
}
