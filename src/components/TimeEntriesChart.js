import React, { useState, useMemo, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import { Box, Card, Typography, Select, Option, Tabs, TabList, Tab, TabPanel } from '@mui/joy';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const TimeEntriesChart = ({ timeEntries = [], caseId = null, title = "Time Entries Analytics", timeRange: externalTimeRange = null, onTimeRangeChange = null }) => {
  const [chartType, setChartType] = useState('bar');
  const [timeRange, setTimeRange] = useState(externalTimeRange || 'week');
  const [userModified, setUserModified] = useState(false);

  // Update internal timeRange when external one changes (but allow manual override)
  useEffect(() => {
    if (externalTimeRange && !userModified) {
      // Map external time range values to chart time range values
      const timeRangeMap = {
        'last_7_days': 'week',
        'last_30_days': 'month', 
        'last_90_days': 'quarter',
        'all_time': 'quarter'
      };
      const mappedRange = timeRangeMap[externalTimeRange] || 'week';
      setTimeRange(mappedRange);
    }
  }, [externalTimeRange, userModified]);

  // Handle time range changes and notify parent component
  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
    setUserModified(true);
    if (onTimeRangeChange) {
      // Map chart time range back to external time range
      const reverseTimeRangeMap = {
        'week': 'last_7_days',
        'month': 'last_30_days',
        'quarter': 'last_90_days'
      };
      onTimeRangeChange(reverseTimeRangeMap[newTimeRange] || 'last_90_days');
    }
  };

  // Process time entries data for different chart types
  const chartData = useMemo(() => {
    if (!timeEntries || timeEntries.length === 0) {
      return {
        dailyHours: { labels: [], datasets: [] },
        weeklyHours: { labels: [], datasets: [] },
        monthlyHours: { labels: [], datasets: [] },
        billableVsNonBillable: { labels: [], datasets: [] },
        userBreakdown: { labels: [], datasets: [] },
        caseBreakdown: { labels: [], datasets: [] },
        timeTrend: { labels: [], datasets: [] }
      };
    }

    // Debug: Log the first few entries to understand the data structure
    console.log('Time Entries Data Sample:', timeEntries.slice(0, 3));
    console.log('Current time range:', timeRange);

    // Helper function to format date (timezone-safe)
    const formatDate = (dateString) => {
      if (!dateString) return 'Invalid Date';
      
      // Parse date as UTC to avoid timezone issues
      let date;
      if (dateString.includes('T')) {
        // If it's already a full datetime, use it as is
        date = new Date(dateString);
      } else {
        // If it's just a date (YYYY-MM-DD), treat it as UTC midnight
        date = new Date(dateString + 'T00:00:00.000Z');
      }
      
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      // Format as MM/DD/YYYY using local timezone
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        timeZone: 'UTC' // Force UTC to avoid timezone conversion
      });
    };

    // Helper function to get week number
    const getWeekNumber = (date) => {
      const d = new Date(date);
      const start = new Date(d.getFullYear(), 0, 1);
      const days = Math.floor((d - start) / (24 * 60 * 60 * 1000));
      return Math.ceil((days + start.getDay() + 1) / 7);
    };

    // Process daily hours
    const dailyData = {};
    const weeklyData = {};
    const monthlyData = {};
    const billableData = { billable: 0, nonBillable: 0 };
    const userData = {};
    const caseData = {};
    const timeTrendData = {};
    
    // Get time range cutoff date for filtering (timezone-safe)
    const now = new Date();
    const timeRangeDays = {
      'week': 7,
      'month': 30,
      'quarter': 90
    };
    const daysToShow = timeRangeDays[timeRange] || 7;
    
    // Create cutoff date in UTC to avoid timezone issues
    const cutoffDate = new Date(now.getTime() - (daysToShow * 24 * 60 * 60 * 1000));
    // Set to UTC midnight to ensure consistent comparison
    cutoffDate.setUTCHours(0, 0, 0, 0);

    let processedCount = 0;
    timeEntries.forEach((entry, index) => {
      // Use the correct field name for date (entry_date instead of date)
      const entryDate = entry.entry_date || entry.date;
      if (!entryDate) {
        console.log(`Skipping entry ${index}: No date field`);
        return; // Skip entries without date
      }
      
      // Parse date as UTC to avoid timezone issues
      let date;
      if (entryDate.includes('T')) {
        date = new Date(entryDate);
      } else {
        // Treat date as UTC midnight
        date = new Date(entryDate + 'T00:00:00.000Z');
      }
      
      if (isNaN(date.getTime())) {
        console.log(`Skipping entry ${index}: Invalid date ${entryDate}`);
        return; // Skip invalid dates
      }
      
      // Filter by time range - only process entries within the selected time range
      if (date < cutoffDate) {
        console.log(`Skipping entry ${index}: Outside time range (${entryDate} < ${cutoffDate.toISOString().split('T')[0]})`);
        return; // Skip entries outside the time range
      }
      
      const dayKey = formatDate(entryDate);
      const weekKey = `${date.getFullYear()}-W${getWeekNumber(entryDate)}`;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const hours = parseFloat(entry.hours) || 0;
      const isBillable = entry.billable === true || entry.billable === 'true' || entry.billable === 1;
      
      processedCount++;

      // Daily hours
      dailyData[dayKey] = (dailyData[dayKey] || 0) + hours;

      // Weekly hours
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + hours;

      // Monthly hours
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + hours;

      // Billable vs Non-billable
      if (isBillable) {
        billableData.billable += hours;
      } else {
        billableData.nonBillable += hours;
      }

      // User breakdown
      const userName = entry.active_user_staff_name || entry.staff_table_staff_name || entry.user_name || entry.user_id || 'Unknown User';
      userData[userName] = (userData[userName] || 0) + hours;

      // Case breakdown
      const caseName = entry.case_name || entry.case_id || 'Unknown Case';
      caseData[caseName] = (caseData[caseName] || 0) + hours;

      // Time trend (last 30 days)
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
      if (date >= thirtyDaysAgo) {
        const trendKey = formatDate(entryDate);
        timeTrendData[trendKey] = (timeTrendData[trendKey] || 0) + hours;
      }
    });

    console.log(`Processed ${processedCount} out of ${timeEntries.length} entries`);
    console.log('Daily Data:', dailyData);
    console.log('Billable Data:', billableData);

    // Sort and limit data based on time range
    const getSortedData = (data, limit = 7) => {
      return Object.entries(data)
        .filter(([key, value]) => key !== 'Invalid Date' && value > 0) // Filter out invalid dates and zero values
        .sort(([a], [b]) => {
          const dateA = new Date(a);
          const dateB = new Date(b);
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
          return dateA - dateB;
        })
        .slice(-limit);
    };


    console.log('Time Range:', timeRange);
    console.log('Cutoff Date (UTC):', cutoffDate.toISOString().split('T')[0]);
    console.log('Current Date (Local):', now.toLocaleDateString());
    console.log('Current Date (UTC):', now.toISOString().split('T')[0]);
    console.log('Billable Data:', billableData);
    
    const dailyEntries = getSortedData(dailyData, timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90);
    const weeklyEntries = getSortedData(weeklyData, timeRange === 'month' ? 4 : 12);
    const monthlyEntries = getSortedData(monthlyData, 12);

    // Chart datasets
    const commonColors = {
      primary: '#1976d2',
      secondary: '#dc004e',
      success: '#2e7d32',
      warning: '#ed6c02',
      info: '#0288d1',
      light: '#f5f5f5'
    };

    return {
      dailyHours: {
        labels: dailyEntries.map(([date]) => date),
        datasets: [{
          label: 'Hours',
          data: dailyEntries.map(([, hours]) => hours),
          backgroundColor: commonColors.primary,
          borderColor: commonColors.primary,
          borderWidth: 1
        }]
      },
      weeklyHours: {
        labels: weeklyEntries.map(([week]) => week),
        datasets: [{
          label: 'Hours',
          data: weeklyEntries.map(([, hours]) => hours),
          backgroundColor: commonColors.secondary,
          borderColor: commonColors.secondary,
          borderWidth: 1
        }]
      },
      monthlyHours: {
        labels: monthlyEntries.map(([month]) => month),
        datasets: [{
          label: 'Hours',
          data: monthlyEntries.map(([, hours]) => hours),
          backgroundColor: commonColors.success,
          borderColor: commonColors.success,
          borderWidth: 1
        }]
      },
      billableVsNonBillable: {
        labels: ['Billable', 'Non-Billable'],
        datasets: [{
          label: 'Hours',
          data: [billableData.billable, billableData.nonBillable],
          backgroundColor: [commonColors.success, commonColors.warning],
          borderColor: [commonColors.success, commonColors.warning],
          borderWidth: 1
        }]
      },
      userBreakdown: {
        labels: Object.keys(userData).slice(0, 10), // Limit to top 10 users
        datasets: [{
          label: 'Hours',
          data: Object.values(userData).slice(0, 10),
          backgroundColor: [
            commonColors.primary,
            commonColors.secondary,
            commonColors.success,
            commonColors.warning,
            commonColors.info,
            '#9c27b0',
            '#ff5722',
            '#795548',
            '#607d8b',
            '#ffc107'
          ],
          borderWidth: 1
        }]
      },
      caseBreakdown: {
        labels: Object.keys(caseData).slice(0, 10), // Limit to top 10 cases
        datasets: [{
          label: 'Hours',
          data: Object.values(caseData).slice(0, 10),
          backgroundColor: [
            commonColors.primary,
            commonColors.secondary,
            commonColors.success,
            commonColors.warning,
            commonColors.info,
            '#9c27b0',
            '#ff5722',
            '#795548',
            '#607d8b',
            '#ffc107'
          ],
          borderWidth: 1
        }]
      },
      timeTrend: {
        labels: getSortedData(timeTrendData, 30).map(([date]) => date),
        datasets: [{
          label: 'Hours',
          data: getSortedData(timeTrendData, 30).map(([, hours]) => hours),
          borderColor: commonColors.info,
          backgroundColor: commonColors.info + '20',
          tension: 0.4,
          fill: true
        }]
      }
    };
  }, [timeEntries, timeRange]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + 'h';
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: title
      }
    }
  };

  const renderChart = () => {
    const data = chartData[`${timeRange}Hours`] || chartData.dailyHours;
    
    // Check if data is empty and show empty chart
    if (!data || data.labels.length === 0 || (data.datasets && data.datasets[0] && data.datasets[0].data.every(val => val === 0))) {
      const emptyData = {
        labels: ['No Data'],
        datasets: [{
          label: 'Hours',
          data: [0],
          backgroundColor: ['#e0e0e0'],
          borderColor: ['#e0e0e0'],
          borderWidth: 1
        }]
      };
      
      switch (chartType) {
        case 'bar':
          return <Bar key={`${timeRange}-${chartType}-empty`} data={emptyData} options={chartOptions} />;
        case 'line':
          return <Line key={`${timeRange}-${chartType}-empty`} data={emptyData} options={chartOptions} />;
        case 'doughnut':
          return <Doughnut key={`${timeRange}-${chartType}-empty`} data={emptyData} options={chartOptions} />;
        case 'pie':
          return <Pie key={`${timeRange}-${chartType}-empty`} data={emptyData} options={chartOptions} />;
        default:
          return <Bar key={`${timeRange}-${chartType}-empty`} data={emptyData} options={chartOptions} />;
      }
    }
    
    switch (chartType) {
      case 'bar':
        return <Bar key={`${timeRange}-${chartType}`} data={data} options={chartOptions} />;
      case 'line':
        return <Line key={`${timeRange}-${chartType}`} data={data} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut key={`${timeRange}-${chartType}`} data={data} options={pieOptions} />;
      case 'pie':
        return <Pie key={`${timeRange}-${chartType}`} data={data} options={pieOptions} />;
      default:
        return <Bar key={`${timeRange}-${chartType}`} data={data} options={chartOptions} />;
    }
  };

  const renderSpecialChart = (chartKey, title) => {
    const data = chartData[chartKey];
    if (!data || data.labels.length === 0 || (data.datasets && data.datasets[0] && data.datasets[0].data.every(val => val === 0))) {
      // Show empty chart instead of message
      const emptyData = {
        labels: ['No Data'],
        datasets: [{
          label: 'Hours',
          data: [0],
          backgroundColor: ['#e0e0e0'],
          borderColor: ['#e0e0e0'],
          borderWidth: 1
        }]
      };
      
      switch (chartType) {
        case 'bar':
          return <Bar key={`${chartKey}-${chartType}-empty`} data={emptyData} options={pieOptions} />;
        case 'doughnut':
          return <Doughnut key={`${chartKey}-${chartType}-empty`} data={emptyData} options={pieOptions} />;
        case 'pie':
          return <Pie key={`${chartKey}-${chartType}-empty`} data={emptyData} options={pieOptions} />;
        default:
          return <Doughnut key={`${chartKey}-${chartType}-empty`} data={emptyData} options={pieOptions} />;
      }
    }

    switch (chartType) {
      case 'bar':
        return <Bar key={`${chartKey}-${chartType}`} data={data} options={pieOptions} />;
      case 'doughnut':
        return <Doughnut key={`${chartKey}-${chartType}`} data={data} options={pieOptions} />;
      case 'pie':
        return <Pie key={`${chartKey}-${chartType}`} data={data} options={pieOptions} />;
      default:
        return <Doughnut key={`${chartKey}-${chartType}`} data={data} options={pieOptions} />;
    }
  };

  if (!timeEntries || timeEntries.length === 0) {
    // Show empty chart instead of message
    const emptyData = {
      labels: ['No Data'],
      datasets: [{
        label: 'Hours',
        data: [0],
        backgroundColor: ['#e0e0e0'],
        borderColor: ['#e0e0e0'],
        borderWidth: 1
      }]
    };

    return (
      <Card sx={{ p: 2 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography level="h4">{title}</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Select
              value={timeRange}
              onChange={(e, value) => handleTimeRangeChange(value)}
              size="sm"
            >
              <Option value="week">Last Week</Option>
              <Option value="month">Last Month</Option>
              <Option value="quarter">Last 3 Months</Option>
            </Select>
            <Select
              value={chartType}
              onChange={(e, value) => setChartType(value)}
              size="sm"
            >
              <Option value="bar">Bar Chart</Option>
              <Option value="line">Line Chart</Option>
              <Option value="doughnut">Doughnut Chart</Option>
              <Option value="pie">Pie Chart</Option>
            </Select>
          </Box>
        </Box>

        <Tabs defaultValue={0} sx={{ mt: 2 }}>
          <TabList>
            <Tab>Time Analysis</Tab>
            <Tab>Billable vs Non-Billable</Tab>
            <Tab>User Breakdown</Tab>
            <Tab>Case Breakdown</Tab>
            <Tab>Time Trend</Tab>
          </TabList>
          
          <TabPanel value={0}>
            <Box sx={{ height: 400 }}>
              <Bar data={emptyData} options={chartOptions} />
            </Box>
          </TabPanel>
          
          <TabPanel value={1}>
            <Box sx={{ height: 400 }}>
              <Doughnut data={emptyData} options={pieOptions} />
            </Box>
          </TabPanel>
          
          <TabPanel value={2}>
            <Box sx={{ height: 400 }}>
              <Doughnut data={emptyData} options={pieOptions} />
            </Box>
          </TabPanel>
          
          <TabPanel value={3}>
            <Box sx={{ height: 400 }}>
              <Doughnut data={emptyData} options={pieOptions} />
            </Box>
          </TabPanel>
          
          <TabPanel value={4}>
            <Box sx={{ height: 400 }}>
              <Line data={emptyData} options={chartOptions} />
            </Box>
          </TabPanel>
        </Tabs>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography level="h4">{title}</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Select
              value={timeRange}
              onChange={(e, value) => handleTimeRangeChange(value)}
              size="sm"
            >
              <Option value="week">Last Week</Option>
              <Option value="month">Last Month</Option>
              <Option value="quarter">Last 3 Months</Option>
            </Select>
            {/* {externalTimeRange && !userModified && (
              <Typography level="body-xs" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                Synced with main filter
              </Typography>
            )} */}
            {externalTimeRange && userModified && (
              <Typography 
                level="body-xs" 
                sx={{ 
                  color: 'primary.500', 
                  fontSize: '0.75rem', 
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
                onClick={() => {
                  setUserModified(false);
                  // Reset to external time range
                  const timeRangeMap = {
                    'last_7_days': 'week',
                    'last_30_days': 'month', 
                    'last_90_days': 'quarter',
                    'all_time': 'quarter'
                  };
                  setTimeRange(timeRangeMap[externalTimeRange] || 'week');
                }}
              >
                Reset to sync with main filter
              </Typography>
            )}
          </Box>
          <Select
            value={chartType}
            onChange={(e, value) => setChartType(value)}
            size="sm"
          >
            <Option value="bar">Bar Chart</Option>
            <Option value="line">Line Chart</Option>
            <Option value="doughnut">Doughnut Chart</Option>
            <Option value="pie">Pie Chart</Option>
          </Select>
        </Box>
      </Box>

      <Tabs defaultValue={0} sx={{ mt: 2 }}>
        <TabList>
          <Tab>Time Analysis</Tab>
          <Tab>Billable vs Non-Billable</Tab>
          <Tab>User Breakdown</Tab>
          <Tab>Case Breakdown</Tab>
          <Tab>Time Trend</Tab>
        </TabList>
        
        <TabPanel value={0}>
          <Box sx={{ height: 400 }}>
            {renderChart()}
          </Box>
        </TabPanel>
        
        <TabPanel value={1}>
          <Box sx={{ height: 400 }}>
            {renderSpecialChart('billableVsNonBillable', 'Billable vs Non-Billable Hours')}
          </Box>
        </TabPanel>
        
        <TabPanel value={2}>
          <Box sx={{ height: 400 }}>
            {renderSpecialChart('userBreakdown', 'Hours by User')}
          </Box>
        </TabPanel>
        
        <TabPanel value={3}>
          <Box sx={{ height: 400 }}>
            {renderSpecialChart('caseBreakdown', 'Hours by Case')}
          </Box>
        </TabPanel>
        
        <TabPanel value={4}>
          <Box sx={{ height: 400 }}>
            <Line key={`timeTrend-${timeRange}`} data={chartData.timeTrend} options={chartOptions} />
          </Box>
        </TabPanel>
      </Tabs>
    </Card>
  );
};

export default TimeEntriesChart;
