import React, { useEffect, useMemo, useState } from "react";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Option,
  Select,
  Sheet,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from "@mui/joy";
import axios from "axios";
import ApiReferenceExplorer from "./ApiReferenceExplorer";
import { activeUsersCategory, activeUsersEndpoints } from "../data/apiReferenceActiveUsers";
import { activeUsersBasicCategory, activeUsersBasicEndpoints } from "../data/apiReferenceActiveUsersBasic";
import { activitiesFeedCategory, activitiesFeedEndpoints } from "../data/apiReferenceActivitiesFeed";
import { activityCrudCategory, activityCrudEndpoints } from "../data/apiReferenceActivityCrud";
import { apiPrefixCategory, apiPrefixEndpoints } from "../data/apiReferenceApiPrefix";
import { automationsCategory, automationsEndpoints } from "../data/apiReferenceAutomations";
import { caseNotesCategory, caseNotesEndpoints } from "../data/apiReferenceCaseNotes";
import { caseNotesAllCategory, caseNotesAllEndpoints } from "../data/apiReferenceCaseNotesAll";
import { caseStagesCategory, caseStagesEndpoints } from "../data/apiReferenceCaseStages";
import { casesCategory, casesEndpoints } from "../data/apiReferenceCases";
import { casessCategory, casessEndpoints } from "../data/apiReferenceCasess";
import { clientsCategory, clientsEndpoints } from "../data/apiReferenceClients";
import { columnsCategory, columnsEndpoints } from "../data/apiReferenceColumns";
import { companiesCategory, companiesEndpoints } from "../data/apiReferenceCompanies";
import { contactsCategory, contactsEndpoints } from "../data/apiReferenceContacts";
import { customFieldsCategory, customFieldsEndpoints } from "../data/apiReferenceCustomFields";
import { documentsRootCategory, documentsRootEndpoints } from "../data/apiReferenceDocumentsRoot";
import {
  emailListsByPracticeAreaCategory,
  emailListsByPracticeAreaEndpoints,
} from "../data/apiReferenceEmailListsByPracticeArea";
import {
  employeeClosureCasesCategory,
  employeeClosureCasesEndpoints,
} from "../data/apiReferenceEmployeeClosureCases";
import {
  employeeMilestonesCategory,
  employeeMilestonesEndpoints,
} from "../data/apiReferenceEmployeeMilestones";
import {
  employeeNewClientCasesCategory,
  employeeNewClientCasesEndpoints,
} from "../data/apiReferenceEmployeeNewClientCases";
import { esignTemplateCategory, esignTemplateEndpoints } from "../data/apiReferenceEsignTemplate";
import { eventTypesCategory, eventTypesEndpoints } from "../data/apiReferenceEventTypes";
import { eventsCategory, eventsEndpoints } from "../data/apiReferenceEvents";
import { expensesCategory, expensesEndpoints } from "../data/apiReferenceExpenses";
import { faxCategory, faxEndpoints } from "../data/apiReferenceFax";
import {
  generateDocumentCategory,
  generateDocumentEndpoints,
} from "../data/apiReferenceGenerateDocument";
import {
  generateDocumentEsignCategory,
  generateDocumentEsignEndpoints,
} from "../data/apiReferenceGenerateDocumentEsign";
import {
  initialDisclosuresCategory,
  initialDisclosuresEndpoints,
} from "../data/apiReferenceInitialDisclosures";
import {
  monthlyCasesOpenedClosedCategory,
  monthlyCasesOpenedClosedEndpoints,
} from "../data/apiReferenceMonthlyCasesOpenedClosed";
import {
  newClientByPracticeAreaCategory,
  newClientByPracticeAreaEndpoints,
} from "../data/apiReferenceNewClientByPracticeArea";
import {
  newClientCasesByPracticeAreaCategory,
  newClientCasesByPracticeAreaEndpoints,
} from "../data/apiReferenceNewClientCasesByPracticeArea";
import {
  practiceAreasCategory,
  practiceAreasEndpoints,
} from "../data/apiReferencePracticeAreas";
import { saveReportCategory, saveReportEndpoints } from "../data/apiReferenceSaveReport";
import {
  savedReportsCategory,
  savedReportsEndpoints,
} from "../data/apiReferenceSavedReports";
import { smsCategory, smsEndpoints } from "../data/apiReferenceSms";
import { tasksCategory, tasksEndpoints } from "../data/apiReferenceTasks";
import { templatesCategory, templatesEndpoints } from "../data/apiReferenceTemplates";
import { timeEntriesCategory, timeEntriesEndpoints } from "../data/apiReferenceTimeEntries";
import { todayHoursCategory, todayHoursEndpoints } from "../data/apiReferenceTodayHours";
import { userReportsCategory, userReportsEndpoints } from "../data/apiReferenceUserReports";
import { usersCategory, usersEndpoints } from "../data/apiReferenceUsers";
import { wopiCategory, wopiEndpoints } from "../data/apiReferenceWopi";
import {
  tasksCaseInformationCategory,
  tasksCaseInformationEndpoints,
} from "../data/apiReferenceTasksCaseInformation";

