import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  List, 
  ListItem, 
  ListItemDecorator, 
  Tabs, 
  TabList, 
  Tab, 
  Card, 
  IconButton,
  Box,
  Chip,
  Skeleton,
  Divider,
  Avatar,
  Button,
  Badge,
  CircularProgress
} from '@mui/joy';
import axios from 'axios';
import { 
  CalendarDaysIcon, 
  PencilSquareIcon, 
  PaperClipIcon, 
  FolderPlusIcon,
  ArrowLeftIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebase/firebase';
import TimeEntriesChart from './TimeEntriesChart';

const tabs = [
  { label: 'All', value: 'all', icon: <UserIcon className="w-4 h-4" />, color: 'primary' },
  { label: 'Events', value: 'events', icon: <CalendarDaysIcon className="w-4 h-4" />, color: 'success' },
  { label: 'Documents', value: 'documents', icon: <DocumentTextIcon className="w-4 h-4" />, color: 'warning' },
  { label: 'Tasks', value: 'tasks', icon: <CheckCircleIcon className="w-4 h-4" />, color: 'info' },
  { label: 'Time Entries', value: 'time_entries', icon: <ClockIcon className="w-4 h-4" />, color: 'neutral' },
  { label: 'Cases Involved', value: 'cases_involved', icon: <FolderPlusIcon className="w-4 h-4" />, color: 'danger' },
];

const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  const stripped = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength) + '...';
};

