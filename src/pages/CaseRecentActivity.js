import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  List,
  ListItem,
  ListItemDecorator,
  ListItemContent,
  Typography,
  CircularProgress,
} from '@mui/joy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
function stripHtml(html) {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}
function CaseRecentActivity({ case_id }) {
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!case_id) return;

      try {
        const response = await axios.get(`/cases/${case_id}/recent-activity`);
        setRecentActivity(response.data);
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [case_id]);

  if (loading) {
    return <CircularProgress size="lg" />;
  }

  return (
    <div>
      <Typography level="h4" sx={{ mb: 2 }}>
        Recent Activity
      </Typography>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        <List>
          {recentActivity.map((item) => (
            <ListItem key={item.id}>
              <ListItemDecorator>
                <AccessTimeIcon />
              </ListItemDecorator>
              <ListItemContent>
                <Typography level="body1" title={item.message}>
                  {item.message ? (
                        truncate(stripHtml(item.message), 150)

                  ) : (
                    <>
                      <b>{item.first_name} {item.last_name}</b> {item.action === 'create' ? 'created' : 'updated'} case <b>{item.case_name}</b> ({item.case_number}) at{' '}
                      {new Date(item.timestamp).toLocaleString()}
                    </>
                  )}
                </Typography>
              </ListItemContent>
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );
}

export default CaseRecentActivity;