const methodColors = {
  GET: "success",
  POST: "primary",
  PUT: "warning",
  PATCH: "warning",
  DELETE: "danger",
};

const baseUrlOptions = [
  "",
  "https://dev.louislawgroup.com",
  "https://external-applications.louislawgroup.com",
];

const routeQueryTemplates = {
  "/today_hours": "user_id=<uid>",
};

/** Tab index 0 = full route list from GET /api/endpoints; curated guides are 1–43. */
const DEFAULT_DOC_TAB = 0;

export default function ApiDocumentation() {
  const [docTab, setDocTab] = useState(DEFAULT_DOC_TAB);
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [copiedKey, setCopiedKey] = useState("");
  const [selectedBaseUrl, setSelectedBaseUrl] = useState(baseUrlOptions[0]);

  useEffect(() => {
    let active = true;

    const loadEndpoints = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/endpoints");
        if (!active) return;
        setEndpoints(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        if (!active) return;
        setError("Unable to load API endpoints.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadEndpoints();
    return () => {
      active = false;
    };
  }, []);

  const groupedEndpoints = useMemo(() => {
    const filteredEndpoints = endpoints.filter((endpoint) => {
      const methodMatch = methodFilter === "ALL" || endpoint?.method === methodFilter;
      const searchable = `${endpoint?.method || ""} ${endpoint?.path || ""}`.toLowerCase();
      const searchMatch = searchable.includes(searchTerm.trim().toLowerCase());
      return methodMatch && searchMatch;
    });

    const groups = {};
    filteredEndpoints.forEach((endpoint) => {
      const path = endpoint?.path || "";
      const root = path.split("/").filter(Boolean)[0] || "root";
      if (!groups[root]) groups[root] = [];
      groups[root].push(endpoint);
    });

    return Object.entries(groups)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([group, items]) => [
        group,
        items.sort((a, b) => {
          if (a.path === b.path) return a.method.localeCompare(b.method);
          return a.path.localeCompare(b.path);
        }),
      ]);
  }, [endpoints, methodFilter, searchTerm]);

  const totalVisibleEndpoints = groupedEndpoints.reduce(
    (acc, [, items]) => acc + items.length,
    0
  );

  const methodCounts = useMemo(() => {
    const counts = { GET: 0, POST: 0, PUT: 0, PATCH: 0, DELETE: 0 };
    endpoints.forEach((endpoint) => {
      if (counts[endpoint?.method] !== undefined) counts[endpoint.method] += 1;
    });
    return counts;
  }, [endpoints]);

  const handleCopy = async (path) => {
    const normalizedPath = buildRouteTemplate(path);
    const value = selectedBaseUrl
      ? `${selectedBaseUrl}${normalizedPath}`.replace(/([^:]\/)\/+/g, "$1")
      : normalizedPath;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(value);
      setTimeout(() => setCopiedKey(""), 1200);
    } catch (copyError) {
      setCopiedKey("");
    }
  };

  const buildFullUrl = (path) => {
    const normalizedPath = buildRouteTemplate(path);
    return selectedBaseUrl
      ? `${selectedBaseUrl}${normalizedPath}`.replace(/([^:]\/)\/+/g, "$1")
      : normalizedPath;
  };

  const buildRouteTemplate = (path) => {
    const normalizedPath = path?.startsWith("/") ? path : `/${path || ""}`;
    const queryTemplate = routeQueryTemplates[normalizedPath];
    if (!queryTemplate) return normalizedPath;
    return `${normalizedPath}?${queryTemplate}`;
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "100%" }}>
      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "lg",
          p: { xs: 2, md: 2.75 },
          mb: 2.5,
          borderColor: "neutral.outlinedBorder",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, rgba(57, 113, 193, 0.14) 0%, rgba(57, 113, 193, 0.04) 45%, rgba(255,255,255,0) 100%)",
          boxShadow: "sm",
          "&::before": {
            content: '""',
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            borderRadius: "lg 0 0 lg",
            bgcolor: "primary.500",
            opacity: 0.85,
          },
        }}
      >
        <Box sx={{ pl: { xs: 0.5, sm: 1 } }}>
          <Chip size="sm" variant="soft" color="primary" sx={{ mb: 1.25, fontWeight: 600 }}>
            API reference
          </Chip>
          <Typography
            level="h3"
            sx={{
              mb: 0.75,
              letterSpacing: "-0.02em",
              fontWeight: 700,
            }}
          >
            API Documentation
          </Typography>
          <Typography level="body-sm" sx={{ color: "text.secondary", maxWidth: "min(52ch, 100%)" }}>
            Curated endpoint guides by route group, plus a live list of every route the server exposes.
          </Typography>
        </Box>
      </Sheet>

      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "lg",
          overflow: "hidden",
          mb: 2,
          borderColor: "neutral.outlinedBorder",
          boxShadow: "sm",
        }}
      >
        <Tabs
          value={docTab}
          onChange={(_, v) => setDocTab(v)}
          sx={{
            bgcolor: "background.surface",
            "--Tabs-gap": "0px",
          }}
        >
        <TabList
          sx={{
            flexWrap: "wrap",
            gap: 1,
            rowGap: 1.25,
            p: { xs: 1.25, sm: 1.75 },
            bgcolor: "background.level1",
            borderBottom: "1px solid",
            borderColor: "divider",
            "& .MuiTab-root": {
              borderRadius: "md",
              fontSize: "0.8125rem",
              fontWeight: 500,
              minHeight: 34,
              py: 0.65,
              px: 1.2,
              transition: "background-color 0.15s ease, box-shadow 0.15s ease, color 0.15s ease",
              "&:hover": {
                bgcolor: "background.level2",
              },
              '&[aria-selected="true"]': {
                boxShadow: "sm",
                fontWeight: 600,
              },
            },
          }}
        >
          <Tab variant="soft" color={docTab === 0 ? "primary" : "neutral"}>
            All endpoints
          </Tab>
          <Tab variant="soft" color={docTab === 1 ? "primary" : "neutral"}>
            Active Users
          </Tab>
          <Tab variant="soft" color={docTab === 2 ? "primary" : "neutral"}>
            active_users_basic
          </Tab>
          <Tab variant="soft" color={docTab === 3 ? "primary" : "neutral"}>
            /activities
          </Tab>
          <Tab variant="soft" color={docTab === 4 ? "primary" : "neutral"}>
            /activity
          </Tab>
          <Tab variant="soft" color={docTab === 5 ? "primary" : "neutral"}>
            /api
          </Tab>
          <Tab variant="soft" color={docTab === 6 ? "primary" : "neutral"}>
            /automations
          </Tab>
          <Tab variant="soft" color={docTab === 7 ? "primary" : "neutral"}>
            /case_notes
          </Tab>
          <Tab variant="soft" color={docTab === 8 ? "primary" : "neutral"}>
            /case_notes_all
          </Tab>
          <Tab variant="soft" color={docTab === 9 ? "primary" : "neutral"}>
            /case_stages
          </Tab>
          <Tab variant="soft" color={docTab === 10 ? "primary" : "neutral"}>
            /cases
          </Tab>
          <Tab variant="soft" color={docTab === 11 ? "primary" : "neutral"}>
            /casess
          </Tab>
          <Tab variant="soft" color={docTab === 12 ? "primary" : "neutral"}>
            /clients
          </Tab>
          <Tab variant="soft" color={docTab === 13 ? "primary" : "neutral"}>
            /columns
          </Tab>
          <Tab variant="soft" color={docTab === 14 ? "primary" : "neutral"}>
            /companies
          </Tab>
          <Tab variant="soft" color={docTab === 15 ? "primary" : "neutral"}>
            /contacts
          </Tab>
          <Tab variant="soft" color={docTab === 16 ? "primary" : "neutral"}>
            /custom_fields
          </Tab>
          <Tab variant="soft" color={docTab === 17 ? "primary" : "neutral"}>
            /documents
          </Tab>
          <Tab variant="soft" color={docTab === 18 ? "primary" : "neutral"}>
            /email_lists_by_practice_area
          </Tab>
          <Tab variant="soft" color={docTab === 19 ? "primary" : "neutral"}>
            /employee_closure_cases
          </Tab>
          <Tab variant="soft" color={docTab === 20 ? "primary" : "neutral"}>
            /employee_milestones
          </Tab>
          <Tab variant="soft" color={docTab === 21 ? "primary" : "neutral"}>
            /employee_new_client_cases
          </Tab>
          <Tab variant="soft" color={docTab === 22 ? "primary" : "neutral"}>
            /esign-template
          </Tab>
          <Tab variant="soft" color={docTab === 23 ? "primary" : "neutral"}>
            /event-types
          </Tab>
          <Tab variant="soft" color={docTab === 24 ? "primary" : "neutral"}>
            /events
          </Tab>
          <Tab variant="soft" color={docTab === 25 ? "primary" : "neutral"}>
            /expenses
          </Tab>
          <Tab variant="soft" color={docTab === 26 ? "primary" : "neutral"}>
            /generate-document
          </Tab>
          <Tab variant="soft" color={docTab === 27 ? "primary" : "neutral"}>
            /generate-documentESIGN
          </Tab>
          <Tab variant="soft" color={docTab === 28 ? "primary" : "neutral"}>
            /initial-disclosures
          </Tab>
          <Tab variant="soft" color={docTab === 29 ? "primary" : "neutral"}>
            /monthly_cases_opened_closed
          </Tab>
          <Tab variant="soft" color={docTab === 30 ? "primary" : "neutral"}>
            /new_client_by_practice_area
          </Tab>
          <Tab variant="soft" color={docTab === 31 ? "primary" : "neutral"}>
            /new_client_cases_by_practice_area
          </Tab>
          <Tab variant="soft" color={docTab === 32 ? "primary" : "neutral"}>
            /practice_areas
          </Tab>
          <Tab variant="soft" color={docTab === 33 ? "primary" : "neutral"}>
            /save_report
          </Tab>
          <Tab variant="soft" color={docTab === 34 ? "primary" : "neutral"}>
            /saved_reports
          </Tab>
          <Tab variant="soft" color={docTab === 35 ? "primary" : "neutral"}>
            /sms
          </Tab>
          <Tab variant="soft" color={docTab === 36 ? "primary" : "neutral"}>
            /tasks
          </Tab>
          <Tab variant="soft" color={docTab === 37 ? "primary" : "neutral"}>
            /tasksCaseInformation
          </Tab>
          <Tab variant="soft" color={docTab === 38 ? "primary" : "neutral"}>
            /templates
          </Tab>
          <Tab variant="soft" color={docTab === 39 ? "primary" : "neutral"}>
            /time_entries
          </Tab>
          <Tab variant="soft" color={docTab === 40 ? "primary" : "neutral"}>
            /today_hours
          </Tab>
          <Tab variant="soft" color={docTab === 41 ? "primary" : "neutral"}>
            /user_reports
          </Tab>
          <Tab variant="soft" color={docTab === 42 ? "primary" : "neutral"}>
            /users
          </Tab>
          <Tab variant="soft" color={docTab === 43 ? "primary" : "neutral"}>
            /wopi
          </Tab>
          <Tab variant="soft" color={docTab === 44 ? "primary" : "neutral"}>
            /fax
          </Tab>
        </TabList>

        <TabPanel value={1} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={activeUsersCategory.title}
            categoryDescription={activeUsersCategory.description}
            endpoints={activeUsersEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={2} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={activeUsersBasicCategory.title}
            categoryDescription={activeUsersBasicCategory.description}
            endpoints={activeUsersBasicEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={3} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={activitiesFeedCategory.title}
            categoryDescription={activitiesFeedCategory.description}
            endpoints={activitiesFeedEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={4} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={activityCrudCategory.title}
            categoryDescription={activityCrudCategory.description}
            endpoints={activityCrudEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={5} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={apiPrefixCategory.title}
            categoryDescription={apiPrefixCategory.description}
            endpoints={apiPrefixEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={6} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={automationsCategory.title}
            categoryDescription={automationsCategory.description}
            endpoints={automationsEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={7} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={caseNotesCategory.title}
            categoryDescription={caseNotesCategory.description}
            endpoints={caseNotesEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={8} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={caseNotesAllCategory.title}
            categoryDescription={caseNotesAllCategory.description}
            endpoints={caseNotesAllEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={9} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={caseStagesCategory.title}
            categoryDescription={caseStagesCategory.description}
            endpoints={caseStagesEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={10} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={casesCategory.title}
            categoryDescription={casesCategory.description}
            endpoints={casesEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={11} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={casessCategory.title}
            categoryDescription={casessCategory.description}
            endpoints={casessEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={12} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={clientsCategory.title}
            categoryDescription={clientsCategory.description}
            endpoints={clientsEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={13} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={columnsCategory.title}
            categoryDescription={columnsCategory.description}
            endpoints={columnsEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={14} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={companiesCategory.title}
            categoryDescription={companiesCategory.description}
            endpoints={companiesEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={15} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={contactsCategory.title}
            categoryDescription={contactsCategory.description}
            endpoints={contactsEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={16} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={customFieldsCategory.title}
            categoryDescription={customFieldsCategory.description}
            endpoints={customFieldsEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={17} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={documentsRootCategory.title}
            categoryDescription={documentsRootCategory.description}
            endpoints={documentsRootEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={18} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={emailListsByPracticeAreaCategory.title}
            categoryDescription={emailListsByPracticeAreaCategory.description}
            endpoints={emailListsByPracticeAreaEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={19} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={employeeClosureCasesCategory.title}
            categoryDescription={employeeClosureCasesCategory.description}
            endpoints={employeeClosureCasesEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={20} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={employeeMilestonesCategory.title}
            categoryDescription={employeeMilestonesCategory.description}
            endpoints={employeeMilestonesEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={21} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={employeeNewClientCasesCategory.title}
            categoryDescription={employeeNewClientCasesCategory.description}
            endpoints={employeeNewClientCasesEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={22} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={esignTemplateCategory.title}
            categoryDescription={esignTemplateCategory.description}
            endpoints={esignTemplateEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={23} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={eventTypesCategory.title}
            categoryDescription={eventTypesCategory.description}
            endpoints={eventTypesEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={24} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={eventsCategory.title}
            categoryDescription={eventsCategory.description}
            endpoints={eventsEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={25} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={expensesCategory.title}
            categoryDescription={expensesCategory.description}
            endpoints={expensesEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={26} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={generateDocumentCategory.title}
            categoryDescription={generateDocumentCategory.description}
            endpoints={generateDocumentEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={27} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={generateDocumentEsignCategory.title}
            categoryDescription={generateDocumentEsignCategory.description}
            endpoints={generateDocumentEsignEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={28} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={initialDisclosuresCategory.title}
            categoryDescription={initialDisclosuresCategory.description}
            endpoints={initialDisclosuresEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={29} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={monthlyCasesOpenedClosedCategory.title}
            categoryDescription={monthlyCasesOpenedClosedCategory.description}
            endpoints={monthlyCasesOpenedClosedEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={30} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={newClientByPracticeAreaCategory.title}
            categoryDescription={newClientByPracticeAreaCategory.description}
            endpoints={newClientByPracticeAreaEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={31} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={newClientCasesByPracticeAreaCategory.title}
            categoryDescription={newClientCasesByPracticeAreaCategory.description}
            endpoints={newClientCasesByPracticeAreaEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={32} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={practiceAreasCategory.title}
            categoryDescription={practiceAreasCategory.description}
            endpoints={practiceAreasEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={33} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={saveReportCategory.title}
            categoryDescription={saveReportCategory.description}
            endpoints={saveReportEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={34} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={savedReportsCategory.title}
            categoryDescription={savedReportsCategory.description}
            endpoints={savedReportsEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={35} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={smsCategory.title}
            categoryDescription={smsCategory.description}
            endpoints={smsEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={36} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={tasksCategory.title}
            categoryDescription={tasksCategory.description}
            endpoints={tasksEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={37} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={tasksCaseInformationCategory.title}
            categoryDescription={tasksCaseInformationCategory.description}
            endpoints={tasksCaseInformationEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={38} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={templatesCategory.title}
            categoryDescription={templatesCategory.description}
            endpoints={templatesEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={39} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={timeEntriesCategory.title}
            categoryDescription={timeEntriesCategory.description}
            endpoints={timeEntriesEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={40} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={todayHoursCategory.title}
            categoryDescription={todayHoursCategory.description}
            endpoints={todayHoursEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={41} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={userReportsCategory.title}
            categoryDescription={userReportsCategory.description}
            endpoints={userReportsEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={42} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={usersCategory.title}
            categoryDescription={usersCategory.description}
            endpoints={usersEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={43} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={wopiCategory.title}
            categoryDescription={wopiCategory.description}
            endpoints={wopiEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={44} sx={{ p: 0, pt: 2.5 }}>
          <ApiReferenceExplorer
            categoryTitle={faxCategory.title}
            categoryDescription={faxCategory.description}
            endpoints={faxEndpoints}
            selectedBaseUrl={selectedBaseUrl}
            onBaseUrlChange={setSelectedBaseUrl}
            baseUrlOptions={baseUrlOptions}
          />
        </TabPanel>

        <TabPanel value={0} sx={{ p: 0, pt: 2.5 }}>
          {loading ? (
            <Sheet
              variant="soft"
              sx={{
                borderRadius: "lg",
                p: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.25,
                minHeight: 160,
              }}
            >
              <CircularProgress size="sm" />
              <Typography level="body-md">Loading API endpoints...</Typography>
            </Sheet>
          ) : error ? (
            <Sheet
              variant="soft"
              color="danger"
              sx={{ borderRadius: "lg", p: 2.5, border: "1px solid", borderColor: "danger.200" }}
            >
              <Typography level="title-sm" color="danger">
                Failed to load endpoint list
              </Typography>
              <Typography level="body-sm" sx={{ mt: 0.75 }}>
                {error}
              </Typography>
            </Sheet>
          ) : (
            <>
              <Sheet
                variant="outlined"
                sx={{
                  borderRadius: "lg",
                  p: { xs: 1.75, md: 2.25 },
                  mb: 2,
                  borderColor: "neutral.outlinedBorder",
                  bgcolor: "background.level1",
                  boxShadow: "sm",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "flex-end" },
                    justifyContent: "space-between",
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography level="title-md" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
                      Route explorer
                    </Typography>
                    <Typography level="body-sm" sx={{ color: "text.secondary", mt: 0.5, maxWidth: "min(56ch, 100%)" }}>
                      Live list from{" "}
                      <Box component="span" sx={{ fontFamily: "ui-monospace, monospace", fontSize: "0.9em" }}>
                        GET /api/endpoints
                      </Box>
                      . Filter, then copy full URLs using the domain below.
                    </Typography>
                  </Box>
                  <Chip size="md" variant="soft" color="primary" sx={{ fontWeight: 600 }}>
                    {totalVisibleEndpoints} / {endpoints.length} visible
                  </Chip>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
                    gap: 1.25,
                    mb: 2,
                  }}
                >
                  <Sheet
                    variant="soft"
                    sx={{
                      borderRadius: "md",
                      p: 1.35,
                      bgcolor: "background.surface",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography level="body-xs" sx={{ color: "text.secondary", fontWeight: 600 }}>
                      Total routes
                    </Typography>
                    <Typography level="h2" sx={{ fontSize: "1.75rem", mt: 0.25 }}>
                      {endpoints.length}
                    </Typography>
                  </Sheet>
                  <Sheet
                    variant="soft"
                    sx={{
                      borderRadius: "md",
                      p: 1.35,
                      bgcolor: "background.surface",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography level="body-xs" sx={{ color: "text.secondary", fontWeight: 600 }}>
                      After filters
                    </Typography>
                    <Typography level="h2" sx={{ fontSize: "1.75rem", mt: 0.25 }}>
                      {totalVisibleEndpoints}
                    </Typography>
                  </Sheet>
                  <Sheet
                    variant="soft"
                    sx={{
                      borderRadius: "md",
                      p: 1.35,
                      bgcolor: "background.surface",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography level="body-xs" sx={{ color: "text.secondary", fontWeight: 600 }}>
                      Path groups
                    </Typography>
                    <Typography level="h2" sx={{ fontSize: "1.75rem", mt: 0.25 }}>
                      {groupedEndpoints.length}
                    </Typography>
                  </Sheet>
                </Box>

                <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 2 }}>
                  {Object.entries(methodCounts).map(([method, count]) => (
                    <Chip key={method} size="sm" color={methodColors[method]} variant="soft" sx={{ fontWeight: 600 }}>
                      {method} · {count}
                    </Chip>
                  ))}
                </Box>

                <Sheet
                  variant="soft"
                  sx={{
                    p: { xs: 1.25, sm: 1.5 },
                    borderRadius: "md",
                    bgcolor: "background.surface",
                    border: "1px solid",
                    borderColor: "divider",
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    boxShadow: "sm",
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", lg: "1fr minmax(140px, 180px) minmax(200px, 1fr)" },
                      gap: { xs: 1.5, lg: 2 },
                      alignItems: "end",
                    }}
                  >
                    <FormControl sx={{ flex: 1 }}>
                      <FormLabel sx={{ mb: 0.75 }}>Search</FormLabel>
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Path or method, e.g. cases, GET…"
                        size="md"
                        startDecorator={<SearchRoundedIcon sx={{ color: "text.tertiary" }} />}
                      />
                    </FormControl>
                    <FormControl sx={{ minWidth: 0 }}>
                      <FormLabel sx={{ mb: 0.75 }}>HTTP method</FormLabel>
                      <Select
                        value={methodFilter}
                        onChange={(_, value) => setMethodFilter(value || "ALL")}
                        size="md"
                      >
                        <Option value="ALL">All methods</Option>
                        <Option value="GET">GET</Option>
                        <Option value="POST">POST</Option>
                        <Option value="PUT">PUT</Option>
                        <Option value="PATCH">PATCH</Option>
                        <Option value="DELETE">DELETE</Option>
                      </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 0 }}>
                      <FormLabel sx={{ mb: 0.75 }}>Copy base URL</FormLabel>
                      <Select
                        value={selectedBaseUrl}
                        onChange={(_, value) => setSelectedBaseUrl(value ?? "")}
                        size="md"
                      >
                        <Option value="">No domain (path only)</Option>
                        <Option value="https://dev.louislawgroup.com">
                          https://dev.louislawgroup.com
                        </Option>
                        <Option value="https://external-applications.louislawgroup.com">
                          https://external-applications.louislawgroup.com
                        </Option>
                      </Select>
                    </FormControl>
                  </Box>
                  <Typography level="body-xs" sx={{ mt: 1.25, color: "text.tertiary" }}>
                    Copies prepend: {selectedBaseUrl || "(path only)"}
                  </Typography>
                </Sheet>
              </Sheet>

      {groupedEndpoints.length === 0 ? (
        <Sheet variant="soft" sx={{ borderRadius: "lg", p: 2.5 }}>
          <Typography level="title-sm">No matching endpoints found.</Typography>
          <Typography level="body-sm" sx={{ mt: 0.5, color: "text.secondary" }}>
            Try changing the search term or method filter.
          </Typography>
        </Sheet>
      ) : (
        groupedEndpoints.map(([group, items]) => (
          <Sheet
            key={group}
            variant="outlined"
            sx={{
              mb: 2,
              borderRadius: "lg",
              overflow: "hidden",
              borderColor: "neutral.outlinedBorder",
            }}
          >
            <Box
              sx={{
                px: { xs: 1.5, md: 2 },
                py: 1.2,
                bgcolor: "background.level1",
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography level="title-md" sx={{ textTransform: "capitalize" }}>
                /{group}
              </Typography>
              <Chip size="sm" variant="soft">
                {items.length} endpoint{items.length !== 1 ? "s" : ""}
              </Chip>
            </Box>

            <Box sx={{ px: { xs: 1.5, md: 2 }, py: 1.25 }}>
              <Box
                sx={{
                  display: { xs: "none", sm: "grid" },
                  gridTemplateColumns: "92px 1fr 86px",
                  alignItems: "center",
                  gap: 1.25,
                  pb: 1,
                }}
              >
                <Typography level="body-xs" sx={{ color: "text.tertiary", fontWeight: 700 }}>
                  METHOD
                </Typography>
                <Typography level="body-xs" sx={{ color: "text.tertiary", fontWeight: 700 }}>
                  ENDPOINT
                </Typography>
                <Typography
                  level="body-xs"
                  sx={{ color: "text.tertiary", fontWeight: 700, textAlign: "right" }}
                >
                  ACTION
                </Typography>
              </Box>
              <Divider />
              {items.map((item, index) => (
                <React.Fragment key={`${item.method}-${item.path}`}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "92px 1fr 86px" },
                      alignItems: "center",
                      gap: 1.25,
                      py: 1,
                      transition: "background-color 0.15s ease",
                      borderRadius: "sm",
                      "&:hover": {
                        bgcolor: "background.level1",
                      },
                    }}
                  >
                    <Chip
                      size="sm"
                      color={methodColors[item.method] || "neutral"}
                      variant="solid"
                      sx={{ width: 80, justifyContent: "center", fontWeight: 700 }}
                    >
                      {item.method}
                    </Chip>
                    <Typography fontFamily="monospace" sx={{ wordBreak: "break-all" }}>
                      {buildRouteTemplate(item.path)}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
                      <Button
                        size="sm"
                        variant="soft"
                        onClick={() => handleCopy(item.path)}
                      >
                        {copiedKey === buildFullUrl(item.path) ? "Copied" : "Copy"}
                      </Button>
                    </Box>
                  </Box>
                  {index < items.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Box>
          </Sheet>
        ))
      )}
            </>
          )}
        </TabPanel>
      </Tabs>
      </Sheet>
    </Box>
  );
}