export default function UserActivity() {
  const { name } = useParams(); // e.g. "John Doe"
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'all';

  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
const [caseItems, setCaseItems] = useState([]);
const [casePage, setCasePage] = useState(1);
const [caseHasMore, setCaseHasMore] = useState(true);
const [caseLoading, setCaseLoading] = useState(false);
const [timeEntriesData, setTimeEntriesData] = useState([]);
const [timeEntriesLoading, setTimeEntriesLoading] = useState(false);
const [timeEntriesSubTab, setTimeEntriesSubTab] = useState('list');
const [selectedTimeRange, setSelectedTimeRange] = useState('quarter'); // Track selected time range

  const currentUser = auth.currentUser?.uid;

const fetchTimeEntries = async () => {
  if (timeEntriesLoading) return;
  setTimeEntriesLoading(true);

  try {
    // First, get the user's UID from their name using activities endpoint
    const activitiesRes = await axios.get('/activities', {
      params: {
        tab: 'time_entries',
        user: name,
        uid: currentUser,
        limit: 1, // We just need one record to get the UID
      },
    });

    let userUid = null;
    if (activitiesRes.data && activitiesRes.data.length > 0) {
      userUid = activitiesRes.data[0].uid;
    }

    // If we found the user's UID, fetch their time entries with proper date range filtering
    if (userUid) {
      // Determine the appropriate range based on the selected time range
      let range = 'last_90_days'; // Default to 3 months
      
      // Map the time range selection to backend range parameter
      const timeRangeMap = {
        'week': 'last_7_days',
        'month': 'last_30_days', 
        'quarter': 'last_90_days',
        'all_time': 'all_time'
      };
      
      // Use the selected time range
      range = timeRangeMap[selectedTimeRange] || 'last_90_days';

      const res = await axios.get('/time_entries', {
        params: {
          user_id: userUid,    // Use the actual UID from activities
          uid: currentUser,    // Preserve permission behavior
          range: range,        // Use proper date range filtering
          limit: 10000,        // Increased limit to get all data for the time range
        },
      });

      setTimeEntriesData(res.data?.data || []);
    } else {
      // If no user found, set empty data
      console.log('No user found for name:', name);
      setTimeEntriesData([]);
    }
  } catch (e) {
    console.error('Failed to load time entries for user:', e);
    setTimeEntriesData([]);
  } finally {
    setTimeEntriesLoading(false);
  }
};

const fetchCasesInvolved = async (reset = false) => {
  if (caseLoading) return;
  setCaseLoading(true);

  const currentPage = reset ? 1 : casePage;

  try {
    const res = await axios.get('/cases', {
      params: {
        page: currentPage,
        limit: 20,
        involved_name: name,      // <— key addition
        uid: currentUser,         // preserve your existing permission behavior
      },
    });

    const rows = res.data?.cases || [];
    const next = rows.length === 20;

    if (reset) {
      setCaseItems(rows);
      setCasePage(2);
    } else {
      setCaseItems(prev => [...prev, ...rows]);
      setCasePage(prev => prev + 1);
    }
    setCaseHasMore(next);
  } catch (e) {
    console.error('Failed to load cases for user:', e);
  } finally {
    setCaseLoading(false);
  }
};

  const createLink = (path, text) => (
    <Link to={path} style={{ color: '#1976d2', textDecoration: 'none' }}>
      {text}
    </Link>
  );

  const formatActivityItem = (log) => {
    const firstName = log.first_name || '--';
    const lastName = log.last_name || '--';

    // Name remains clickable here too (navigating to the same page), harmless
    const fullName = (
      <Link
        to={`/activity/user/${encodeURIComponent(`${firstName} ${lastName}`)}?tab=${selectedTab}`}
        style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
        onClick={(e) => e.stopPropagation()}
      >
        {firstName} {lastName}
      </Link>
    );

    const timeObj = new Date(log.timestamp);
    const time = timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = timeObj.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });

    let actionDescription = '';
    let icon = <PencilSquareIcon style={{ width: '1.5rem' }} />;

    switch (log.type) {
      case 'events': {
        const eventLink = createLink(`/cases/${log.case_id}/?tab=events`, log.item_name || 'Event');
        if (log.action === 'create') {
          actionDescription = <>{fullName} created <b style={{ fontWeight: 'bold', fontSize: '1.09rem' }}>event</b> {eventLink} on {date} at {time}</>;
          icon = <CalendarDaysIcon style={{ width: '1.5rem' }} />;
        } else if (log.action === 'update') {
          actionDescription = <>{fullName} updated <b style={{ fontWeight: 'bold', fontSize: '1.09rem' }}>{log.field_name}</b> from "<i>{truncateText(log.old_value)}</i>" to "<i>{truncateText(log.new_value)}</i>" on {date} at {time} for {eventLink}</>;
        } else if (log.action === 'delete') {
          actionDescription = <>{fullName} deleted <b style={{ fontWeight: 'bold', fontSize: '1.09rem' }}>event</b> "{log.old_value || 'Unnamed Event'}" on {date} at {time}</>;
          icon = <CalendarDaysIcon style={{ width: '1.5rem' }} />;
        }
        break;
      }
      case 'documents': {
        const docLink = createLink(`/cases/${log.case_id}/?tab=documents`, log.item_name || 'Document');
        if (log.action === 'upload') {
          actionDescription = <>{fullName} uploaded <b style={{ fontWeight: 'bold', fontSize: '1.09rem' }}>document</b> {docLink} on {date} at {time}</>;
          icon = <PaperClipIcon style={{ width: '1.5rem' }} />;
        } else {
          actionDescription = <>{fullName} {log.action} the <b style={{ fontWeight: 'bold', fontSize: '1.09rem' }}>document</b> {docLink} on {date} at {time}</>;
        }
        break;
      }
      case 'tasks': {
        const taskLink = createLink(`/cases/${log.case_id}/?tab=task`, log.item_name || 'Task');
        if (log.action === 'create') {
          actionDescription = <>{fullName} created <b style={{ fontWeight: 'bold', fontSize: '1.09rem' }}>task</b> {taskLink} on {date} at {time}</>;
          icon = <CalendarDaysIcon style={{ width: '1.5rem' }} />;
        } else if (log.action === 'update') {
          actionDescription = <>{fullName} updated <b style={{ fontWeight: 'bold', fontSize: '1.09rem' }}>{log.field_name}</b> from "<i>{truncateText(log.old_value)}</i>" to "<i>{truncateText(log.new_value)}</i>" on {date} at {time} for task {taskLink}</>;
        }
        break;
      }
      case 'time_entries': {
        const timeEntryLink = createLink(`/cases/${log.case_id}/?tab=time`, log.activity_name || 'Time Entry');
        if (log.action === 'create') {
          actionDescription = <>{fullName} created <b style={{ fontWeight: 'bold', fontSize: '1.09rem' }}>time entry</b> {timeEntryLink} on {date} at {time}</>;
          icon = <CalendarDaysIcon style={{ width: '1.5rem' }} />;
        } else if (log.action === 'update') {
          actionDescription = <>{fullName} updated <b style={{ fontWeight: 'bold', fontSize: '1.09rem' }}>{log.field_name}</b> from "<i>{truncateText(log.old_value)}</i>" to "<i>{truncateText(log.new_value)}</i>" on {date} at {time} for {timeEntryLink}</>;
        }
        break;
      }
      case 'case_notes': {
        const caseNoteLink = createLink(`/cases/${log.case_id}/?tab=notes`, log.case_name);
        if (log.action === 'create') {
          actionDescription = <>{fullName} added a <b style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>note</b> to {caseNoteLink} on {date} at {time}</>;
          icon = <CalendarDaysIcon style={{ width: '1.5rem' }} />;
        } else if (log.action === 'update') {
          actionDescription = <>{fullName} updated <b style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>note</b> field "{log.field_name}" from "{truncateText(log.old_value)}" to "{truncateText(log.new_value)}" on {date} at {time} of {caseNoteLink}</>;
        }
        break;
      }
      case 'cases': {
        const caseLink = createLink(`/cases/${log.case_id}`, log.case_name);
        if (log.action === 'create') {
          actionDescription = <>{fullName} created <b style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>case</b> {caseLink} on {date} at {time}</>;
          icon = <FolderPlusIcon style={{ width: '1.5rem' }} />;
        } else if (log.action === 'update') {
          actionDescription = <>{fullName} updated <b style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>case</b> field "{log.field_name}" from "{truncateText(log.old_value)}" to "{truncateText(log.new_value)}" on {date} at {time} of {caseLink}</>;
        }
        break;
      }
      default:
        break;
    }

    return {
      type: log.type,
      action: actionDescription,
      icon,
      timestamp: log.timestamp,
      timeObj,
      time,
      date,
      actionType: log.action,
      itemName: log.item_name || log.case_name || 'Item',
      caseId: log.case_id,
      severity: log.action === 'delete' ? 'error' : log.action === 'create' ? 'success' : 'info'
    };
  };

  const fetchActivity = async (reset = false) => {
    if (loading) return;

    setLoading(true);
    const currentPage = reset ? 1 : page;

    try {
      const res = await axios.get('/activities', {
        params: {
          tab: selectedTab,
          page: currentPage,
          limit: 20,
          user: name,           // <- fixed to the user in the URL
          uid: currentUser,     
        },
      });

      const newActivities = res.data.map((log) => formatActivityItem(log));

      if (reset) {
        setActivityData(newActivities);
        setPage(2);
      } else {
        setActivityData((prev) => [...prev, ...newActivities]);
        setPage((prev) => prev + 1);
      }

      setHasMore(res.data.length === 20);
    } catch (err) {
      console.error('Failed to load user activity', err);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  // existing: sync ?tab=… and reset activity states
  const params = new URLSearchParams(searchParams);
  params.set('tab', selectedTab);
  setSearchParams(params, { replace: true });

  if (selectedTab === 'cases_involved') {
    // reset cases tab only
    setCaseItems([]);
    setCasePage(1);
    setCaseHasMore(true);
    fetchCasesInvolved(true);
  } else if (selectedTab === 'time_entries') {
    // fetch time entries data for charts
    fetchTimeEntries();
    // also fetch activity data for the list view
    setPage(1);
    setActivityData([]);
    setHasMore(true);
    fetchActivity(true);
  } else {
    // existing behavior for activity tabs
    setPage(1);
    setActivityData([]);
    setHasMore(true);
    fetchActivity(true);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedTab, name]);

// Refetch time entries when time range changes
useEffect(() => {
  if (selectedTab === 'time_entries' && timeEntriesSubTab === 'charts') {
    fetchTimeEntries();
  }
}, [selectedTimeRange]);


  const handleShowMore = () => fetchActivity();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        variant="outlined" 
        sx={{
          p: 0,
          mt: 2,
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid',
          borderColor: 'neutral.200',
          overflow: 'hidden'
        }}
      >
        {/* Enhanced Header */}
        <Box
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, #1b2b49 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              zIndex: 0
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <IconButton 
                size="sm" 
                variant="soft" 
                color="neutral"
                onClick={() => navigate(-1)}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                <ArrowLeftIcon className="w-5 h-5" />
        </IconButton>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}
              >
                {decodeURIComponent(name).split(' ').map(n => n[0]).join('').toUpperCase()}
              </Avatar>
              <Box>
                <Typography level="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
                  {decodeURIComponent(name)}
                </Typography>
                <Typography level="body-sm" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  User Activity Dashboard
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Enhanced Tabs */}
        <Box sx={{ px: 3, pt: 2, pb: 1 }}>
      <Tabs
        value={selectedTab}
        onChange={(e, v) => setSelectedTab(v)}
        sx={{
          '--Tabs-indicatorColor': 'transparent',
          '--Tabs-indicatorThickness': '0px',
            }}
          >
            <TabList
              sx={{
                '--List-gap': '8px',
                '--List-padding': '0px',
                flexWrap: 'wrap',
                gap: 1
              }}
            >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              sx={{
                    minHeight: '40px',
                    px: 2,
                    py: 1,
                    borderRadius: '12px',
                backgroundColor: 'transparent',
                    border: '1px solid',
                    borderColor: 'neutral.200',
                    color: 'neutral.600',
                    fontWeight: 500,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'neutral.50',
                      borderColor: 'neutral.300',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    },
                    '&.Mui-selected': {
                      backgroundColor: `${tab.color}.50`,
                      borderColor: `${tab.color}.300`,
                      color: `${tab.color}.700`,
                      fontWeight: 600,
                      transform: 'translateY(-1px)',
                      boxShadow: `0 4px 12px ${tab.color === 'primary' ? 'rgba(25, 118, 210, 0.2)' : 
                        tab.color === 'success' ? 'rgba(76, 175, 80, 0.2)' :
                        tab.color === 'warning' ? 'rgba(255, 152, 0, 0.2)' :
                        tab.color === 'info' ? 'rgba(33, 150, 243, 0.2)' :
                        tab.color === 'danger' ? 'rgba(244, 67, 54, 0.2)' :
                        'rgba(158, 158, 158, 0.2)'}`
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab.icon}
              {tab.label}
                  </Box>
            </Tab>
          ))}
        </TabList>
      </Tabs>
        </Box>

        <Divider />

        {/* Enhanced Activity List */}
        <Box sx={{ p: 3 }}>
          <AnimatePresence mode="wait">
            {selectedTab === 'time_entries' ? (
              // Time Entries with sub-tabs
              <motion.div
                key="time-entries"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Tabs value={timeEntriesSubTab} onChange={(e, v) => {
                  setTimeEntriesSubTab(v);
                  if (v === 'charts' && timeEntriesData.length === 0) {
                    fetchTimeEntries();
                  }
                }} sx={{ mb: 2 }}>
                  <TabList>
                    <Tab value="list" startDecorator={<ClockIcon className="w-4 h-4" />}>
                      Activity List
                    </Tab>
                    <Tab value="charts" startDecorator={<ChartBarIcon className="w-4 h-4" />}>
                      Chart View
                    </Tab>
                  </TabList>
                </Tabs>

                {timeEntriesSubTab === 'list' ? (
                  // Time Entries Activity List
                  loading && activityData.length === 0 ? (
                    <motion.div
                      key="time-loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[...Array(3)].map((_, idx) => (
                          <Card key={idx} variant="outlined" sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Skeleton variant="circular" width={40} height={40} />
                              <Box sx={{ flex: 1 }}>
                                <Skeleton variant="text" level="body-sm" width="80%" />
                                <Skeleton variant="text" level="body-xs" width="60%" />
                              </Box>
                            </Box>
                          </Card>
                        ))}
                      </Box>
                    </motion.div>
                  ) : activityData.length > 0 ? (
                    <motion.div
                      key="time-activity-list"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {activityData.map((item, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.1 }}
                          >
                            <Card
                              variant="outlined"
                              sx={{
                                p: 2,
                                borderRadius: '12px',
                                border: '1px solid',
                                borderColor: 'neutral.200',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  borderColor: 'primary.300',
                                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.1)',
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <Box
                                  sx={{
                                    p: 1,
                                    borderRadius: '8px',
                                    backgroundColor: `${item.severity === 'error' ? 'danger' : 
                                      item.severity === 'success' ? 'success' : 'primary'}.50`,
                                    color: `${item.severity === 'error' ? 'danger' : 
                                      item.severity === 'success' ? 'success' : 'primary'}.600`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: 40,
                                    height: 40
                                  }}
                                >
                                  {item.icon}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography level="body-sm" sx={{ mb: 0.5, lineHeight: 1.5 }}>
                                    {item.action}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                    <Chip
                                      size="sm"
                                      variant="soft"
                                      color={item.severity === 'error' ? 'danger' : 
                                        item.severity === 'success' ? 'success' : 'primary'}
                                    >
                                      {item.actionType}
                                    </Chip>
                                    <Typography level="body-xs" sx={{ color: 'neutral.500' }}>
                                      {item.date} at {item.time}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </Card>
                          </motion.div>
                        ))}

                        {hasMore && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            <Button
                              variant="soft"
                              color="primary"
                              onClick={() => fetchActivity()}
                              loading={loading}
                              sx={{
                                width: '100%',
                                mt: 2,
                                borderRadius: '12px',
                                fontWeight: 600
                              }}
                            >
                              {loading ? 'Loading...' : 'Load More Activities'}
                            </Button>
                          </motion.div>
                        )}
                      </Box>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty-time-activity"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Box
                        sx={{
                          textAlign: 'center',
                          py: 6,
                          px: 3
                        }}
                      >
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            backgroundColor: 'neutral.100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2
                          }}
                        >
                          <ClockIcon className="w-8 h-8 text-gray-400" />
                        </Box>
                        <Typography level="h4" sx={{ mb: 1, color: 'neutral.600' }}>
                          No Time Entry Activities Found
                        </Typography>
                        <Typography level="body-sm" sx={{ color: 'neutral.500' }}>
                          No time entry activities found for this user.
                        </Typography>
                      </Box>
                    </motion.div>
                  )
                ) : (
                  // Time Entries Chart View
                  <motion.div
                    key="time-charts"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {timeEntriesLoading ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        py: 6,
                        gap: 2
                      }}>
                        <CircularProgress size="lg" />
                        <Typography level="body-md" sx={{ color: 'neutral.600' }}>
                          Loading time entries data...
                        </Typography>
                      </Box>
                    ) : (
                      <TimeEntriesChart 
                        timeEntries={timeEntriesData} 
                        title={`Time Entries Analytics - ${decodeURIComponent(name)}`}
                        timeRange={selectedTimeRange}
                        onTimeRangeChange={setSelectedTimeRange}
                      />
                    )}
                  </motion.div>
                )}
              </motion.div>
            ) : selectedTab !== 'cases_involved' ? (
              // Activity List
              loading && activityData.length === 0 ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[...Array(3)].map((_, idx) => (
                      <Card key={idx} variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Skeleton variant="circular" width={40} height={40} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" level="body-sm" width="80%" />
                            <Skeleton variant="text" level="body-xs" width="60%" />
                          </Box>
                        </Box>
                      </Card>
                    ))}
                  </Box>
                </motion.div>
        ) : activityData.length > 0 ? (
                <motion.div
                  key="activity-list"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activityData.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                      >
                        <Card
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: 'neutral.200',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              borderColor: 'primary.300',
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.1)',
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Box
                              sx={{
                                p: 1,
                                borderRadius: '8px',
                                backgroundColor: `${item.severity === 'error' ? 'danger' : 
                                  item.severity === 'success' ? 'success' : 'primary'}.50`,
                                color: `${item.severity === 'error' ? 'danger' : 
                                  item.severity === 'success' ? 'success' : 'primary'}.600`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 40,
                                height: 40
                              }}
                            >
                              {item.icon}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography level="body-sm" sx={{ mb: 0.5, lineHeight: 1.5 }}>
                                {item.action}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <Chip
                                  size="sm"
                                  variant="soft"
                                  color={item.severity === 'error' ? 'danger' : 
                                    item.severity === 'success' ? 'success' : 'primary'}
                                >
                                  {item.actionType}
                                </Chip>
                                <Typography level="body-xs" sx={{ color: 'neutral.500' }}>
                                  {item.date} at {item.time}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Card>
                      </motion.div>
            ))}

            {hasMore && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Button
                          variant="soft"
                          color="primary"
                          onClick={() => fetchActivity()}
                          loading={loading}
                          sx={{
                            width: '100%',
                            mt: 2,
                            borderRadius: '12px',
                            fontWeight: 600
                          }}
                        >
                          {loading ? 'Loading...' : 'Load More Activities'}
                        </Button>
                      </motion.div>
                    )}
                  </Box>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-activity"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 6,
                      px: 3
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: 'neutral.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      <UserIcon className="w-8 h-8 text-gray-400" />
                    </Box>
                    <Typography level="h4" sx={{ mb: 1, color: 'neutral.600' }}>
                      No Activity Found
          </Typography>
                    <Typography level="body-sm" sx={{ color: 'neutral.500' }}>
                      No activity found for this user in the selected category.
          </Typography>
                  </Box>
                </motion.div>
              )
            ) : (
              // Cases Involved List
    caseLoading && caseItems.length === 0 ? (
                <motion.div
                  key="case-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[...Array(3)].map((_, idx) => (
                      <Card key={idx} variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Skeleton variant="circular" width={40} height={40} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" level="body-sm" width="80%" />
                            <Skeleton variant="text" level="body-xs" width="60%" />
                          </Box>
                        </Box>
                      </Card>
                    ))}
                  </Box>
                </motion.div>
    ) : caseItems.length > 0 ? (
                <motion.div
                  key="cases-list"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {caseItems.map((c, idx) => (
                      <motion.div
            key={c.case_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                      >
                        <Card
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: 'neutral.200',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              borderColor: 'primary.300',
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.1)',
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Box
                              sx={{
                                p: 1,
                                borderRadius: '8px',
                                backgroundColor: 'primary.50',
                                color: 'primary.600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 40,
                                height: 40
                              }}
                            >
                              <FolderPlusIcon className="w-5 h-5" />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Link 
                                to={`/cases/${c.case_id}`} 
                                style={{ 
                                  color: '#1976d2', 
                                  textDecoration: 'none', 
                                  fontWeight: 600,
                                  fontSize: '1rem'
                                }}
                              >
                {c.name || '(Untitled Case)'}
              </Link>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                <Chip size="sm" variant="soft" color="neutral">
                                  #{c.case_number || '—'}
                                </Chip>
                                <Chip size="sm" variant="soft" color="info">
                                  {c.practice_area || '—'}
                                </Chip>
                                <Chip size="sm" variant="soft" color="warning">
                                  {c.case_stage || '—'}
                                </Chip>
                              </Box>
                            </Box>
                          </Box>
                        </Card>
                      </motion.div>
                    ))}

        {caseHasMore && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Button
                          variant="soft"
                          color="primary"
            onClick={() => fetchCasesInvolved()}
                          loading={caseLoading}
                          sx={{
                            width: '100%',
                            mt: 2,
                            borderRadius: '12px',
                            fontWeight: 600
                          }}
                        >
                          {caseLoading ? 'Loading...' : 'Load More Cases'}
                        </Button>
                      </motion.div>
                    )}
                  </Box>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-cases"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 6,
                      px: 3
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: 'neutral.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      <FolderPlusIcon className="w-8 h-8 text-gray-400" />
                    </Box>
                    <Typography level="h4" sx={{ mb: 1, color: 'neutral.600' }}>
                      No Cases Found
                    </Typography>
                    <Typography level="body-sm" sx={{ color: 'neutral.500' }}>
        No cases found where {decodeURIComponent(name)} is Lead Attorney or Paralegal.
      </Typography>
                  </Box>
                </motion.div>
    )
  )}
          </AnimatePresence>
        </Box>
    </Card>
    </motion.div>
  );
}
