import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  Tabs,
  Tab,
  TabList,
  TabPanel,
  CircularProgress,
} from "@mui/joy";
import moment from "moment";
import FolderIcon from "@mui/icons-material/Folder";
import PeopleIcon from "@mui/icons-material/People";
import NotesIcon from "@mui/icons-material/Notes";
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";

export default function CompanyDetailsTabs(props) {
  const {
    activeTab,
    setActiveTab,
    company,
    navigate,
    removingCaseId,
    removingContactId,
    handleUnlinkCase,
    handleUnlinkContact,
    setAddCaseOpen,
    setAddContactOpen,
    setAddNoteOpen,
    openAddDocumentFlow,
    openAddTaskFlow,
    openAddEventFlow,
    openAddTimeEntryFlow,
    notes,
    notesLoading,
    expandedNoteId,
    setExpandedNoteId,
    hasMoreNotes,
    notesLoadingMore,
    fetchMoreNotes,
    timeEntries,
    timeEntriesLoading,
    hasMoreTimeEntries,
    timeEntriesLoadingMore,
    fetchMoreTimeEntries,
    timeEntryRollup = {
      logicalCount: 0,
      totalHours: 0,
      totalMoney: 0,
      billableMoney: 0,
      nonBillableMoney: 0,
      rowCount: 0,
    },
    timeEntriesTotalsLoading = false,
    documents,
    documentsLoading,
    hasMoreDocuments,
    documentsLoadingMore,
    fetchMoreDocuments,
    tasks,
    tasksLoading,
    hasMoreTasks,
    tasksLoadingMore,
    fetchMoreTasks,
    activities,
    activitiesLoading,
    events,
    eventsLoading,
    hasMoreEvents,
    eventsLoadingMore,
    fetchMoreEvents,
    upcomingEvents,
    pastEvents,
    truncate,
    stripHtml,
  } = props;

  const moneyFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const hoursFmt = (n) => {
    const x = Number(n) || 0;
    return `${x % 1 === 0 ? x.toFixed(0) : x.toFixed(2)} h`;
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <TabList>
            <Tab>Cases</Tab>
            {/* Contacts tab hidden temporarily */}
            <Tab sx={{ display: "none" }}>Contacts</Tab>
            <Tab>Notes</Tab>
            <Tab>Time Entries</Tab>
            <Tab>Documents</Tab>
            <Tab>Tasks</Tab>
            <Tab>Activity</Tab>
            <Tab>Calendar Events</Tab>
          </TabList>

          <TabPanel value={0}>
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Typography level="title-md">
                Associated Cases ({company.cases?.length || 0})
              </Typography>
              <Button size="sm" onClick={() => setAddCaseOpen(true)}>
                Add Case
              </Button>
            </Box>
            {company.cases?.length > 0 ? (
              <List>
                {company.cases.map((caseItem) => (
                  <ListItem
                    key={caseItem.id}
                    sx={{
                      borderRadius: "sm",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      "&:hover": { backgroundColor: "background.level1" },
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", minWidth: 0, flex: 1, cursor: "pointer" }}
                      onClick={() => navigate(`/cases/${caseItem.id}`)}
                    >
                      <ListItemDecorator>
                        <FolderIcon />
                      </ListItemDecorator>
                      <ListItemContent>
                        <Typography level="title-sm">
                          {caseItem.name || "Unnamed Case"}
                        </Typography>
                        <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                          {[caseItem.case_stage, caseItem.practice_area].filter(Boolean).join(" • ") || "No details"}
                        </Typography>
                      </ListItemContent>
                    </Box>
                    <Button
                      size="sm"
                      variant="plain"
                      color="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlinkCase(caseItem.id);
                      }}
                      disabled={removingCaseId === caseItem.id}
                    >
                      {removingCaseId === caseItem.id ? "Removing..." : "Remove"}
                    </Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                No cases associated with this company.
              </Typography>
            )}
          </TabPanel>

          <TabPanel value={1}>
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Typography level="title-md">
                Associated Contacts ({company.clients?.length || 0})
              </Typography>
              <Button size="sm" onClick={() => setAddContactOpen(true)}>
                Add Contact
              </Button>
            </Box>
            {company.clients?.length > 0 ? (
              <List>
                {company.clients.map((client) => (
                  <ListItem
                    key={client.id}
                    sx={{
                      borderRadius: "sm",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      "&:hover": { backgroundColor: "background.level1" },
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", minWidth: 0, flex: 1, cursor: "pointer" }}
                      onClick={() => navigate(`/contacts/${client.id}`)}
                    >
                      <ListItemDecorator>
                        <PeopleIcon />
                      </ListItemDecorator>
                      <ListItemContent>
                        <Typography level="title-sm">
                          {client.name || "Unnamed Contact"}
                        </Typography>
                        <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                          {client.email || client.phone || "No details"}
                        </Typography>
                      </ListItemContent>
                    </Box>
                    <Button
                      size="sm"
                      variant="plain"
                      color="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlinkContact(client.id);
                      }}
                      disabled={removingContactId === client.id}
                    >
                      {removingContactId === client.id ? "Removing..." : "Remove"}
                    </Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                No contacts associated with this company.
              </Typography>
            )}
          </TabPanel>

          <TabPanel value={2}>
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Typography level="title-md">Case Notes ({notes.length})</Typography>
              <Button size="sm" onClick={() => setAddNoteOpen(true)} disabled={!company.cases?.length}>
                Add Note
              </Button>
            </Box>
            {notesLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : notes.length > 0 ? (
              <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
                <List>
                  {notes.map((note) => {
                    const isExpanded = expandedNoteId === note.id;
                    return (
                      <ListItem
                        key={note.id}
                        sx={{
                          flexDirection: "column",
                          alignItems: "stretch",
                          borderRadius: "sm",
                          border: "1px solid",
                          borderColor: isExpanded ? "primary.200" : "neutral.200",
                          mb: 1,
                          p: 0,
                          cursor: "pointer",
                          "&:hover": { backgroundColor: "background.level1" },
                        }}
                        onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5 }}>
                          <NotesIcon sx={{ fontSize: 18, color: "text.tertiary" }} />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography level="title-sm" sx={{ fontWeight: 600 }}>
                              {note.subject || "Untitled Note"}
                            </Typography>
                            <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                              {note._caseName} {" • "}
                              {note.date
                                ? moment(note.date, "MMMM D, YYYY [at] h:mm:ss A").isValid()
                                  ? moment(note.date, "MMMM D, YYYY [at] h:mm:ss A").format("MMM D, YYYY")
                                  : moment(note.date).format("MMM D, YYYY")
                                : note.createdAt
                                  ? moment(note.createdAt).format("MMM D, YYYY")
                                  : ""}
                              {note.createdBy || note.createdByStaff
                                ? ` • by ${note.createdBy || note.createdByStaff}`
                                : ""}
                            </Typography>
                          </Box>
                        </Box>
                        {isExpanded && (
                          <Box sx={{ px: 2, pb: 1.5, borderTop: "1px solid", borderColor: "neutral.200" }}>
                            <Box
                              sx={{ mt: 1, "& p": { margin: 0 }, "& img": { maxWidth: "100%" }, fontSize: "0.875rem" }}
                              dangerouslySetInnerHTML={{ __html: note.note || "<em>No content</em>" }}
                            />
                          </Box>
                        )}
                      </ListItem>
                    );
                  })}
                </List>
                {hasMoreNotes && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                    <Button size="sm" variant="soft" onClick={fetchMoreNotes} disabled={notesLoadingMore}>
                      {notesLoadingMore ? "Loading..." : "Show More"}
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                No notes found for this company's cases.
              </Typography>
            )}
          </TabPanel>

          <TabPanel value={3}>
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
              <Box>
                <Typography level="title-md">
                  Time Entries
                  {!timeEntriesTotalsLoading ? (
                    <>
                      {" "}
                      ({timeEntryRollup.logicalCount}
                      {timeEntryRollup.rowCount > timeEntryRollup.logicalCount
                        ? ` • ${timeEntryRollup.rowCount} case lines`
                        : ""}
                      )
                    </>
                  ) : (
                    <Typography
                      component="span"
                      level="body-sm"
                      sx={{ color: "text.tertiary", fontWeight: 400 }}
                    >
                      {" "}
                      (loading totals across all cases…)
                    </Typography>
                  )}
                </Typography>
                {!timeEntriesTotalsLoading && timeEntryRollup.rowCount > timeEntryRollup.logicalCount ? (
                  <Typography level="body-xs" sx={{ color: "text.tertiary", mt: 0.25 }}>
                    Totals count each company-wide submission once (one row per linked case below).
                  </Typography>
                ) : null}
              </Box>
              <Button size="sm" onClick={openAddTimeEntryFlow} disabled={!company.cases?.length}>
                Add Time Entry
              </Button>
            </Box>
            {company.cases?.length && (timeEntriesTotalsLoading || timeEntryRollup.rowCount > 0) ? (
              <Card variant="soft" sx={{ mb: 2, p: 2 }}>
                <Typography level="title-sm" sx={{ mb: 1 }}>
                  Totals (company view — all cases)
                </Typography>
                {timeEntriesTotalsLoading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CircularProgress size="sm" />
                    <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                      Adding up every time entry in linked cases…
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    <Chip size="sm" variant="soft" color="primary">
                      Hours: {hoursFmt(timeEntryRollup.totalHours)}
                    </Chip>
                    <Chip size="sm" variant="soft" color="success">
                      Total: {moneyFmt.format(timeEntryRollup.totalMoney)}
                    </Chip>
                    <Chip size="sm" variant="soft" color="success">
                      Billable: {moneyFmt.format(timeEntryRollup.billableMoney)}
                    </Chip>
                    <Chip size="sm" variant="soft" color="neutral">
                      Non-billable: {moneyFmt.format(timeEntryRollup.nonBillableMoney)}
                    </Chip>
                  </Box>
                )}
              </Card>
            ) : null}
            {timeEntriesLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : timeEntries.length > 0 ? (
              <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
                <List>
                  {timeEntries.map((entry) => (
                    <ListItem
                      key={`${entry.case_id}-${entry.time_entry_id}`}
                      sx={{
                        borderRadius: "sm",
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "background.level1" },
                      }}
                      onClick={() =>
                        navigate(`/cases/${entry.case_id}?tab=time`)
                      }
                    >
                      <ListItemDecorator>
                        <TimerOutlinedIcon />
                      </ListItemDecorator>
                      <ListItemContent>
                        <Typography level="title-sm">
                          {entry.activity_name || "Time entry"}
                        </Typography>
                        <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                          {entry._caseName}
                          {entry.entry_date
                            ? ` • ${moment(entry.entry_date).format("MMM D, YYYY")}`
                            : ""}
                          {entry.hours != null && entry.hours !== "" ? ` • ${entry.hours} h` : ""}
                          {entry.billable === false ? " • Non-billable" : ""}
                        </Typography>
                      </ListItemContent>
                    </ListItem>
                  ))}
                </List>
                {hasMoreTimeEntries && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                    <Button
                      size="sm"
                      variant="soft"
                      onClick={fetchMoreTimeEntries}
                      disabled={timeEntriesLoadingMore}
                    >
                      {timeEntriesLoadingMore ? "Loading..." : "Show More"}
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                No time entries found for this company&apos;s cases.
              </Typography>
            )}
          </TabPanel>

          <TabPanel value={4}>
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Typography level="title-md">Documents ({documents.length})</Typography>
              <Button size="sm" onClick={openAddDocumentFlow}>
                Add Document
              </Button>
            </Box>
            {documentsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : documents.length > 0 ? (
              <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
                <List>
                  {documents.map((doc) => (
                    <ListItem
                      key={doc._id}
                      sx={{ borderRadius: "sm", cursor: "pointer", "&:hover": { backgroundColor: "background.level1" } }}
                      onClick={() => navigate(`/cases/${doc._caseId}`, { state: { tab: 4 } })}
                    >
                      <ListItemDecorator>
                        <DescriptionIcon />
                      </ListItemDecorator>
                      <ListItemContent>
                        <Typography level="title-sm">{doc.fileName || doc.name || "Untitled Document"}</Typography>
                        <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                          {doc._caseName}
                        </Typography>
                      </ListItemContent>
                    </ListItem>
                  ))}
                </List>
                {hasMoreDocuments && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                    <Button size="sm" variant="soft" onClick={fetchMoreDocuments} disabled={documentsLoadingMore}>
                      {documentsLoadingMore ? "Loading..." : "Show More"}
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                No documents found for this company's cases.
              </Typography>
            )}
          </TabPanel>

          <TabPanel value={5}>
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Typography level="title-md">Tasks ({tasks.length})</Typography>
              <Button size="sm" onClick={openAddTaskFlow}>
                Add Task
              </Button>
            </Box>
            {tasksLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : tasks.length > 0 ? (
              <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
                <List>
                  {tasks.map((task) => (
                    <ListItem
                      key={task._id}
                      sx={{ borderRadius: "sm", cursor: "pointer", "&:hover": { backgroundColor: "background.level1" } }}
                      onClick={() => navigate(`/cases/${task._caseId}`, { state: { tab: 6 } })}
                    >
                      <ListItemDecorator>
                        <AssignmentIcon />
                      </ListItemDecorator>
                      <ListItemContent>
                        <Typography level="title-sm">{task.task_name || task.name || "Untitled Task"}</Typography>
                        <Typography level="body-xs" sx={{ color: "text.secondary" }}>
                          {task._caseName}
                          {task.due_date ? ` • due ${moment(task.due_date).format("MMM D, YYYY")}` : ""}
                        </Typography>
                      </ListItemContent>
                    </ListItem>
                  ))}
                </List>
                {hasMoreTasks && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                    <Button size="sm" variant="soft" onClick={fetchMoreTasks} disabled={tasksLoadingMore}>
                      {tasksLoadingMore ? "Loading..." : "Show More"}
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                No tasks found for this company's cases.
              </Typography>
            )}
          </TabPanel>

          <TabPanel value={6}>
            <Typography level="title-md" sx={{ mb: 2 }}>
              Recent Activity
            </Typography>
            {activitiesLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : activities.length > 0 ? (
              <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
                <List>
                  {activities.map((item, index) => (
                    <ListItem key={item.id || index}>
                      <ListItemDecorator>
                        <AccessTimeIcon />
                      </ListItemDecorator>
                      <ListItemContent>
                        <Typography level="body-sm">
                          {item.message ? (
                            truncate(stripHtml(item.message), 150)
                          ) : (
                            <>
                              <b>
                                {item.first_name} {item.last_name}
                              </b>{" "}
                              {item.action === "create" ? "created" : "updated"} case{" "}
                              <b>{item.case_name}</b> ({item.case_number}) at{" "}
                              {new Date(item.timestamp).toLocaleString()}
                            </>
                          )}
                        </Typography>
                        {item.timestamp && (
                          <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                            {moment(item.timestamp).fromNow()}
                          </Typography>
                        )}
                      </ListItemContent>
                    </ListItem>
                  ))}
                </List>
              </Box>
            ) : (
              <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                No recent activity found.
              </Typography>
            )}
          </TabPanel>

          <TabPanel value={7}>
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Typography level="title-md">Calendar Events</Typography>
              <Button size="sm" onClick={openAddEventFlow}>
                Add Event
              </Button>
            </Box>
            {eventsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : events.length > 0 ? (
              <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
                {upcomingEvents.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography level="title-sm" sx={{ mb: 1, color: "success.600" }}>
                      Upcoming ({upcomingEvents.length})
                    </Typography>
                    {upcomingEvents.map((ev) => {
                      const mStart = moment(ev.start);
                      const mEnd = moment(ev.end);
                      return (
                        <Box
                          key={ev.id}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "70px 120px 1fr",
                            alignItems: "center",
                            px: 1,
                            py: 1,
                            "&:nth-of-type(odd)": { bgcolor: "background.level1" },
                            borderRadius: "sm",
                          }}
                        >
                          <Box sx={{ width: 56, textAlign: "center", borderRadius: "sm", bgcolor: "background.level2", p: 0.5 }}>
                            <Typography fontSize="xs" textTransform="uppercase">
                              {mStart.format("MMM")}
                            </Typography>
                            <Typography level="title-md">{mStart.format("D")}</Typography>
                          </Box>
                          <Typography fontSize="sm">
                            {mStart.format("h:mma").toLowerCase()} - {mEnd.format("h:mma").toLowerCase()}
                          </Typography>
                          <Typography fontWeight="md">{ev.title}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                )}

                {pastEvents.length > 0 && (
                  <Box>
                    <Typography level="title-sm" sx={{ mb: 1, color: "text.tertiary" }}>
                      Past ({pastEvents.length})
                    </Typography>
                    {pastEvents
                      .slice()
                      .reverse()
                      .map((ev) => {
                        const mStart = moment(ev.start);
                        const mEnd = moment(ev.end);
                        return (
                          <Box
                            key={ev.id}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "70px 120px 1fr",
                              alignItems: "center",
                              px: 1,
                              py: 1,
                              opacity: 0.7,
                              "&:nth-of-type(odd)": { bgcolor: "background.level1" },
                              borderRadius: "sm",
                            }}
                          >
                            <Box sx={{ width: 56, textAlign: "center", borderRadius: "sm", bgcolor: "background.level2", p: 0.5 }}>
                              <Typography fontSize="xs" textTransform="uppercase">
                                {mStart.format("MMM")}
                              </Typography>
                              <Typography level="title-md">{mStart.format("D")}</Typography>
                            </Box>
                            <Typography fontSize="sm">
                              {mStart.format("h:mma").toLowerCase()} - {mEnd.format("h:mma").toLowerCase()}
                            </Typography>
                            <Typography fontWeight="md">{ev.title}</Typography>
                          </Box>
                        );
                      })}
                  </Box>
                )}
                {hasMoreEvents && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                    <Button size="sm" variant="outlined" onClick={fetchMoreEvents} loading={eventsLoadingMore}>
                      Show More
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                No calendar events found.
              </Typography>
            )}
          </TabPanel>
        </Tabs>
      </CardContent>
    </Card>
  );
}

