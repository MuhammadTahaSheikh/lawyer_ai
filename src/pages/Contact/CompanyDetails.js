import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import {
  Box,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Modal,
  ModalDialog,
  ModalClose,
  FormControl,
  FormLabel,
  Autocomplete,
  Select,
  Option,
  Input,
  Textarea,
} from "@mui/joy";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddCompanyModal from "../../components/AddCompanyModal";
import AddDocumentModal from "../../components/AddDocumentModal";
import TaskModal from "../../components/taskModal";
import AddEventForm from "../../components/AddEventForm";
import AddTimeEntryModal from "../../components/AddTimeEntryModal";
import CompanyDetailsSidebar from "./components/CompanyDetailsSidebar";
import CompanyDetailsTabs from "./components/CompanyDetailsTabs";
import { auth } from "../../firebase/firebase";

function stripHtml(html) {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function truncate(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

function timeEntryBatchId(e) {
  const raw =
    e?.company_time_batch_id ??
    e?.companyTimeBatchId ??
    e?.COMPANY_TIME_BATCH_ID;
  if (raw == null) return null;
  const s = String(raw).trim();
  return s.length ? s : null;
}

/** Max spread between created_at values in a group to treat as one company-wide save (sequential POSTs). */
const COMPANY_TIME_ENTRY_BATCH_SPREAD_MS = 2 * 60 * 1000;

function groupCreatedSpreadMs(group) {
  const ts = group
    .map((x) => new Date(x.created_at || x.createdAt || 0).getTime())
    .filter((t) => !Number.isNaN(t) && t > 0);
  if (ts.length < 2) return Number.POSITIVE_INFINITY;
  return Math.max(...ts) - Math.min(...ts);
}

function normalizeTimeEntryDescription(d) {
  return String(d || "").trim().replace(/\s+/g, " ");
}

function timeEntryDateKey(e) {
  if (!e.entry_date) return "";
  const d = new Date(e.entry_date);
  if (Number.isNaN(d.getTime())) return String(e.entry_date);
  return d.toISOString().split("T")[0];
}

/** Normalize billable for fingerprinting (MySQL often returns 0/1; JS uses false/true). */
function timeEntryBillableKey(e) {
  const b = e.billable;
  if (b === false || b === 0 || b === "0") return "0";
  return "1";
}

function timeEntryFingerprint(e) {
  const hoursN = Number(e.hours);
  const rateN = Number(e.rate);
  return [
    timeEntryDateKey(e),
    String(e.activity_name || ""),
    Number.isFinite(hoursN) ? String(hoursN) : String(e.hours ?? ""),
    normalizeTimeEntryDescription(e.description),
    String(e.staff_id ?? ""),
    Number.isFinite(rateN) ? String(rateN) : String(e.rate ?? ""),
    timeEntryBillableKey(e),
    String(e.flat_fee ?? "").trim().toLowerCase(),
  ].join("\u001f");
}

function timeEntryLineTotal(e) {
  const r = Number(e.rate) || 0;
  const h = Number(e.hours) || 0;
  const ft = String(e.flat_fee || "").toLowerCase();
  if (ft === "flat") return r;
  return r * h;
}

/** Company tab totals: one company-wide submission (same batch id, or same fingerprint on every case) counts once for hours/amount. */
function computeCompanyTimeRollup(entries, companyCaseIds) {
  const empty = {
    logicalCount: 0,
    totalHours: 0,
    totalMoney: 0,
    billableMoney: 0,
    nonBillableMoney: 0,
    rowCount: 0,
  };
  if (!entries?.length) return empty;

  const companySet = new Set(companyCaseIds.map(String));
  const nCompany = companySet.size;

  const batchGroups = new Map();
  const unbatched = [];

  for (const e of entries) {
    const bid = timeEntryBatchId(e);
    if (bid) {
      const k = String(bid);
      if (!batchGroups.has(k)) batchGroups.set(k, []);
      batchGroups.get(k).push(e);
    } else {
      unbatched.push(e);
    }
  }

  let totalHours = 0;
  let totalMoney = 0;
  let billableMoney = 0;
  let nonBillableMoney = 0;
  let logicalCount = 0;
  const consumedIds = new Set();

  const addLogicalFromRep = (rep) => {
    logicalCount += 1;
    const h = Number(rep.hours) || 0;
    const money = timeEntryLineTotal(rep);
    totalHours += h;
    totalMoney += money;
    if (timeEntryBillableKey(rep) === "1") {
      billableMoney += money;
    } else {
      nonBillableMoney += money;
    }
  };

  for (const [, group] of batchGroups) {
    if (!group.length) continue;
    addLogicalFromRep(group[0]);
    group.forEach((x) => consumedIds.add(String(x.time_entry_id)));
  }

  const fpMap = new Map();
  for (const e of unbatched) {
    const fp = timeEntryFingerprint(e);
    if (!fpMap.has(fp)) fpMap.set(fp, []);
    fpMap.get(fp).push(e);
  }

  for (const [, group] of fpMap) {
    if (group.length < 2 || nCompany < 2) continue;
    const casesInGroup = new Set(group.map((e) => String(e.case_id)));
    const atMostOneRowPerCase = casesInGroup.size === group.length;
    if (!atMostOneRowPerCase) continue;
    if (![...casesInGroup].every((cid) => companySet.has(cid))) continue;

    const coversEveryLinkedCase =
      casesInGroup.size === nCompany &&
      group.length === nCompany &&
      [...companySet].every((id) => casesInGroup.has(id));

    const likelySameCompanyWideSave =
      groupCreatedSpreadMs(group) <= COMPANY_TIME_ENTRY_BATCH_SPREAD_MS;

    if (coversEveryLinkedCase || likelySameCompanyWideSave) {
      addLogicalFromRep(group[0]);
      group.forEach((x) => consumedIds.add(String(x.time_entry_id)));
    }
  }

  for (const e of unbatched) {
    if (consumedIds.has(String(e.time_entry_id))) continue;
    addLogicalFromRep(e);
  }

  return {
    logicalCount,
    totalHours,
    totalMoney,
    billableMoney,
    nonBillableMoney,
    rowCount: entries.length,
  };
}

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cameFrom = location.state?.from;
  const [company, setCompany] = useState(location.state?.company || null);
  const [loading, setLoading] = useState(!location.state?.company);
  const [activeTab, setActiveTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsLoadingMore, setEventsLoadingMore] = useState(false);
  const [eventsPagination, setEventsPagination] = useState({});
  const [eventsSourceMode, setEventsSourceMode] = useState("company");
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsLoadingMore, setDocumentsLoadingMore] = useState(false);
  const [documentsPagination, setDocumentsPagination] = useState({});
  const [documentsSourceMode, setDocumentsSourceMode] = useState("company");
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksLoadingMore, setTasksLoadingMore] = useState(false);
  const [tasksPagination, setTasksPagination] = useState({});
  const [tasksSourceMode, setTasksSourceMode] = useState("company");
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesLoadingMore, setNotesLoadingMore] = useState(false);
  const [notesPagination, setNotesPagination] = useState({});
  const [notesSourceMode, setNotesSourceMode] = useState("company");
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [timeEntriesLoading, setTimeEntriesLoading] = useState(false);
  const [timeEntriesLoadingMore, setTimeEntriesLoadingMore] = useState(false);
  const [timeEntriesPagination, setTimeEntriesPagination] = useState({});
  const [timeEntriesSourceMode, setTimeEntriesSourceMode] = useState("company");
  /** All time rows for company cases — used only for rollup totals (full fetch, not paginated list). */
  const [timeEntriesAllForRollup, setTimeEntriesAllForRollup] = useState([]);
  const [timeEntriesTotalsLoading, setTimeEntriesTotalsLoading] = useState(false);
  const [addTimeEntryOpen, setAddTimeEntryOpen] = useState(false);
  const [addCaseOpen, setAddCaseOpen] = useState(false);
  const [availableCases, setAvailableCases] = useState([]);
  const [selectedCases, setSelectedCases] = useState([]);
  const [caseSearch, setCaseSearch] = useState("");
  const [addingCase, setAddingCase] = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [addingContact, setAddingContact] = useState(false);
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [addDocumentOpen, setAddDocumentOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [removingCaseId, setRemovingCaseId] = useState(null);
  const [removingContactId, setRemovingContactId] = useState(null);
  const [noteCaseId, setNoteCaseId] = useState("");
  const [noteSubject, setNoteSubject] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split("T")[0]);
  const notesFetchInFlightRef = useRef(false);
  const notesFetchKeyRef = useRef("");

  const fetchCompany = async () => {
    setLoading(true);
    try {
      // The single-company endpoint doesn't return cases/clients,
      // so search through the paginated list endpoint which includes them
      let page = 1;
      let found = null;
      while (!found) {
        const res = await axios.get(`/companies?page=${page}`);
        const match = res.data.companies?.find(
          (c) => String(c.id) === String(id)
        );
        if (match) {
          found = match;
        } else if (
          !res.data.companies?.length ||
          page * 20 >= res.data.total
        ) {
          break;
        } else {
          page++;
        }
      }

      if (found) {
        setCompany(found);
      } else {
        // Fallback to single endpoint (without cases/clients)
        const res = await axios.get(`/companies/${id}`);
        setCompany(res.data);
      }
    } catch (error) {
      console.error("Error fetching company details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (caseIds) => {
    if (!caseIds || caseIds.length === 0) return;
    setActivitiesLoading(true);
    try {
      const allActivities = [];
      for (const caseId of caseIds) {
        try {
          const res = await axios.get(`/cases/${caseId}/recent-activity`);
          if (Array.isArray(res.data)) {
            allActivities.push(...res.data);
          }
        } catch {
          // skip failed case
        }
      }
      allActivities.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setActivities(allActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchEvents = async (caseIds) => {
    if (!caseIds || caseIds.length === 0) return;
    setEventsLoading(true);
    try {
      const start = moment().subtract(365, "days").toISOString();
      const end = moment().add(365, "days").toISOString();
      const uniqueCaseIds = Array.from(new Set(caseIds.map((c) => String(c))));

      const res = await axios.get(`/companies/${id}/events`, {
        params: { page: 1, limit: 20, start, end, case_ids: uniqueCaseIds.join(",") },
      });
      const fetchedEvents = Array.isArray(res.data?.events) ? res.data.events : [];
      const totalEvents = typeof res.data?.totalEvents === "number" ? res.data.totalEvents : null;
      if (fetchedEvents.length === 0 && uniqueCaseIds.length > 0) {
        throw new Error("Empty company events result, using fallback.");
      }
      fetchedEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
      setEvents(fetchedEvents);
      setEventsPagination({
        __company__: {
          nextPage: 2,
          loaded: fetchedEvents.length,
          total: totalEvents,
          hasMore: totalEvents !== null ? fetchedEvents.length < totalEvents : fetchedEvents.length === 20,
        },
      });
      setEventsSourceMode("company");
    } catch (error) {
      try {
        const start = moment().subtract(365, "days").toISOString();
        const end = moment().add(365, "days").toISOString();
        const res = await axios.get("/events", { params: { start, end } });
        const caseIdSet = new Set(caseIds.map(String));
        const filtered = (res.data || []).filter(
          (ev) => ev.case_id && caseIdSet.has(String(ev.case_id))
        );
        filtered.sort((a, b) => new Date(a.start) - new Date(b.start));
        setEvents(filtered);
        setEventsPagination({});
        setEventsSourceMode("legacy");
      } catch (fallbackError) {
        console.error("Error fetching events:", fallbackError);
      }
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchMoreEvents = async () => {
    if (eventsLoadingMore || eventsLoading) return;
    if (eventsSourceMode !== "company") return;

    const meta = eventsPagination.__company__;
    if (!meta?.hasMore) return;

    setEventsLoadingMore(true);
    try {
      const start = moment().subtract(365, "days").toISOString();
      const end = moment().add(365, "days").toISOString();
      const caseIds = (company?.cases || []).map((c) => String(c.id));
      const res = await axios.get(`/companies/${id}/events`, {
        params: {
          page: meta.nextPage || 1,
          limit: 20,
          start,
          end,
          case_ids: caseIds.join(","),
        },
      });
      const fetchedEvents = Array.isArray(res.data?.events) ? res.data.events : [];
      const totalEvents = typeof res.data?.totalEvents === "number" ? res.data.totalEvents : meta.total;

      if (fetchedEvents.length) {
        setEvents((prev) => {
          const deduped = new Map();
          [...prev, ...fetchedEvents].forEach((ev) => deduped.set(String(ev.id), ev));
          return Array.from(deduped.values()).sort((a, b) => new Date(a.start) - new Date(b.start));
        });
      }

      const loaded = (meta.loaded || 0) + fetchedEvents.length;
      const hasMore = totalEvents !== null ? loaded < totalEvents : fetchedEvents.length === 20;
      setEventsPagination({
        __company__: {
          nextPage: (meta.nextPage || 1) + 1,
          loaded,
          total: totalEvents,
          hasMore,
        },
      });
    } catch (error) {
      console.error("Error fetching more events:", error);
    } finally {
      setEventsLoadingMore(false);
    }
  };

  const fetchDocuments = async (caseIds) => {
    if (!caseIds || caseIds.length === 0) return;
    setDocumentsLoading(true);
    try {
      const limit = 20;
      const uniqueCaseIds = Array.from(new Set(caseIds.map((c) => String(c))));
      const res = await axios.get(`/companies/${id}/documents`, {
        params: { page: 1, limit, case_ids: uniqueCaseIds.join(",") },
      });
      const docs = Array.isArray(res.data?.documents) ? res.data.documents : [];
      const totalDocuments = typeof res.data?.totalDocuments === "number" ? res.data.totalDocuments : null;
      if (docs.length === 0 && uniqueCaseIds.length > 0) {
        throw new Error("Empty company documents result, using fallback.");
      }
      const caseMap = {};
      (company?.cases || []).forEach((c) => {
        caseMap[String(c.id)] = c.name;
      });
      const allDocs = docs.map((doc, idx) => {
        const caseId = String(doc.case_id || doc.caseId || doc._caseId || "");
        return {
          ...doc,
          _id: `${caseId}-${doc.fileName || doc.name || idx}`,
          _caseId: caseId,
          _caseName: doc.case_name || caseMap[caseId] || "Unknown Case",
        };
      });
      allDocs.sort(
        (a, b) =>
          new Date(b.updatedAt || b.modifiedAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.modifiedAt || a.createdAt || 0)
      );
      setDocuments(allDocs);
      setDocumentsPagination({
        __company__: {
          nextPage: 2,
          loaded: allDocs.length,
          total: totalDocuments,
          hasMore: totalDocuments !== null ? allDocs.length < totalDocuments : allDocs.length === limit,
        },
      });
      setDocumentsSourceMode("company");
    } catch (error) {
      try {
        const limit = 20;
        const settled = await Promise.allSettled(
          caseIds.map((caseId) =>
            axios
              .get(`/cases/${caseId}/documents`, {
                params: { page: 1, limit },
              })
              .then((res) => ({ caseId, data: res.data }))
          )
        );
        const caseMap = {};
        (company?.cases || []).forEach((c) => {
          caseMap[String(c.id)] = c.name;
        });

        const allDocs = [];
        const nextPagination = {};
        settled.forEach((result) => {
          if (result.status !== "fulfilled") return;
          const { caseId, data } = result.value;
          const docs = Array.isArray(data?.documents) ? data.documents : [];
          const totalDocuments =
            typeof data?.totalDocuments === "number"
              ? data.totalDocuments
              : typeof data?.total === "number"
                ? data.total
                : null;
          const loaded = docs.length;
          const hasMore = totalDocuments !== null ? loaded < totalDocuments : loaded === limit;
          nextPagination[String(caseId)] = {
            nextPage: 2,
            loaded,
            total: totalDocuments,
            hasMore,
          };
          docs.forEach((doc, idx) => {
            allDocs.push({
              ...doc,
              _id: `${caseId}-${doc.fileName || doc.name || idx}`,
              _caseId: caseId,
              _caseName: caseMap[String(caseId)] || "Unknown Case",
            });
          });
        });
        allDocs.sort(
          (a, b) =>
            new Date(b.updatedAt || b.modifiedAt || b.createdAt || 0) -
            new Date(a.updatedAt || a.modifiedAt || a.createdAt || 0)
        );
        setDocuments(allDocs);
        setDocumentsPagination(nextPagination);
        setDocumentsSourceMode("perCase");
      } catch (fallbackError) {
        console.error("Error fetching documents:", fallbackError);
      }
    } finally {
      setDocumentsLoading(false);
    }
  };

  const fetchMoreDocuments = async () => {
    if (documentsLoadingMore || documentsLoading) return;
    if (documentsSourceMode === "company") {
      const meta = documentsPagination.__company__;
      if (!meta?.hasMore) return;

      setDocumentsLoadingMore(true);
      try {
        const caseIds = (company?.cases || []).map((c) => String(c.id));
        const res = await axios.get(`/companies/${id}/documents`, {
          params: {
            page: meta.nextPage || 1,
            limit: 20,
            case_ids: caseIds.join(","),
          },
        });
        const docs = Array.isArray(res.data?.documents) ? res.data.documents : [];
        const totalDocuments =
          typeof res.data?.totalDocuments === "number" ? res.data.totalDocuments : meta.total;
        const caseMap = {};
        (company?.cases || []).forEach((c) => {
          caseMap[String(c.id)] = c.name;
        });
        const newDocs = docs.map((doc, idx) => {
          const caseId = String(doc.case_id || doc.caseId || doc._caseId || "");
          return {
            ...doc,
            _id: `${caseId}-${doc.fileName || doc.name || idx}-${meta.nextPage || 1}`,
            _caseId: caseId,
            _caseName: doc.case_name || caseMap[caseId] || "Unknown Case",
          };
        });

        if (newDocs.length) {
          setDocuments((prev) => {
            const merged = [...prev, ...newDocs];
            const deduped = new Map();
            merged.forEach((d, idx) => {
              const key = `${d._caseId}-${d.fileName || d.name || idx}`;
              deduped.set(key, d);
            });
            return Array.from(deduped.values()).sort(
              (a, b) =>
                new Date(b.updatedAt || b.modifiedAt || b.createdAt || 0) -
                new Date(a.updatedAt || a.modifiedAt || a.createdAt || 0)
            );
          });
        }
        const loaded = (meta.loaded || 0) + newDocs.length;
        const hasMore = totalDocuments !== null ? loaded < totalDocuments : newDocs.length === 20;
        setDocumentsPagination({
          __company__: {
            nextPage: (meta.nextPage || 1) + 1,
            loaded,
            total: totalDocuments,
            hasMore,
          },
        });
      } catch (error) {
        console.error("Error fetching more documents:", error);
      } finally {
        setDocumentsLoadingMore(false);
      }
      return;
    }

    const caseIdsToLoad = Object.entries(documentsPagination)
      .filter(([, meta]) => meta?.hasMore)
      .map(([caseId]) => caseId);
    if (!caseIdsToLoad.length) return;

    setDocumentsLoadingMore(true);
    try {
      const limit = 20;
      const settled = await Promise.allSettled(
        caseIdsToLoad.map((caseId) => {
          const meta = documentsPagination[caseId] || {};
          return axios
            .get(`/cases/${caseId}/documents`, {
              params: { page: meta.nextPage || 1, limit },
            })
            .then((res) => ({ caseId, data: res.data }));
        })
      );

      const caseMap = {};
      (company?.cases || []).forEach((c) => {
        caseMap[String(c.id)] = c.name;
      });

      const newDocs = [];
      const updatedPagination = { ...documentsPagination };
      settled.forEach((result) => {
        if (result.status !== "fulfilled") return;
        const { caseId, data } = result.value;
        const current = updatedPagination[String(caseId)] || {
          nextPage: 1,
          loaded: 0,
          total: null,
          hasMore: false,
        };
        const docs = Array.isArray(data?.documents) ? data.documents : [];
        const totalDocuments =
          typeof data?.totalDocuments === "number"
            ? data.totalDocuments
            : typeof data?.total === "number"
              ? data.total
              : current.total;
        const loaded = current.loaded + docs.length;
        const hasMore = totalDocuments !== null ? loaded < totalDocuments : docs.length === limit;
        updatedPagination[String(caseId)] = {
          nextPage: (current.nextPage || 1) + 1,
          loaded,
          total: totalDocuments,
          hasMore,
        };

        docs.forEach((doc, idx) => {
          newDocs.push({
            ...doc,
            _id: `${caseId}-${doc.fileName || doc.name || idx}-${current.nextPage || 1}`,
            _caseId: caseId,
            _caseName: caseMap[String(caseId)] || "Unknown Case",
          });
        });
      });

      if (newDocs.length) {
        setDocuments((prev) => {
          const merged = [...prev, ...newDocs];
          const deduped = new Map();
          merged.forEach((d, idx) => {
            const key = `${d._caseId}-${d.fileName || d.name || idx}`;
            deduped.set(key, d);
          });
          return Array.from(deduped.values()).sort(
            (a, b) =>
              new Date(b.updatedAt || b.modifiedAt || b.createdAt || 0) -
              new Date(a.updatedAt || a.modifiedAt || a.createdAt || 0)
          );
        });
      }
      setDocumentsPagination(updatedPagination);
    } catch (error) {
      console.error("Error fetching more documents:", error);
    } finally {
      setDocumentsLoadingMore(false);
    }
  };

  const fetchTasks = async (caseIds) => {
    if (!caseIds || caseIds.length === 0) return;
    setTasksLoading(true);
    try {
      const limit = 20;
      const uniqueCaseIds = Array.from(new Set(caseIds.map((c) => String(c))));
      const res = await axios.get(`/companies/${id}/tasks`, {
        params: { page: 1, limit, case_ids: uniqueCaseIds.join(",") },
      });
      const caseTasks = Array.isArray(res.data?.tasks) ? res.data.tasks : [];
      const totalTasks = typeof res.data?.totalTasks === "number" ? res.data.totalTasks : null;
      if (caseTasks.length === 0 && uniqueCaseIds.length > 0) {
        throw new Error("Empty company tasks result, using fallback.");
      }
      const caseMap = {};
      (company?.cases || []).forEach((c) => {
        caseMap[String(c.id)] = c.name;
      });
      const allTasks = caseTasks.map((task, idx) => {
        const caseId = String(task.case_id || task.caseId || task._caseId || "");
        return {
          ...task,
          _id: `${caseId}-${task.task_id || task.id || idx}`,
          _caseId: caseId,
          _caseName: task.case_name || caseMap[caseId] || "Unknown Case",
        };
      });

      allTasks.sort(
        (a, b) => new Date(a.due_date || 0) - new Date(b.due_date || 0)
      );
      setTasks(allTasks);
      setTasksPagination({
        __company__: {
          nextPage: 2,
          loaded: allTasks.length,
          total: totalTasks,
          hasMore: totalTasks !== null ? allTasks.length < totalTasks : allTasks.length === limit,
        },
      });
      setTasksSourceMode("company");
    } catch (error) {
      try {
        const limit = 20;
        const settled = await Promise.allSettled(
          caseIds.map((caseId) =>
            axios
              .get(`${process.env.REACT_APP_BASE_URL}/tasks/by-case/${caseId}`, {
                params: { page: 1, limit, sort: "due_date ASC" },
              })
              .then((res) => ({ caseId, data: res.data }))
          )
        );
        const caseMap = {};
        (company?.cases || []).forEach((c) => {
          caseMap[String(c.id)] = c.name;
        });

        const allTasks = [];
        const nextPagination = {};
        settled.forEach((result) => {
          if (result.status !== "fulfilled") return;
          const { caseId, data } = result.value;
          const caseTasks = Array.isArray(data?.tasks)
            ? data.tasks
            : Array.isArray(data)
              ? data
              : [];
          const totalTasks = typeof data?.totalTasks === "number" ? data.totalTasks : null;
          const loaded = caseTasks.length;
          const hasMore = totalTasks !== null ? loaded < totalTasks : loaded === limit;
          nextPagination[String(caseId)] = {
            nextPage: 2,
            loaded,
            total: totalTasks,
            hasMore,
          };
          caseTasks.forEach((task, idx) => {
            allTasks.push({
              ...task,
              _id: `${caseId}-${task.task_id || task.id || idx}`,
              _caseId: caseId,
              _caseName: caseMap[String(caseId)] || "Unknown Case",
            });
          });
        });

        allTasks.sort(
          (a, b) => new Date(a.due_date || 0) - new Date(b.due_date || 0)
        );
        setTasks(allTasks);
        setTasksPagination(nextPagination);
        setTasksSourceMode("perCase");
      } catch (fallbackError) {
        console.error("Error fetching tasks:", fallbackError);
      }
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchMoreTasks = async () => {
    if (tasksLoadingMore || tasksLoading) return;
    if (tasksSourceMode === "company") {
      const meta = tasksPagination.__company__;
      if (!meta?.hasMore) return;
      setTasksLoadingMore(true);
      try {
        const caseIds = (company?.cases || []).map((c) => String(c.id));
        const res = await axios.get(`/companies/${id}/tasks`, {
          params: {
            page: meta.nextPage || 1,
            limit: 20,
            case_ids: caseIds.join(","),
          },
        });
        const caseTasks = Array.isArray(res.data?.tasks) ? res.data.tasks : [];
        const totalTasks = typeof res.data?.totalTasks === "number" ? res.data.totalTasks : meta.total;
        const caseMap = {};
        (company?.cases || []).forEach((c) => {
          caseMap[String(c.id)] = c.name;
        });
        const newTasks = caseTasks.map((task, idx) => {
          const caseId = String(task.case_id || task.caseId || task._caseId || "");
          return {
            ...task,
            _id: `${caseId}-${task.task_id || task.id || idx}-${meta.nextPage || 1}`,
            _caseId: caseId,
            _caseName: task.case_name || caseMap[caseId] || "Unknown Case",
          };
        });

        if (newTasks.length) {
          setTasks((prev) => {
            const merged = [...prev, ...newTasks];
            const deduped = new Map();
            merged.forEach((t, idx) => {
              const key = `${t._caseId}-${t.task_id || t.id || idx}`;
              deduped.set(key, t);
            });
            return Array.from(deduped.values()).sort(
              (a, b) => new Date(a.due_date || 0) - new Date(b.due_date || 0)
            );
          });
        }

        const loaded = (meta.loaded || 0) + newTasks.length;
        const hasMore = totalTasks !== null ? loaded < totalTasks : newTasks.length === 20;
        setTasksPagination({
          __company__: {
            nextPage: (meta.nextPage || 1) + 1,
            loaded,
            total: totalTasks,
            hasMore,
          },
        });
      } catch (error) {
        console.error("Error fetching more tasks:", error);
      } finally {
        setTasksLoadingMore(false);
      }
      return;
    }

    const caseIdsToLoad = Object.entries(tasksPagination)
      .filter(([, meta]) => meta?.hasMore)
      .map(([caseId]) => caseId);
    if (!caseIdsToLoad.length) return;

    setTasksLoadingMore(true);
    try {
      const limit = 20;
      const settled = await Promise.allSettled(
        caseIdsToLoad.map((caseId) => {
          const meta = tasksPagination[caseId] || {};
          return axios
            .get(`${process.env.REACT_APP_BASE_URL}/tasks/by-case/${caseId}`, {
              params: {
                page: meta.nextPage || 1,
                limit,
                sort: "due_date ASC",
              },
            })
            .then((res) => ({ caseId, data: res.data }));
        })
      );

      const caseMap = {};
      (company?.cases || []).forEach((c) => {
        caseMap[String(c.id)] = c.name;
      });

      const newTasks = [];
      const updatedPagination = { ...tasksPagination };
      settled.forEach((result) => {
        if (result.status !== "fulfilled") return;
        const { caseId, data } = result.value;
        const current = updatedPagination[String(caseId)] || {
          nextPage: 1,
          loaded: 0,
          total: null,
          hasMore: false,
        };
        const caseTasks = Array.isArray(data?.tasks)
          ? data.tasks
          : Array.isArray(data)
            ? data
            : [];
        const totalTasks =
          typeof data?.totalTasks === "number" ? data.totalTasks : current.total;
        const loaded = current.loaded + caseTasks.length;
        const hasMore = totalTasks !== null ? loaded < totalTasks : caseTasks.length === limit;
        updatedPagination[String(caseId)] = {
          nextPage: (current.nextPage || 1) + 1,
          loaded,
          total: totalTasks,
          hasMore,
        };

        caseTasks.forEach((task, idx) => {
          newTasks.push({
            ...task,
            _id: `${caseId}-${task.task_id || task.id || idx}-${current.nextPage || 1}`,
            _caseId: caseId,
            _caseName: caseMap[String(caseId)] || "Unknown Case",
          });
        });
      });

      if (newTasks.length) {
        setTasks((prev) => {
          const merged = [...prev, ...newTasks];
          const deduped = new Map();
          merged.forEach((t, idx) => {
            const key = `${t._caseId}-${t.task_id || t.id || idx}`;
            deduped.set(key, t);
          });
          return Array.from(deduped.values()).sort(
            (a, b) => new Date(a.due_date || 0) - new Date(b.due_date || 0)
          );
        });
      }
      setTasksPagination(updatedPagination);
    } catch (error) {
      console.error("Error fetching more tasks:", error);
    } finally {
      setTasksLoadingMore(false);
    }
  };

  const fetchNotes = async (caseIds) => {
    if (!caseIds || caseIds.length === 0) return;
    const uniqueCaseIds = Array.from(new Set(caseIds.map((c) => String(c))));
    const fetchKey = uniqueCaseIds.slice().sort().join(",");
    if (notesFetchInFlightRef.current && notesFetchKeyRef.current === fetchKey) {
      return;
    }

    notesFetchInFlightRef.current = true;
    notesFetchKeyRef.current = fetchKey;
    setNotesLoading(true);
    try {
      // Preferred fast path: one paginated request for all company notes.
      const limit = 20;
      const res = await axios.get(`/companies/${id}/notes`, {
        params: { page: 1, limit, case_ids: uniqueCaseIds.join(",") },
      });
      const fetchedNotes = Array.isArray(res.data?.caseNotes) ? res.data.caseNotes : [];
      const totalNotes = typeof res.data?.totalNotes === "number" ? res.data.totalNotes : null;
      const caseMap = {};
      (company?.cases || []).forEach((c) => {
        caseMap[String(c.id)] = c.name;
      });
      const mappedNotes = fetchedNotes.map((n) => {
        const caseId = String(n.case_id || n._caseId || "");
        return {
          ...n,
          _caseId: caseId,
          _caseName: n.case_name || caseMap[caseId] || "Unknown Case",
        };
      });
      mappedNotes.sort(
        (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
      );
      setNotes(mappedNotes);
      setNotesPagination({
        __company__: {
          nextPage: 2,
          loaded: mappedNotes.length,
          total: totalNotes,
          hasMore: totalNotes !== null ? mappedNotes.length < totalNotes : mappedNotes.length === limit,
        },
      });
      // If endpoint returns empty while company has cases, fallback to legacy per-case fetch.
      if (mappedNotes.length === 0 && uniqueCaseIds.length > 0) {
        throw new Error("Empty company notes result, using legacy fetch.");
      }
      setNotesSourceMode("company");
    } catch (error) {
      // Fallback to existing per-case calls if backend endpoint is unavailable.
      try {
        const limit = 20;
        const settled = await Promise.allSettled(
          uniqueCaseIds.map((caseId) =>
            axios
              .get(`/case_notes`, { params: { case_id: caseId, page: 1, limit } })
              .then((res) => ({ caseId, data: res.data }))
          )
        );

        const allNotes = [];
        const nextPagination = {};
        settled.forEach((result) => {
          if (result.status !== "fulfilled") return;
          const { caseId, data } = result.value;
          const caseNotes = Array.isArray(data?.caseNotes) ? data.caseNotes : [];
          const totalNotes = typeof data?.totalNotes === "number" ? data.totalNotes : null;
          const loaded = caseNotes.length;
          const hasMore = totalNotes !== null ? loaded < totalNotes : loaded === limit;

          nextPagination[String(caseId)] = {
            nextPage: 2,
            loaded,
            total: totalNotes,
            hasMore,
          };
          allNotes.push(...caseNotes.map((n) => ({ ...n, _caseId: caseId })));
        });
        const caseMap = {};
        (company?.cases || []).forEach((c) => {
          caseMap[String(c.id)] = c.name;
        });
        allNotes.forEach((n) => {
          n._caseName = caseMap[String(n.case_id || n._caseId)] || "Unknown Case";
        });
        allNotes.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
        setNotes(allNotes);
        setNotesPagination(nextPagination);
        setNotesSourceMode("perCase");
      } catch (fallbackError) {
        console.error("Error fetching notes:", fallbackError);
      }
    } finally {
      notesFetchInFlightRef.current = false;
      setNotesLoading(false);
    }
  };

  const fetchMoreNotes = async () => {
    if (notesLoadingMore || notesLoading) return;
    if (notesSourceMode === "company") {
      const meta = notesPagination.__company__;
      if (!meta?.hasMore) return;

      setNotesLoadingMore(true);
      try {
        const limit = 20;
        const res = await axios.get(`/companies/${id}/notes`, {
          params: {
            page: meta.nextPage || 1,
            limit,
            case_ids: (company?.cases || []).map((c) => String(c.id)).join(","),
          },
        });
        const fetchedNotes = Array.isArray(res.data?.caseNotes) ? res.data.caseNotes : [];
        const totalNotes =
          typeof res.data?.totalNotes === "number" ? res.data.totalNotes : meta.total;
        const caseMap = {};
        (company?.cases || []).forEach((c) => {
          caseMap[String(c.id)] = c.name;
        });

        const mappedNotes = fetchedNotes.map((n) => {
          const caseId = String(n.case_id || n._caseId || "");
          return {
            ...n,
            _caseId: caseId,
            _caseName: n.case_name || caseMap[caseId] || "Unknown Case",
          };
        });

        if (mappedNotes.length) {
          setNotes((prev) => {
            const deduped = new Map();
            [...prev, ...mappedNotes].forEach((note) => {
              deduped.set(String(note.id), note);
            });
            return Array.from(deduped.values()).sort(
              (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
            );
          });
        }

        const loaded = (meta.loaded || 0) + mappedNotes.length;
        const hasMore = totalNotes !== null ? loaded < totalNotes : mappedNotes.length === limit;
        setNotesPagination({
          __company__: {
            nextPage: (meta.nextPage || 1) + 1,
            loaded,
            total: totalNotes,
            hasMore,
          },
        });
      } catch (error) {
        console.error("Error fetching more notes:", error);
      } finally {
        setNotesLoadingMore(false);
      }
      return;
    }

    const caseIdsToLoad = Object.entries(notesPagination)
      .filter(([, meta]) => meta?.hasMore)
      .map(([caseId]) => caseId);
    if (!caseIdsToLoad.length) return;

    setNotesLoadingMore(true);
    try {
      const limit = 20;
      const settled = await Promise.allSettled(
        caseIdsToLoad.map((caseId) => {
          const meta = notesPagination[caseId] || {};
          return axios
            .get(`/case_notes`, {
              params: { case_id: caseId, page: meta.nextPage || 1, limit },
            })
            .then((res) => ({ caseId, data: res.data }));
        })
      );

      const caseMap = {};
      (company?.cases || []).forEach((c) => {
        caseMap[String(c.id)] = c.name;
      });

      const newNotes = [];
      const updatedPagination = { ...notesPagination };
      settled.forEach((result) => {
        if (result.status !== "fulfilled") return;
        const { caseId, data } = result.value;
        const current = updatedPagination[String(caseId)] || {
          nextPage: 1,
          loaded: 0,
          total: null,
          hasMore: false,
        };
        const caseNotes = Array.isArray(data?.caseNotes) ? data.caseNotes : [];
        const totalNotes =
          typeof data?.totalNotes === "number" ? data.totalNotes : current.total;
        const loaded = current.loaded + caseNotes.length;
        const hasMore =
          totalNotes !== null ? loaded < totalNotes : caseNotes.length === limit;

        updatedPagination[String(caseId)] = {
          nextPage: (current.nextPage || 1) + 1,
          loaded,
          total: totalNotes,
          hasMore,
        };

        newNotes.push(
          ...caseNotes.map((n) => ({
            ...n,
            _caseId: caseId,
            _caseName: caseMap[String(n.case_id || caseId)] || "Unknown Case",
          }))
        );
      });

      if (newNotes.length) {
        setNotes((prev) => {
          const deduped = new Map();
          [...prev, ...newNotes].forEach((note) => {
            deduped.set(String(note.id), note);
          });
          return Array.from(deduped.values()).sort(
            (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
          );
        });
      }
      setNotesPagination(updatedPagination);
    } catch (error) {
      console.error("Error fetching more notes:", error);
    } finally {
      setNotesLoadingMore(false);
    }
  };

  const fetchAllTimeEntriesForCase = async (caseId) => {
    const aggregated = [];
    let page = 1;
    const pageLimit = 500;
    while (true) {
      const res = await axios.get("/time_entries", {
        params: {
          case_id: caseId,
          page,
          limit: pageLimit,
          range: "all_time",
        },
      });
      const batch = Array.isArray(res.data?.data) ? res.data.data : [];
      aggregated.push(...batch);
      const totalPages = res.data?.pagination?.totalPages;
      const totalRecords = res.data?.pagination?.totalRecords;
      if (batch.length === 0) break;
      if (totalPages != null && page >= totalPages) break;
      if (totalRecords != null && aggregated.length >= totalRecords) break;
      if (batch.length < pageLimit) break;
      page += 1;
    }
    return aggregated;
  };

  const fetchTimeEntriesTotalsSnapshot = async (caseIds) => {
    if (!caseIds || caseIds.length === 0) return;
    setTimeEntriesTotalsLoading(true);
    try {
      const uniqueCaseIds = Array.from(new Set(caseIds.map((c) => String(c))));
      const caseIdsParam = uniqueCaseIds.join(",");
      const caseMap = {};
      (company?.cases || []).forEach((c) => {
        caseMap[String(c.id)] = c.name;
      });

      const mapRows = (batch) =>
        batch.map((entry) => ({
          ...entry,
          _caseName: entry.case_name || caseMap[String(entry.case_id)] || "Unknown Case",
        }));

      try {
        const allEntries = [];
        let page = 1;
        const bulkLimit = 5000;
        while (true) {
          const res = await axios.get(`/companies/${id}/time_entries`, {
            params: { page, limit: bulkLimit, case_ids: caseIdsParam },
          });
          const batch = Array.isArray(res.data?.data) ? res.data.data : [];
          const total = typeof res.data?.totalTimeEntries === "number" ? res.data.totalTimeEntries : null;
          allEntries.push(...mapRows(batch));
          if (batch.length === 0) break;
          if (total != null && allEntries.length >= total) break;
          if (batch.length < bulkLimit) break;
          page += 1;
        }
        setTimeEntriesAllForRollup(allEntries);
      } catch (companyErr) {
        const settled = await Promise.allSettled(
          uniqueCaseIds.map((caseId) =>
            fetchAllTimeEntriesForCase(caseId).then((rows) => ({ caseId, rows }))
          )
        );
        const allEntries = [];
        settled.forEach((result) => {
          if (result.status !== "fulfilled") return;
          const { caseId, rows } = result.value;
          rows.forEach((entry) => {
            allEntries.push({
              ...entry,
              _caseName: caseMap[String(entry.case_id || caseId)] || "Unknown Case",
            });
          });
        });
        setTimeEntriesAllForRollup(allEntries);
      }
    } catch (error) {
      console.error("Error fetching time entries for company totals:", error);
    } finally {
      setTimeEntriesTotalsLoading(false);
    }
  };

  const fetchTimeEntries = async (caseIds) => {
    if (!caseIds || caseIds.length === 0) return;
    setTimeEntriesLoading(true);
    try {
      const limit = 20;
      const uniqueCaseIds = Array.from(new Set(caseIds.map((c) => String(c))));
      const res = await axios.get(`/companies/${id}/time_entries`, {
        params: { page: 1, limit, case_ids: uniqueCaseIds.join(",") },
      });
      const rows = Array.isArray(res.data?.data) ? res.data.data : [];
      const totalTimeEntries =
        typeof res.data?.totalTimeEntries === "number" ? res.data.totalTimeEntries : null;

      if (rows.length === 0 && uniqueCaseIds.length > 0) {
        if (totalTimeEntries === 0) {
          setTimeEntries([]);
          setTimeEntriesPagination({
            __company__: {
              nextPage: 2,
              loaded: 0,
              total: 0,
              hasMore: false,
            },
          });
          setTimeEntriesSourceMode("company");
        } else {
          throw new Error("Empty company time entries result, using fallback.");
        }
      } else {
        const caseMap = {};
        (company?.cases || []).forEach((c) => {
          caseMap[String(c.id)] = c.name;
        });
        const allEntries = rows.map((entry) => ({
          ...entry,
          _caseName: entry.case_name || caseMap[String(entry.case_id)] || "Unknown Case",
        }));
        allEntries.sort(
          (a, b) => new Date(b.entry_date || 0) - new Date(a.entry_date || 0)
        );
        setTimeEntries(allEntries);
        setTimeEntriesPagination({
          __company__: {
            nextPage: 2,
            loaded: allEntries.length,
            total: totalTimeEntries,
            hasMore:
              totalTimeEntries !== null
                ? allEntries.length < totalTimeEntries
                : allEntries.length === limit,
          },
        });
        setTimeEntriesSourceMode("company");
      }
    } catch (error) {
      try {
        const limit = 20;
        const uniqueCaseIds = Array.from(new Set(caseIds.map((c) => String(c))));
        const settled = await Promise.allSettled(
          uniqueCaseIds.map((caseId) =>
            axios
              .get("/time_entries", {
                params: {
                  case_id: caseId,
                  page: 1,
                  limit,
                  range: "all_time",
                },
              })
              .then((res) => ({ caseId, data: res.data }))
          )
        );
        const caseMap = {};
        (company?.cases || []).forEach((c) => {
          caseMap[String(c.id)] = c.name;
        });
        const allEntries = [];
        const nextPagination = {};
        settled.forEach((result) => {
          if (result.status !== "fulfilled") return;
          const { caseId, data } = result.value;
          const entries = Array.isArray(data?.data) ? data.data : [];
          const totalRecords =
            typeof data?.pagination?.totalRecords === "number" ? data.pagination.totalRecords : null;
          const loaded = entries.length;
          const hasMore = totalRecords !== null ? loaded < totalRecords : loaded === limit;
          nextPagination[String(caseId)] = {
            nextPage: 2,
            loaded,
            total: totalRecords,
            hasMore,
          };
          entries.forEach((entry) => {
            allEntries.push({
              ...entry,
              _caseName: caseMap[String(entry.case_id || caseId)] || "Unknown Case",
            });
          });
        });
        allEntries.sort(
          (a, b) => new Date(b.entry_date || 0) - new Date(a.entry_date || 0)
        );
        setTimeEntries(allEntries);
        setTimeEntriesPagination(nextPagination);
        setTimeEntriesSourceMode("perCase");
      } catch (fallbackError) {
        console.error("Error fetching time entries:", fallbackError);
      }
    } finally {
      setTimeEntriesLoading(false);
    }
  };

  const fetchMoreTimeEntries = async () => {
    if (timeEntriesLoadingMore || timeEntriesLoading) return;

    if (timeEntriesSourceMode === "company") {
      const meta = timeEntriesPagination.__company__;
      if (!meta?.hasMore) return;

      setTimeEntriesLoadingMore(true);
      try {
        const caseIds = (company?.cases || []).map((c) => String(c.id));
        const limit = 20;
        const res = await axios.get(`/companies/${id}/time_entries`, {
          params: {
            page: meta.nextPage || 1,
            limit,
            case_ids: caseIds.join(","),
          },
        });
        const batch = Array.isArray(res.data?.data) ? res.data.data : [];
        const totalTimeEntries =
          typeof res.data?.totalTimeEntries === "number" ? res.data.totalTimeEntries : meta.total;
        const caseMap = {};
        (company?.cases || []).forEach((c) => {
          caseMap[String(c.id)] = c.name;
        });
        const newEntries = batch.map((entry) => ({
          ...entry,
          _caseName: entry.case_name || caseMap[String(entry.case_id)] || "Unknown Case",
        }));

        if (newEntries.length) {
          setTimeEntries((prev) => {
            const merged = [...prev, ...newEntries];
            const deduped = new Map();
            merged.forEach((e) => {
              deduped.set(String(e.time_entry_id), e);
            });
            return Array.from(deduped.values()).sort(
              (a, b) => new Date(b.entry_date || 0) - new Date(a.entry_date || 0)
            );
          });
        }

        const loaded = (meta.loaded || 0) + newEntries.length;
        const hasMore =
          totalTimeEntries !== null ? loaded < totalTimeEntries : newEntries.length === limit;
        setTimeEntriesPagination({
          __company__: {
            nextPage: (meta.nextPage || 1) + 1,
            loaded,
            total: totalTimeEntries,
            hasMore,
          },
        });
      } catch (err) {
        console.error("Error fetching more time entries:", err);
      } finally {
        setTimeEntriesLoadingMore(false);
      }
      return;
    }

    const caseIdsToLoad = Object.entries(timeEntriesPagination)
      .filter(([, m]) => m?.hasMore)
      .map(([caseId]) => caseId);
    if (!caseIdsToLoad.length) return;

    setTimeEntriesLoadingMore(true);
    try {
      const limit = 20;
      const settled = await Promise.allSettled(
        caseIdsToLoad.map((caseId) => {
          const meta = timeEntriesPagination[caseId] || {};
          return axios
            .get("/time_entries", {
              params: {
                case_id: caseId,
                page: meta.nextPage || 1,
                limit,
                range: "all_time",
              },
            })
            .then((res) => ({ caseId, data: res.data }));
        })
      );

      const caseMap = {};
      (company?.cases || []).forEach((c) => {
        caseMap[String(c.id)] = c.name;
      });

      const newEntries = [];
      const updatedPagination = { ...timeEntriesPagination };
      settled.forEach((result) => {
        if (result.status !== "fulfilled") return;
        const { caseId, data } = result.value;
        const current = updatedPagination[String(caseId)] || {
          nextPage: 1,
          loaded: 0,
          total: null,
          hasMore: false,
        };
        const entries = Array.isArray(data?.data) ? data.data : [];
        const totalRecords =
          typeof data?.pagination?.totalRecords === "number"
            ? data.pagination.totalRecords
            : current.total;
        const loaded = current.loaded + entries.length;
        const hasMore = totalRecords !== null ? loaded < totalRecords : entries.length === limit;
        updatedPagination[String(caseId)] = {
          nextPage: (current.nextPage || 1) + 1,
          loaded,
          total: totalRecords,
          hasMore,
        };

        entries.forEach((entry) => {
          newEntries.push({
            ...entry,
            _caseName: caseMap[String(entry.case_id || caseId)] || "Unknown Case",
          });
        });
      });

      if (newEntries.length) {
        setTimeEntries((prev) => {
          const merged = [...prev, ...newEntries];
          const deduped = new Map();
          merged.forEach((e) => {
            deduped.set(String(e.time_entry_id), e);
          });
          return Array.from(deduped.values()).sort(
            (a, b) => new Date(b.entry_date || 0) - new Date(a.entry_date || 0)
          );
        });
      }
      setTimeEntriesPagination(updatedPagination);
    } catch (error) {
      console.error("Error fetching more time entries:", error);
    } finally {
      setTimeEntriesLoadingMore(false);
    }
  };

  const fetchCasesForPicker = async (search = "") => {
    try {
      const res = await axios.get("/cases", { params: { search, page: 1 } });
      const all = Array.isArray(res.data?.cases) ? res.data.cases : [];
      const linkedIds = new Set((company?.cases || []).map((c) => String(c.id)));
      const candidates = all
        .map((c) => ({
          id: c.case_id ?? c.id,
          name: c.name || c.case_name || `Case #${c.case_id ?? c.id}`,
        }))
        .filter((c) => c.id && !linkedIds.has(String(c.id)));
      setAvailableCases(candidates);
    } catch (error) {
      console.error("Error fetching cases for picker:", error);
      setAvailableCases([]);
    }
  };

  const handleLinkCase = async () => {
    if (!selectedCases.length) return;
    setAddingCase(true);
    try {
      const caseIds = Array.from(
        new Set(
          selectedCases
            .map((c) => c?.id)
            .filter(Boolean)
            .map((v) => String(v))
        )
      );
      const settled = await Promise.allSettled(
        caseIds.map((caseId) => axios.post(`/companies/${id}/cases`, { case_id: caseId }))
      );
      const failedCount = settled.filter((r) => r.status !== "fulfilled").length;
      if (failedCount === caseIds.length) {
        throw new Error("Failed to link selected cases.");
      }
      setAddCaseOpen(false);
      setSelectedCases([]);
      setCaseSearch("");
      await fetchCompany();
      setActiveTab(0);
      if (failedCount > 0) {
        alert(
          `${caseIds.length - failedCount} case(s) added successfully. ${failedCount} case(s) could not be added.`
        );
      }
    } catch (error) {
      console.error("Error linking case:", error);
      alert("Failed to link selected cases. Please try again.");
    } finally {
      setAddingCase(false);
    }
  };

  const fetchContactsForPicker = async (search = "") => {
    try {
      const res = await axios.get("/clients", { params: { search, page: 1 } });
      const all = Array.isArray(res.data?.clients) ? res.data.clients : [];
      const linkedIds = new Set((company?.clients || []).map((c) => String(c.id)));
      const candidates = all
        .map((c) => ({
          id: c.id,
          name:
            `${c.first_name || ""} ${c.last_name || ""}`.trim() ||
            c.name ||
            `Contact #${c.id}`,
          email: c.email || "",
        }))
        .filter((c) => c.id && !linkedIds.has(String(c.id)));
      setAvailableContacts(candidates);
    } catch (error) {
      console.error("Error fetching contacts for picker:", error);
      setAvailableContacts([]);
    }
  };

  const handleLinkContact = async () => {
    if (!selectedContactId) return;
    setAddingContact(true);
    try {
      await axios.post(`/companies/${id}/clients`, { client_id: selectedContactId });
      setAddContactOpen(false);
      setSelectedContactId("");
      setContactSearch("");
      await fetchCompany();
      setActiveTab(1);
    } catch (error) {
      console.error("Error linking contact:", error);
      alert("Failed to link contact. Please try again.");
    } finally {
      setAddingContact(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteCaseId || !noteSubject.trim() || !noteContent.trim()) return;
    setAddingNote(true);
    try {
      await axios.post(
        "/case_notes",
        {
          case_id: noteCaseId,
          subject: noteSubject.trim(),
          note: noteContent,
          date: noteDate,
        },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_TOKEN,
            "x-user-uid": auth.currentUser?.uid,
            "Content-Type": "application/json",
          },
        }
      );
      setAddNoteOpen(false);
      setNoteCaseId("");
      setNoteSubject("");
      setNoteContent("");
      setNoteDate(new Date().toISOString().split("T")[0]);
      await fetchNotes(company?.cases?.map((c) => c.id) || []);
      setActiveTab(2);
    } catch (error) {
      console.error("Error creating note:", error);
      alert("Failed to add note. Please try again.");
    } finally {
      setAddingNote(false);
    }
  };

  const handleUnlinkCase = async (caseId) => {
    if (!caseId) return;
    const confirmed = window.confirm(
      "Are you sure you want to remove this case from this company?"
    );
    if (!confirmed) return;

    setRemovingCaseId(caseId);
    try {
      await axios.delete(`/companies/${id}/cases/${caseId}`);
      await fetchCompany();
      setNotes((prev) =>
        prev.filter(
          (n) => String(n.case_id || n._caseId) !== String(caseId)
        )
      );
      setDocuments((prev) =>
        prev.filter((d) => String(d._caseId) !== String(caseId))
      );
      setTasks((prev) =>
        prev.filter((t) => String(t._caseId) !== String(caseId))
      );
      setTimeEntries((prev) =>
        prev.filter((e) => String(e.case_id) !== String(caseId))
      );
      setTimeEntriesAllForRollup((prev) =>
        prev.filter((e) => String(e.case_id) !== String(caseId))
      );
      setNotesPagination((prev) => {
        const next = { ...prev };
        delete next[String(caseId)];
        return next;
      });
      setDocumentsPagination((prev) => {
        const next = { ...prev };
        delete next[String(caseId)];
        return next;
      });
      setTasksPagination((prev) => {
        const next = { ...prev };
        delete next[String(caseId)];
        return next;
      });
      setTimeEntriesPagination((prev) => {
        const next = { ...prev };
        delete next[String(caseId)];
        return next;
      });
    } catch (error) {
      console.error("Error unlinking case:", error);
      alert("Failed to remove case from company. Please try again.");
    } finally {
      setRemovingCaseId(null);
    }
  };

  const handleUnlinkContact = async (clientId) => {
    if (!clientId) return;
    const confirmed = window.confirm(
      "Are you sure you want to remove this contact from this company?"
    );
    if (!confirmed) return;

    setRemovingContactId(clientId);
    try {
      await axios.delete(`/companies/${id}/clients/${clientId}`);
      await fetchCompany();
    } catch (error) {
      console.error("Error unlinking contact:", error);
      alert("Failed to remove contact from company. Please try again.");
    } finally {
      setRemovingContactId(null);
    }
  };

  const openAddDocumentFlow = () => {
    const caseIds = company?.cases || [];
    if (!caseIds.length) {
      alert("Please add a case first to add documents.");
      return;
    }
    setAddDocumentOpen(true);
  };

  const openAddTaskFlow = () => {
    const caseIds = company?.cases || [];
    if (!caseIds.length) {
      alert("Please add a case first to add tasks.");
      return;
    }
    setAddTaskOpen(true);
  };

  const openAddEventFlow = () => {
    const caseIds = company?.cases || [];
    if (!caseIds.length) {
      alert("Please add a case first to add events.");
      return;
    }
    setAddEventOpen(true);
  };

  const openAddTimeEntryFlow = () => {
    const caseList = company?.cases || [];
    if (!caseList.length) {
      alert("Please add a case first to add time entries.");
      return;
    }
    setAddTimeEntryOpen(true);
  };

  useEffect(() => {
    // If we received company data via navigation state, skip the initial fetch
    if (location.state?.company && String(location.state.company.id) === String(id)) {
      setCompany(location.state.company);
      setLoading(false);
      return;
    }
    fetchCompany();
  }, [id]);

  useEffect(() => {
    setTimeEntries([]);
    setTimeEntriesAllForRollup([]);
    setTimeEntriesPagination({});
    setTimeEntriesTotalsLoading(false);
    setTimeEntriesSourceMode("company");
  }, [id]);

  useEffect(() => {
    if (!company) return;
    const caseIds = company.cases?.map((c) => c.id) || [];
    if (activeTab === 2) {
      if (!caseIds.length) {
        setNotes([]);
        setNotesPagination({});
        return;
      }
      fetchNotes(caseIds);
    } else if (activeTab === 3) {
      if (!caseIds.length) {
        setTimeEntries([]);
        setTimeEntriesAllForRollup([]);
        setTimeEntriesPagination({});
        setTimeEntriesTotalsLoading(false);
        setTimeEntriesSourceMode("company");
        return;
      }
      fetchTimeEntries(caseIds);
      fetchTimeEntriesTotalsSnapshot(caseIds);
    } else if (activeTab === 4) {
      if (!caseIds.length) {
        setDocuments([]);
        setDocumentsPagination({});
        return;
      }
      fetchDocuments(caseIds);
    } else if (activeTab === 5) {
      if (!caseIds.length) {
        setTasks([]);
        setTasksPagination({});
        return;
      }
      fetchTasks(caseIds);
    } else if (activeTab === 6) {
      fetchActivities(caseIds);
    } else if (activeTab === 7) {
      if (!caseIds.length) {
        setEvents([]);
        setEventsPagination({});
        return;
      }
      fetchEvents(caseIds);
    }
  }, [activeTab, company]);

  useEffect(() => {
    const onTimeEntryUpdated = () => {
      if (activeTab !== 3) return;
      const ids = company?.cases?.map((c) => c.id) || [];
      if (ids.length) {
        fetchTimeEntries(ids);
        fetchTimeEntriesTotalsSnapshot(ids);
      }
    };
    window.addEventListener("timeEntryUpdated", onTimeEntryUpdated);
    return () => window.removeEventListener("timeEntryUpdated", onTimeEntryUpdated);
  }, [activeTab, company]);

  useEffect(() => {
    if (!addCaseOpen) return;
    const timer = setTimeout(() => {
      fetchCasesForPicker(caseSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [addCaseOpen, caseSearch, company]);

  useEffect(() => {
    if (!addContactOpen) return;
    const timer = setTimeout(() => {
      fetchContactsForPicker(contactSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [addContactOpen, contactSearch, company]);

  const timeEntryRollup = useMemo(
    () =>
      computeCompanyTimeRollup(
        timeEntriesAllForRollup,
        (company?.cases || []).map((c) => c.id)
      ),
    [timeEntriesAllForRollup, company]
  );

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const buildAddress = (c) => {
    const parts = [c.address1, c.address2, c.city, c.state, c.zip_code, c.country].filter(Boolean);
    return parts.join(", ");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!company) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography>Company not found.</Typography>
        <Button
          variant="plain"
          startDecorator={<ArrowBackIcon />}
          onClick={() => cameFrom === "cases" ? navigate("/cases", { state: { tab: 4 } }) : navigate("/contacts", { state: { tab: 1 } })}
          sx={{ mt: 2 }}
        >
          Back to Companies
        </Button>
      </Box>
    );
  }

  const address = buildAddress(company);
  const upcomingEvents = events.filter(
    (ev) => new Date(ev.start) >= new Date()
  );
  const pastEvents = events.filter((ev) => new Date(ev.start) < new Date());
  const hasMoreNotes = Object.values(notesPagination).some((meta) => meta?.hasMore);
  const hasMoreDocuments = Object.values(documentsPagination).some(
    (meta) => meta?.hasMore
  );
  const hasMoreTasks = Object.values(tasksPagination).some((meta) => meta?.hasMore);
  const hasMoreEvents = Object.values(eventsPagination).some((meta) => meta?.hasMore);
  const hasMoreTimeEntries = Object.values(timeEntriesPagination).some((meta) => meta?.hasMore);

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Back button */}
      <Button
        variant="plain"
        startDecorator={<ArrowBackIcon />}
        onClick={() => cameFrom === "cases" ? navigate("/cases", { state: { tab: 4 } }) : navigate("/contacts", { state: { tab: 1 } })}
        sx={{ mb: 2 }}
        size="sm"
      >
        Back to Companies
      </Button>

      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <CompanyDetailsSidebar
            company={company}
            address={address}
            notesCount={notes.length}
            timeEntriesCount={timeEntryRollup.logicalCount}
            getInitials={getInitials}
            onSetTab={setActiveTab}
            onEditCompany={() => setIsModalOpen(true)}
          />
        </Grid>

        <Grid xs={12} md={8}>
          <CompanyDetailsTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            company={company}
            navigate={navigate}
            removingCaseId={removingCaseId}
            removingContactId={removingContactId}
            handleUnlinkCase={handleUnlinkCase}
            handleUnlinkContact={handleUnlinkContact}
            setAddCaseOpen={setAddCaseOpen}
            setAddContactOpen={setAddContactOpen}
            setAddNoteOpen={setAddNoteOpen}
            openAddDocumentFlow={openAddDocumentFlow}
            openAddTaskFlow={openAddTaskFlow}
            openAddEventFlow={openAddEventFlow}
            openAddTimeEntryFlow={openAddTimeEntryFlow}
            notes={notes}
            notesLoading={notesLoading}
            expandedNoteId={expandedNoteId}
            setExpandedNoteId={setExpandedNoteId}
            hasMoreNotes={hasMoreNotes}
            notesLoadingMore={notesLoadingMore}
            fetchMoreNotes={fetchMoreNotes}
            timeEntries={timeEntries}
            timeEntriesLoading={timeEntriesLoading}
            hasMoreTimeEntries={hasMoreTimeEntries}
            timeEntriesLoadingMore={timeEntriesLoadingMore}
            fetchMoreTimeEntries={fetchMoreTimeEntries}
            timeEntryRollup={timeEntryRollup}
            timeEntriesTotalsLoading={timeEntriesTotalsLoading}
            documents={documents}
            documentsLoading={documentsLoading}
            hasMoreDocuments={hasMoreDocuments}
            documentsLoadingMore={documentsLoadingMore}
            fetchMoreDocuments={fetchMoreDocuments}
            tasks={tasks}
            tasksLoading={tasksLoading}
            hasMoreTasks={hasMoreTasks}
            tasksLoadingMore={tasksLoadingMore}
            fetchMoreTasks={fetchMoreTasks}
            activities={activities}
            activitiesLoading={activitiesLoading}
            events={events}
            eventsLoading={eventsLoading}
            hasMoreEvents={hasMoreEvents}
            eventsLoadingMore={eventsLoadingMore}
            fetchMoreEvents={fetchMoreEvents}
            upcomingEvents={upcomingEvents}
            pastEvents={pastEvents}
            truncate={truncate}
            stripHtml={stripHtml}
          />
        </Grid>
      </Grid>

      {/* Edit Company Modal */}
      {isModalOpen && (
        <AddCompanyModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={company}
          refresh={fetchCompany}
        />
      )}

      <AddDocumentModal
        open={addDocumentOpen}
        onClose={() => setAddDocumentOpen(false)}
        defaultCaseId={company?.cases?.[0]?.id}
        caseId={company?.cases?.[0]?.id}
        cases={(company?.cases || []).map((c) => ({
          case_id: c.id,
          name: c.name || `Case #${c.id}`,
        }))}
        singleCase={null}
        fetchDocuments={() => {
          const caseIds = (company?.cases || []).map((c) => c.id);
          fetchDocuments(caseIds);
        }}
      />

      <TaskModal
        open={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        cases={(company?.cases || []).map((c) => ({
          case_id: c.id,
          name: c.name || `Case #${c.id}`,
        }))}
        onSuccess={() => {
          const caseIds = (company?.cases || []).map((c) => c.id);
          fetchTasks(caseIds);
        }}
      />

      <Modal open={addEventOpen} onClose={() => setAddEventOpen(false)}>
        <ModalDialog>
          <AddEventForm
            caseId={company?.cases?.[0]?.id}
            cases={(company?.cases || []).map((c) => ({
              case_id: c.id,
              name: c.name || `Case #${c.id}`,
            }))}
            singleCase={null}
            onCancel={() => setAddEventOpen(false)}
            onEventAdd={() => {
              setAddEventOpen(false);
              const caseIds = (company?.cases || []).map((c) => c.id);
              fetchEvents(caseIds);
              setActiveTab(7);
            }}
          />
        </ModalDialog>
      </Modal>

      <Modal open={addCaseOpen} onClose={() => setAddCaseOpen(false)}>
        <ModalDialog sx={{ width: "100%", maxWidth: 520 }}>
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2 }}>
            Add Case to Company
          </Typography>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Case</FormLabel>
            <Autocomplete
              multiple
              placeholder="Type to search and select case(s)..."
              options={availableCases}
              getOptionLabel={(option) => option?.name || ""}
              isOptionEqualToValue={(option, value) =>
                String(option?.id) === String(value?.id)
              }
              value={selectedCases}
              onChange={(_, value) => setSelectedCases(Array.isArray(value) ? value : [])}
              inputValue={caseSearch}
              onInputChange={(_, newValue) => setCaseSearch(newValue || "")}
              disableCloseOnSelect
            />
          </FormControl>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}>
            <Button variant="outlined" onClick={() => setAddCaseOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleLinkCase}
              disabled={!selectedCases.length || addingCase}
            >
              {addingCase
                ? "Adding..."
                : selectedCases.length > 1
                  ? `Add ${selectedCases.length} Cases`
                  : "Add Case"}
            </Button>
          </Box>
        </ModalDialog>
      </Modal>

      <Modal open={addContactOpen} onClose={() => setAddContactOpen(false)}>
        <ModalDialog sx={{ width: "100%", maxWidth: 520 }}>
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2 }}>
            Add Contact to Company
          </Typography>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Contact</FormLabel>
            <Autocomplete
              placeholder="Type to search and select contact..."
              options={availableContacts}
              getOptionLabel={(option) => option?.name || ""}
              value={
                availableContacts.find(
                  (c) => String(c.id) === String(selectedContactId)
                ) || null
              }
              onChange={(_, value) => setSelectedContactId(value?.id || "")}
              inputValue={contactSearch}
              onInputChange={(_, newValue) => setContactSearch(newValue || "")}
            />
          </FormControl>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}>
            <Button variant="outlined" onClick={() => setAddContactOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleLinkContact}
              disabled={!selectedContactId || addingContact}
            >
              {addingContact ? "Adding..." : "Add Contact"}
            </Button>
          </Box>
        </ModalDialog>
      </Modal>

      <AddTimeEntryModal
        open={addTimeEntryOpen}
        onClose={() => setAddTimeEntryOpen(false)}
        caseId={company?.cases?.[0]?.id}
        parentType="case"
        cases={(company?.cases || []).map((c) => ({
          case_id: c.id,
          name: c.name || `Case #${c.id}`,
        }))}
        applyToAllCompanyCases
        companyIdForBulkTimeEntry={id}
        companyCasesForWideEntry={(company?.cases || []).map((c) => ({
          case_id: c.id,
          name: c.name || `Case #${c.id}`,
        }))}
        onSuccess={() => {
          const caseIds = (company?.cases || []).map((c) => c.id);
          fetchTimeEntries(caseIds);
          fetchTimeEntriesTotalsSnapshot(caseIds);
        }}
        onSuccessModal={() => {}}
      />

      <Modal open={addNoteOpen} onClose={() => setAddNoteOpen(false)}>
        <ModalDialog sx={{ width: "100%", maxWidth: 620 }}>
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2 }}>
            Add Note
          </Typography>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Case</FormLabel>
            <Select
              value={noteCaseId}
              placeholder="Select case"
              onChange={(_, val) => setNoteCaseId(val || "")}
            >
              {(company.cases || []).map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name || `Case #${c.id}`}
                </Option>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Subject</FormLabel>
            <Input
              placeholder="Enter subject"
              value={noteSubject}
              onChange={(e) => setNoteSubject(e.target.value)}
            />
          </FormControl>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Date</FormLabel>
            <Input
              type="date"
              value={noteDate}
              onChange={(e) => setNoteDate(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Note</FormLabel>
            <Textarea
              minRows={5}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
          </FormControl>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}>
            <Button variant="outlined" onClick={() => setAddNoteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddNote}
              disabled={!noteCaseId || !noteSubject.trim() || !noteContent.trim() || addingNote}
            >
              {addingNote ? "Adding..." : "Add Note"}
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default CompanyDetails;
