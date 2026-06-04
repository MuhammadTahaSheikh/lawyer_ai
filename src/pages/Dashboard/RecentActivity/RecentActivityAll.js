import React, { useState, useEffect } from 'react';
import { Typography, List, ListItem, ListItemDecorator, Tabs, TabList, Tab, Card } from '@mui/joy';
import axios from 'axios';
import { CalendarDaysIcon, PencilSquareIcon, PaperClipIcon, FolderPlusIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { auth } from "../../../firebase/firebase";

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Events', value: 'events' },
  { label: 'Documents', value: 'documents' },
  { label: 'Tasks', value: 'tasks' },
  { label: 'Time Entries', value: 'time_entries' },
];

const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  const stripped = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength) + '...';
};

const RecentActivityAll = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
const [selectedUser, setSelectedUser] = useState(null);
  const currentUser = auth.currentUser?.uid;

const handleUserClick = (name) => {
  setSelectedUser(name);
  setPage(1);
  setActivityData([]);
  fetchActivity(true, name); // Pass the user name as a filter
};

  const fetchActivity = async (reset = false, userFilter = selectedUser) => {
  if (loading) return;

  setLoading(true);
  const currentPage = reset ? 1 : page;

  try {
    const res = await axios.get('/activities', {
      params: {
        tab: selectedTab,
        page: currentPage,
        limit: 20,
        user: userFilter,  // Add this param to your backend filtering logic
        uid: currentUser // Add this line to pass the current user's UID

      }
    });

    const newActivities = res.data.map(log => formatActivityItem(log));
    
    if (reset) {
      setActivityData(newActivities);
      setPage(2);
    } else {
      setActivityData(prev => [...prev, ...newActivities]);
      setPage(prev => prev + 1);
    }

    setHasMore(res.data.length === 20);
  } catch (err) {
    console.error("Failed to load activity data", err);
  } finally {
    setLoading(false);
  }
};


  const formatActivityItem = (log) => {
    const firstName = log.first_name || '--';
    const lastName = log.last_name || '--';
//     const fullName = (
//   <span
//     style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
//     onClick={() => handleUserClick(`${firstName} ${lastName}`)}
//   >
//     {firstName} {lastName}
//   </span>
// );
const encoded = encodeURIComponent(`${firstName} ${lastName}`);
const fullName = (
  <Link
    to={`/activity/user/${encoded}?tab=${selectedTab}`}
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
    let icon = <PencilSquareIcon style={{ width: "1.5rem" }} />;
    
    // Common link creator
    const createLink = (path, text) => (
      <Link to={path} style={{ color: '#1976d2', textDecoration: 'none' }}>
        {text}
      </Link>
    );

    switch (log.type) {
      case 'events':
        const eventLink = createLink(`/cases/${log.case_id}/?tab=events`, log.item_name || 'Event');

       if (log.action === 'create') {
  actionDescription = (
    <>
      {fullName} created <b style={{ fontWeight: 'bold', fontSize: "1.09rem" }}>event</b> {eventLink} on {date} at {time}
    </>
  );
  icon = <CalendarDaysIcon style={{ width: "1.5rem" }} />;
} else if (log.action === 'update') {
  actionDescription = (
    <>
      {fullName} updated <b style={{ fontWeight: 'bold', fontSize: "1.09rem" }}>{log.field_name}</b> from "<i>{truncateText(log.old_value)}</i>" to "<i>{truncateText(log.new_value)}</i>" on {date} at {time} for {eventLink}
    </>
  );
} else if (log.action === 'delete') {
  actionDescription = (
    <>
      {fullName} deleted <b style={{ fontWeight: 'bold', fontSize: "1.09rem" }}>event</b> "{log.old_value  || 'Unnamed Event'}" on {date} at {time}
    </>
  );
  icon = <CalendarDaysIcon style={{ width: "1.5rem" }} />;
}

        
        break;
       
        case 'documents':
          const docLink = createLink(`/cases/${log.case_id}/?tab=documents`, log.item_name || 'Document');
          
          if (log.action === 'upload') {
            actionDescription = (
              <>
                {fullName} uploaded <b style={{ fontWeight: 'bold', fontSize: "1.09rem" }}>document</b> {docLink} on {date} at {time}
              </>
            );
            icon = <PaperClipIcon style={{ width: "1.5rem" }} />;
          } else {
            actionDescription = (
              <>
                {fullName} {log.action} the <b style={{ fontWeight: 'bold', fontSize: "1.09rem" }}>document</b> {docLink} on {date} at {time}
              </>
            );
          }
          
          break;
        
        case 'tasks':
          const taskLink = createLink(`/cases/${log.case_id}/?tab=task`, log.item_name || 'Task');
          
          if (log.action === 'create') {
            actionDescription = (
              <>
                {fullName} created <b style={{ fontWeight: 'bold', fontSize: "1.09rem" }}>task</b> {taskLink} on {date} at {time}
              </>
            );
            icon = <CalendarDaysIcon style={{ width: "1.5rem" }} />;
          } else if (log.action === 'update') {
            actionDescription = (
              <>
                {fullName} updated <b style={{ fontWeight: 'bold', fontSize: "1.09rem" }}>{log.field_name}</b> from "<i>{truncateText(log.old_value)}</i>" to "<i>{truncateText(log.new_value)}</i>" on {date} at {time} for task {taskLink}
              </>
            );
          }
          
          break;
        
      case 'time_entries':
        const timeEntryLink = createLink(`/cases/${log.case_id}/?tab=time`, log.activity_name || 'Time Entry');
        if (log.action === 'create') {
          actionDescription = <>{fullName} created <b style={{ fontWeight: 'bold', fontSize: "1.0.9rem" }}>time entry</b> {timeEntryLink} on {date} at {time}</>;
          icon = <CalendarDaysIcon style={{ width: "1.5rem" }} />;
        } else if (log.action === 'update') {
          actionDescription = <>{fullName} updated <b style={{ fontWeight: 'bold', fontSize: "1.0.9rem" }}>{log.field_name}</b> from "<i>{truncateText(log.old_value)}</i>" to "<i>{truncateText(log.new_value)}</i>" on {date} at {time} for {timeEntryLink}</>;
        }
        break;
        
      case 'case_notes':
        const caseNoteLink = createLink(`/cases/${log.case_id}/?tab=notes`, log.case_name);
        if (log.action === 'create') {
          actionDescription = <>{fullName} added a <b style={{ fontWeight: 'bold', fontSize: "0.9rem" }}>note</b> to {caseNoteLink} on {date} at {time}</>;
          icon = <CalendarDaysIcon style={{ width: "1.5rem" }} />;
        } else if (log.action === 'update') {
          actionDescription = <>{fullName} updated <b style={{ fontWeight: 'bold', fontSize: "0.9rem" }}>note</b> field "{log.field_name}" from "{truncateText(log.old_value)}" to "{truncateText(log.new_value)}" on {date} at {time} of {caseNoteLink}</>;
        }
        break;
        
      case 'cases':
        const caseLink = createLink(`/cases/${log.case_id}`, log.case_name);
        if (log.action === 'create') {
          actionDescription = <>{fullName} created <b style={{ fontWeight: 'bold', fontSize: "0.9rem" }}>case</b> {caseLink} on {date} at {time}</>;
          icon = <FolderPlusIcon style={{ width: "1.5rem" }} />;
        } else if (log.action === 'update') {
          actionDescription = <>{fullName} updated <b style={{ fontWeight: 'bold', fontSize: "0.9rem" }}>case</b> field "{log.field_name}" from "{truncateText(log.old_value)}" to "{truncateText(log.new_value)}" on {date} at {time} of {caseLink}</>;
        }
        break;
    }

    return {
      type: log.type,
      user: fullName,
      action: actionDescription,
      time: `${date} ${time}`,
      icon,
      timestamp: log.timestamp
    };
  };

 useEffect(() => {
  fetchActivity(true,selectedUser);
}, [selectedTab]);


  const handleShowMore = () => {
    fetchActivity();
  };

  return (
    <Card variant="outlined" sx={{ width: '100%', padding: 2, marginTop: 2 }}>
      <Typography level="h4" sx={{ mb: 2 }}>Recent Activity</Typography>
      <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}   sx={{
    '--Tabs-indicatorColor': 'transparent',
    '--Tabs-indicatorThickness': '0px',
    '--Tab-indicatorThickness': '0px',
    '--Tab-indicatorColor': 'transparent',
  }}>
        <TabList>
          {tabs.map((tab) => (
            <Tab key={tab.value} value={tab.value} sx={{
      backgroundColor: 'transparent',
      '&.Mui-selected': {
        backgroundColor: 'transparent',
    
        borderBottom: '2px solid #1976d2', // optional visual indicator
      },
      '&:hover': {
        backgroundColor: 'transparent',
      }
    }}>
              {tab.label}
            </Tab>
          ))}
        </TabList>
      </Tabs>

      <List sx={{ mt: 2 }}>
        {loading && activityData.length === 0 ? (
          <Typography level="body-sm" sx={{ mt: 2, color: '#888' }}>
            Loading...
          </Typography>
        ) : activityData.length > 0 ? (
          <>
            {activityData.map((activity, index) => (
              <ListItem
                key={index}
                sx={{ flexDirection: 'row', alignItems: 'flex-start', borderTop: '1px solid #eee', paddingY: 1 }}
              >
                <ListItemDecorator>{activity.icon}</ListItemDecorator>
                <Typography level="body-sm">{activity.action}</Typography>
              </ListItem>
            ))}

            {hasMore && (
              <Typography
                level="body-sm"
                sx={{ mt: 2, color: '#1976d2', cursor: 'pointer', textAlign: 'center' }}
                onClick={handleShowMore}
              >
                {loading ? 'Loading...' : 'Show More'}
              </Typography>
            )}
          </>
        ) : (
          <Typography level="body-sm" sx={{ mt: 2, color: '#888' }}>
            No activity for this tab.
          </Typography>
        )}
      </List>
    </Card>
  );
};

export default RecentActivityAll;