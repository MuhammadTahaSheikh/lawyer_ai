import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Sheet, Grid, CircularProgress } from '@mui/joy';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { auth } from "../../firebase/firebase";

const localizer = momentLocalizer(moment);
localizer.destroy = () => {};     // ← stub it here too

const Timesheet = () => {
  const [view, setView] = useState('week');
  const [date, setDate] = useState(new Date());
  const [billableType, setBillableType] = useState('all');
  const [loading, setLoading] = useState(false);
    const userId = auth.currentUser?.uid;
  
  const [rateSummary, setRateSummary] = useState({
    billable_rate_hours: 0,
    non_billable_rate_hours: 0,
    total_combined_rate_hours: 0,
  });

  const fetchRateSummary = async () => {
    setLoading(true);
    try {
      let range = 'all';
      if (view === 'week') {
        range = 'last_7_days';
      } else if (view === 'month') {
        range = 'last_30_days';
      } else if (view === 'day') {
        range = moment(date).format('YYYY-MM-DD');
      }
      
      const billableQuery = billableType === 'billable' ? '1' : billableType === 'non-billable' ? '0' : '';
      const response = await axios.get(
        `/time_entries?user_id=${userId}&range=${range}${billableQuery !== '' ? `&billable=${billableQuery}` : ''}`
      );
      const data = response.data.rateSummary || {};
      setRateSummary({
        billable_rate_hours: Number(data.billable_rate_hours) || 0,
        non_billable_rate_hours: Number(data.non_billable_rate_hours) || 0,
        total_combined_rate_hours: Number(data.total_combined_rate_hours) || 0,
      });
    } catch (error) {
      console.error('Error fetching rate summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRateSummary();
  }, [view, billableType, date]);

  const handleViewChange = (newView) => {
    if (newView === 'today') {
      setView('day');
      setDate(new Date());
    } else {
      setView(newView);
    }
  };

  const handleBillableChange = (type) => {
    setBillableType(type);
    fetchRateSummary();
  };

  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  const CustomToolbar = () => <></>;

  return (
    <Sheet variant="outlined" sx={{ p: 2,  marginTop:2 }} >
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <Button
            sx={{
              backgroundColor: billableType === 'billable' ? '#0b6bcb' : '#97C3F0',
              mr: 1,
            }}
            onClick={() => handleBillableChange('billable')}
          >
            Billable
          </Button>
          <Button
            sx={{
              backgroundColor: billableType === 'non-billable' ? '#0b6bcb' : '#97C3F0',
              mr: 1,
            }}
            onClick={() => handleBillableChange('non-billable')}
          >
            Non-Billable
          </Button>
          <Button
            sx={{
              backgroundColor: billableType === 'all' ? '#0b6bcb' : '#97C3F0',
            }}
            onClick={() => handleBillableChange('all')}
          >
            All
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Button
            sx={{
              backgroundColor: view === 'day' ? '#0b6bcb' : '#97C3F0',
              mr: 1,
            }}
            onClick={() => handleViewChange('today')}
          >
            Today
          </Button>
          <Button
            sx={{
              backgroundColor: view === 'week' ? '#0b6bcb' : '#97C3F0',
              mr: 1,
            }}
            onClick={() => handleViewChange('week')}
          >
            By Week
          </Button>
          <Button
            sx={{
              backgroundColor: view === 'month' ? '#0b6bcb' : '#97C3F0',
            }}
            onClick={() => handleViewChange('month')}
          >
            By Month
          </Button>
        </Grid>
      </Grid>

      <Calendar
        localizer={localizer}
        events={[]}
        startAccessor="start"
        endAccessor="end"
        view={view}
        date={date}
        onNavigate={handleNavigate}
        style={{ height: 500, width: '100%' }}
        components={{
          toolbar: CustomToolbar,
          header: () => null,
        }}
      />

      {loading ? (
        <Grid container justifyContent="center" sx={{ mt: 2 }}>
          <CircularProgress />
        </Grid>
      ) : (
        <Table sx={{ mt: 2 }}>
          <thead>
            <tr>
              <th>Billable</th>
              <th>Non-Billable</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${rateSummary.billable_rate_hours.toFixed(2)}</td>
              <td>${rateSummary.non_billable_rate_hours.toFixed(2)}</td>
              <td>${(rateSummary.billable_rate_hours + rateSummary.non_billable_rate_hours).toFixed(2)}</td>
            </tr>
          </tbody>
        </Table>
      )}
    </Sheet>
  );
};

export default Timesheet;