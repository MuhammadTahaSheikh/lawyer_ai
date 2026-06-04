import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  Sheet,
  CircularProgress,
  Chip,
  Card,
  Grid,
  Input,
  Button,
  LinearProgress,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Select,
  Option,
} from "@mui/joy";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PersonIcon from "@mui/icons-material/Person";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import BarChartIcon from "@mui/icons-material/BarChart";
import TableChartIcon from "@mui/icons-material/TableChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import axios from "axios";
import BillableDetailsModal from "../../components/BillableDetailsModal";
import ClosuresTable from "../../components/ClosuresTable";
import ClosureCasesModal from "../../components/ClosureCasesModal";
import NewClientsTable from "../../components/NewClientsTable";
import NewClientCasesModal from "../../components/NewClientCasesModal";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const EmployeesMilestones = () => {
  const [attorneys, setAttorneys] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentWeek, setCurrentWeek] = useState("");
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedChartType, setSelectedChartType] = useState("topPerformers");
  const [timePeriod, setTimePeriod] = useState("week"); // day, week, month
  const [refreshKey, setRefreshKey] = useState(0);
  const [billableModalOpen, setBillableModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [closureModalOpen, setClosureModalOpen] = useState(false);
  const [selectedEmployeeForClosure, setSelectedEmployeeForClosure] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0); // 0 = current month, 1 = previous month, etc.
  const [selectedNewClientMonthIndex, setSelectedNewClientMonthIndex] = useState(0); // 0 = current month, 1..3 = last 3 months
  const [newClientModalOpen, setNewClientModalOpen] = useState(false);
  const [selectedPracticeAreaForNewClient, setSelectedPracticeAreaForNewClient] = useState(null);
  const [newClientByPracticeArea, setNewClientByPracticeArea] = useState([]);
  const [newClientCaseStatus, setNewClientCaseStatus] = useState("open"); // 'open' | 'closed' | 'both' - default open cases only
  const [monthlyCasesOpenedClosed, setMonthlyCasesOpenedClosed] = useState([]); // { month, monthLabel, opened, closed, net }[]

  // Detect mobile and tablet screen sizes
  useEffect(() => {
    const checkScreenSize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 600);
        setIsTablet(window.innerWidth >= 600 && window.innerWidth < 960);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Check if attorney is excluded from closure count
  const isExcludedFromClosures = (employee) => {
    const excludedAttorneys = ['Pierre Louis', 'Melissa Romero', 'Magdaline Mintz'];
    const fullName = `${employee.first_name} ${employee.last_name}`;
    return excludedAttorneys.includes(fullName);
  };

  // Calculate closure goal based on date range (10 per month)
  const getClosureGoal = () => {
    if (!startDate || !endDate) return 10; // Default to 10 if dates not set
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both dates
    
    // Calculate months (using 30 days per month for calculation)
    const months = diffDays / 30;
    
    // Round to 1 decimal place and multiply by 10 (10 closures per month)
    const goal = Math.round(months * 10 * 10) / 10;
    
    // Minimum goal is 0.1 (for very short periods)
    return Math.max(0.1, goal);
  };

  // Check if we should show goal chip (only for month+ views)
  const shouldShowGoal = () => {
    if (!startDate || !endDate) return false;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // Show goal if period is 30 days or more (approximately 1 month)
    return diffDays >= 30;
  };

  // Calculate required hours based on time period
  const getRequiredHours = () => {
    switch (timePeriod) {
      case "day":
        return 7; // 7 hours per day
      case "week":
        return 35; // 35 hours per week (7 * 5 days)
      case "month":
        return 140; // 140 hours per month (35 * 4 weeks)
      default:
        return 35;
    }
  };

  // Auto-detect time period based on date range
  const autoDetectTimePeriod = (start, end) => {
    if (!start || !end) return "day";
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    
    if (diffDays === 1) {
      return "day";
    } else if (diffDays <= 7) {
      return "week";
    } else {
      return "month";
    }
  };

  // Calculate current week dates and set default to previous day
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    let targetDate;
    
    // If today is Monday (day 1), set date to Friday (previous Friday)
    if (dayOfWeek === 1) {
      targetDate = new Date(today);
      targetDate.setDate(today.getDate() - 3); // Go back 3 days from Monday to Friday
    } else {
      // For all other days, use yesterday as before
      targetDate = new Date(today);
      targetDate.setDate(today.getDate() - 1);
    }
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    // Set default date (Friday if Monday, otherwise yesterday)
    setStartDate(formatDate(targetDate));
    setEndDate(formatDate(targetDate));
    setCurrentWeek(`${formatDate(targetDate)} to ${formatDate(targetDate)}`);
    
    // Auto-detect time period based on date range
    setTimePeriod("day"); // Default to day for single date
  }, []);

  const fetchEmployeeData = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Single API call to get all employee milestones data
      const response = await axios.get(
        `/employee_milestones?start_date=${startDate}&end_date=${endDate}`
      );
      
      const { attorneys, staff } = response.data;

      // Filter paralegals from attorneys and move them to staff
      const filteredAttorneys = attorneys.filter(emp => 
        !(emp.type && (emp.type || "").toLowerCase().includes('paralegal')) &&
        !(emp.title && (emp.title || "").toLowerCase().includes('paralegal'))
      );
      
      const paralegals = attorneys.filter(emp => 
        (emp.type && (emp.type || "").toLowerCase().includes('paralegal')) ||
        (emp.title && (emp.title || "").toLowerCase().includes('paralegal'))
      );
      
      // Filter paralegals from staff as well
      const paralegalsFromStaff = staff.filter(emp => 
        (emp.type && (emp.type || "").toLowerCase().includes('paralegal')) ||
        (emp.title && (emp.title || "").toLowerCase().includes('paralegal'))
      );
      
      // Show only paralegals in staff section
      const combinedStaff = [...paralegals, ...paralegalsFromStaff];

      // Data is already sorted by billable hours from the backend
      setAttorneys(filteredAttorneys);
      setStaff(combinedStaff);
    } catch (error) {
      console.error("Error fetching employee data:", error);
      setError("Failed to load employee data. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchEmployeeData();
  }, [startDate, endDate]);

  // Fetch new client counts by practice area when on New Client tab only (does not affect other tabs)
  const fetchNewClientByPracticeArea = async () => {
    if (!startDate || !endDate) return;
    try {
      const response = await axios.get(
        `/new_client_by_practice_area?start_date=${startDate}&end_date=${endDate}&status=${newClientCaseStatus}`
      );
      setNewClientByPracticeArea(response.data.byPracticeArea || []);
    } catch (err) {
      console.error("Error fetching new client by practice area:", err);
      setNewClientByPracticeArea([]);
    }
  };

  useEffect(() => {
    if (activeTab === 3) {
      fetchNewClientByPracticeArea();
    }
  }, [activeTab, startDate, endDate, newClientCaseStatus]);

  // Fetch monthly opened/closed for line chart when on Analytics tab only (does not affect other tabs)
  const fetchMonthlyCasesOpenedClosed = async () => {
    try {
      const response = await axios.get("/monthly_cases_opened_closed?months=12");
      setMonthlyCasesOpenedClosed(response.data.months || []);
    } catch (err) {
      console.error("Error fetching monthly cases opened/closed:", err);
      setMonthlyCasesOpenedClosed([]);
    }
  };

  useEffect(() => {
    if (activeTab === 2) {
      fetchMonthlyCasesOpenedClosed();
    }
  }, [activeTab]);

  // Helper function to get month date range
  const getMonthDateRange = (monthIndex) => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() - monthIndex, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth(); // 0-indexed
    
    // First day of target month
    const firstDayOfMonth = new Date(year, month, 1);
    // Last day of target month (day 0 of next month)
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Format date without timezone conversion (YYYY-MM-DD)
    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    
    return {
      startDate: formatDate(firstDayOfMonth),
      endDate: formatDate(lastDayOfMonth),
      monthName: firstDayOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  };

  // Set date range when Closures / New Client tab is selected or month subtab changes
  useEffect(() => {
    if (activeTab === 0) { // Closures tab
      const monthRange = getMonthDateRange(selectedMonthIndex);
      
      // Only update if dates are different (to avoid infinite loop)
      if (startDate !== monthRange.startDate || endDate !== monthRange.endDate) {
        setStartDate(monthRange.startDate);
        setEndDate(monthRange.endDate);
        setCurrentWeek(`${monthRange.startDate} to ${monthRange.endDate}`);
        const detectedPeriod = autoDetectTimePeriod(monthRange.startDate, monthRange.endDate);
        setTimePeriod(detectedPeriod);
      }
    } else if (activeTab === 3) { // New Client tab
      const monthRange = getMonthDateRange(selectedNewClientMonthIndex);
      if (startDate !== monthRange.startDate || endDate !== monthRange.endDate) {
        setStartDate(monthRange.startDate);
        setEndDate(monthRange.endDate);
        setCurrentWeek(`${monthRange.startDate} to ${monthRange.endDate}`);
        const detectedPeriod = autoDetectTimePeriod(monthRange.startDate, monthRange.endDate);
        setTimePeriod(detectedPeriod);
      }
    } else if (activeTab === 1 || activeTab === 2) { // Employee Tables tab or Analytics & Charts tab
      // Set date to yesterday when Employee Tables or Analytics & Charts tab is first opened
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      
      let targetDate;
      
      // If today is Monday (day 1), set date to Friday (previous Friday)
      if (dayOfWeek === 1) {
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() - 3); // Go back 3 days from Monday to Friday
      } else {
        // For all other days, use yesterday
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() - 1);
      }
      
      const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      
      const targetDateStr = formatDate(targetDate);
      
      // Only update if dates are different (to avoid infinite loop)
      if (startDate !== targetDateStr || endDate !== targetDateStr) {
        setStartDate(targetDateStr);
        setEndDate(targetDateStr);
        setCurrentWeek(`${targetDateStr} to ${targetDateStr}`);
        // Auto-detect time period
        const detectedPeriod = autoDetectTimePeriod(targetDateStr, targetDateStr);
        setTimePeriod(detectedPeriod);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedMonthIndex, selectedNewClientMonthIndex]); // Run when tab or month subtab changes

  // Handle date changes and auto-detect time period
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    
    // Auto-detect time period based on new date range
    const detectedPeriod = autoDetectTimePeriod(newStartDate, endDate);
    setTimePeriod(detectedPeriod);
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    
    // Auto-detect time period based on new date range
    const detectedPeriod = autoDetectTimePeriod(startDate, newEndDate);
    setTimePeriod(detectedPeriod);
  };

  // Recalculate scores when time period changes
  useEffect(() => {
    console.log(`Time period changed to: ${timePeriod}, Required hours: ${getRequiredHours()}`);
    // Force re-render by updating refresh key
    setRefreshKey(prev => prev + 1);
  }, [timePeriod]);

  const calculateScore = (billableHours) => {
    const requiredHours = getRequiredHours();
    const score = Math.round((billableHours / requiredHours) * 100);
    return Math.min(score, 100); // Cap at 100%
  };

  const getPerformanceColor = (score) => {
    if (score >= 100) return "success";
    if (score >= 80) return "warning";
    return "danger";
  };

  const getPerformanceText = (score) => {
    if (score >= 100) return "Excellent";
    if (score >= 80) return "Good";
    return "Needs Improvement";
  };

  // Handle billable hours click
  const handleBillableHoursClick = (employee) => {
    setSelectedEmployee(employee);
    setBillableModalOpen(true);
  };

  // Close billable modal
  const handleCloseBillableModal = () => {
    setBillableModalOpen(false);
    setSelectedEmployee(null);
  };

  // Handle closure count click
  const handleClosureCountClick = (employee) => {
    setSelectedEmployeeForClosure(employee);
    setClosureModalOpen(true);
  };

  // Close closure modal
  const handleCloseClosureModal = () => {
    setClosureModalOpen(false);
    setSelectedEmployeeForClosure(null);
  };

  // Handle practice area click (New Client tab)
  const handlePracticeAreaClick = (practiceArea) => {
    setSelectedPracticeAreaForNewClient(practiceArea);
    setNewClientModalOpen(true);
  };

  // Close new client modal
  const handleCloseNewClientModal = () => {
    setNewClientModalOpen(false);
    setSelectedPracticeAreaForNewClient(null);
  };

  // Chart data preparation for Chart.js
  const prepareChartData = () => {
    const allEmployees = [...attorneys, ...staff];
    
    // Top performers chart data for bar chart
    const topPerformers = allEmployees
      .sort((a, b) => b.billableHours - a.billableHours)
      .slice(0, 10);

    const topPerformersBarData = {
      labels: topPerformers.map(emp => `${emp.first_name.split(' ')[0]} ${emp.last_name.split(' ')[0]}`),
      datasets: [
        {
          label: 'Billable Hours',
          data: topPerformers.map(emp => emp.billableHours),
          backgroundColor: 'rgba(25, 118, 210, 0.8)',
          borderColor: 'rgba(25, 118, 210, 1)',
          borderWidth: 1,
        },
        {
          label: 'Billable Amount ($)',
          data: topPerformers.map(emp => emp.billableAmount),
          backgroundColor: 'rgba(46, 125, 50, 0.8)',
          borderColor: 'rgba(46, 125, 50, 1)',
          borderWidth: 1,
        }
      ]
    };

    // Performance distribution for pie chart
    const excellentCount = allEmployees.filter(emp => calculateScore(emp.billableHours) >= 100).length;
    const goodCount = allEmployees.filter(emp => {
      const score = calculateScore(emp.billableHours);
      return score >= 80 && score < 100;
    }).length;
    const needsImprovementCount = allEmployees.filter(emp => calculateScore(emp.billableHours) < 80).length;

    const performancePieData = {
      labels: ['Excellent', 'Good', 'Needs Improvement'],
      datasets: [
        {
          data: [excellentCount, goodCount, needsImprovementCount],
          backgroundColor: [
            'rgba(46, 125, 50, 0.8)',
            'rgba(237, 108, 2, 0.8)',
            'rgba(211, 47, 47, 0.8)'
          ],
          borderColor: [
            'rgba(46, 125, 50, 1)',
            'rgba(237, 108, 2, 1)',
            'rgba(211, 47, 47, 1)'
          ],
          borderWidth: 1,
        }
      ]
    };

    // Attorney vs Staff comparison for bar chart
    const attorneyStaffBarData = {
      labels: ['Attorneys', 'Staff'],
      datasets: [
        {
          label: 'Total Hours',
          data: [
            attorneys.reduce((sum, emp) => sum + emp.billableHours, 0),
            staff.reduce((sum, emp) => sum + emp.billableHours, 0)
          ],
          backgroundColor: 'rgba(25, 118, 210, 0.8)',
          borderColor: 'rgba(25, 118, 210, 1)',
          borderWidth: 1,
        },
        {
          label: 'Total Amount ($)',
          data: [
            attorneys.reduce((sum, emp) => sum + emp.billableAmount, 0),
            staff.reduce((sum, emp) => sum + emp.billableAmount, 0)
          ],
          backgroundColor: 'rgba(46, 125, 50, 0.8)',
          borderColor: 'rgba(46, 125, 50, 1)',
          borderWidth: 1,
        },
        {
          label: 'Average Score (%)',
          data: [
            attorneys.length > 0 ? attorneys.reduce((sum, emp) => sum + calculateScore(emp.billableHours), 0) / attorneys.length : 0,
            staff.length > 0 ? staff.reduce((sum, emp) => sum + calculateScore(emp.billableHours), 0) / staff.length : 0
          ],
          backgroundColor: 'rgba(237, 108, 2, 0.8)',
          borderColor: 'rgba(237, 108, 2, 1)',
          borderWidth: 1,
        }
      ]
    };

    // Monthly cases opened vs closed: net = closed - opened. Upward trend = more closed than opened; downward = more opened than closed
    const monthlyTrendLineData = {
      labels: monthlyCasesOpenedClosed.length ? monthlyCasesOpenedClosed.map((m) => m.monthLabel) : [],
      datasets: [
        {
          label: 'Net (Closed − Opened)',
          data: monthlyCasesOpenedClosed.length ? monthlyCasesOpenedClosed.map((m) => m.net) : [],
          borderColor: 'rgba(25, 118, 210, 1)',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Opened',
          data: monthlyCasesOpenedClosed.length ? monthlyCasesOpenedClosed.map((m) => m.opened) : [],
          borderColor: 'rgba(211, 47, 47, 1)',
          backgroundColor: 'rgba(211, 47, 47, 0.05)',
          fill: false,
          tension: 0.4,
        },
        {
          label: 'Closed',
          data: monthlyCasesOpenedClosed.length ? monthlyCasesOpenedClosed.map((m) => m.closed) : [],
          borderColor: 'rgba(46, 125, 50, 1)',
          backgroundColor: 'rgba(46, 125, 50, 0.05)',
          fill: false,
          tension: 0.4,
        }
      ]
    };

    return {
      topPerformersBarData,
      performancePieData,
      attorneyStaffBarData,
      monthlyTrendLineData,
      totalEmployees: allEmployees.length,
      excellentCount,
      goodCount,
      needsImprovementCount
    };
  };

  const chartData = prepareChartData();

  // Function to render selected chart
  const renderSelectedChart = () => {
    // Get font size based on screen size (Chart.js doesn't support responsive objects)
    const getFontSize = () => {
      if (typeof window !== 'undefined') {
        return window.innerWidth < 600 ? 10 : 12;
      }
      return 12;
    };
    
    const getRotation = () => {
      if (typeof window !== 'undefined') {
        return window.innerWidth < 600 ? 90 : 45;
      }
      return 45;
    };
    
    const fontSize = getFontSize();
    const rotation = getRotation();
    
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        }
      }
    };

    switch (selectedChartType) {
      case "topPerformers":
        return (
          <Card variant="outlined" sx={{ p: { xs: 1, sm: 2 }, height: { xs: 400, sm: 500 } }}>
            <Typography level="h5" sx={{ mb: 2, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
              Top 10 Performers by Billable Hours
            </Typography>
            <Box sx={{ height: { xs: 300, sm: 400 } }}>
              <Bar 
                data={chartData.topPerformersBarData}
                options={{
                  ...commonOptions,
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        if (context.datasetIndex === 0) {
                          return `Billable Hours: ${context.parsed.y.toFixed(1)} hrs`;
                        } else {
                          return `Billable Amount: $${context.parsed.y.toFixed(2)}`;
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      ticks: {
                        maxRotation: rotation,
                        minRotation: rotation,
                        font: { size: fontSize }
                      }
                    },
                    y: {
                      beginAtZero: true,
                      ticks: {
                        font: { size: fontSize }
                      }
                    }
                  }
                }}
              />
            </Box>
          </Card>
        );

      case "performanceDistribution":
        return (
          <Card variant="outlined" sx={{ p: { xs: 1, sm: 2 }, height: { xs: 400, sm: 500 } }}>
            <Typography level="h5" sx={{ mb: 2, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
              Performance Distribution
            </Typography>
            <Box sx={{ height: { xs: 300, sm: 400 } }}>
              <Pie 
                data={chartData.performancePieData}
                options={{
                  ...commonOptions,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        font: { size: fontSize }
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((context.parsed / total) * 100).toFixed(1);
                          return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </Box>
          </Card>
        );

      case "attorneyStaffComparison":
        return (
          <Card variant="outlined" sx={{ p: { xs: 1, sm: 2 }, height: { xs: 400, sm: 500 } }}>
            <Typography level="h5" sx={{ mb: 2, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
              Attorney vs Staff Performance
            </Typography>
            <Box sx={{ height: { xs: 300, sm: 400 } }}>
              <Bar 
                data={chartData.attorneyStaffBarData}
                options={{
                  ...commonOptions,
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        if (context.datasetIndex === 0) {
                          return `Total Hours: ${context.parsed.y.toFixed(1)} hrs`;
                        } else if (context.datasetIndex === 1) {
                          return `Total Amount: $${context.parsed.y.toFixed(2)}`;
                        } else {
                          return `Average Score: ${context.parsed.y.toFixed(1)}%`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        font: { size: fontSize }
                      }
                    },
                    x: {
                      ticks: {
                        font: { size: fontSize }
                      }
                    }
                  }
                }}
              />
            </Box>
          </Card>
        );

      case "monthlyTrend":
        return (
          <Card variant="outlined" sx={{ p: { xs: 1, sm: 2 }, height: { xs: 400, sm: 500 } }}>
            <Typography level="h5" sx={{ mb: 1, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
              Cases Opened vs Closed (Monthly)
            </Typography>
            <Typography level="body-sm" color="neutral" sx={{ mb: 2, fontSize: { xs: "0.7rem", sm: "0.8rem" } }}>
              Upward trend = more closed than opened. Downward trend = more opened than closed.
            </Typography>
            <Box sx={{ height: { xs: 300, sm: 400 } }}>
              <Line 
                data={chartData.monthlyTrendLineData}
                options={{
                  ...commonOptions,
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.dataset.label || "";
                        const value = context.parsed.y;
                        if (label.startsWith("Net")) return `${label}: ${value > 0 ? "+" : ""}${value} cases`;
                        return `${label}: ${value} cases`;
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      ticks: {
                        font: { size: fontSize }
                      }
                    },
                    x: {
                      ticks: {
                        font: { size: fontSize }
                      }
                    }
                  }
                }}
              />
            </Box>
          </Card>
        );

      case "performanceScores":
        return (
          <Card variant="outlined" sx={{ p: { xs: 1, sm: 2 }, height: { xs: 400, sm: 500 } }}>
            <Typography level="h5" sx={{ mb: 2, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
              Performance Score Distribution
            </Typography>
            <Box sx={{ height: { xs: 300, sm: 400 } }}>
              <Line 
                data={{
                  labels: chartData.topPerformersBarData.labels,
                  datasets: [{
                    label: 'Performance Score (%)',
                    data: chartData.topPerformersBarData.labels.map((_, index) => {
                      const emp = chartData.topPerformersBarData.datasets[0].data[index];
                      return calculateScore(emp);
                    }),
                    borderColor: 'rgba(25, 118, 210, 1)',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    fill: true,
                    tension: 0.4,
                  }]
                }}
                options={{
                  ...commonOptions,
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `Performance Score: ${context.parsed.y.toFixed(1)}%`;
                      }
                    }
                  },
                  scales: {
                    x: {
                      ticks: {
                        maxRotation: rotation,
                        minRotation: rotation,
                        font: { size: fontSize }
                      }
                    },
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        font: { size: { xs: 10, sm: 12 } }
                      }
                    }
                  }
                }}
              />
            </Box>
          </Card>
        );

      default:
        return (
          <Card variant="outlined" sx={{ 
            p: { xs: 1, sm: 2 }, 
            height: { xs: 400, sm: 500 }, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center" 
          }}>
            <Typography 
              level="body-lg" 
              color="neutral"
              sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              Select a chart type to view analytics
            </Typography>
          </Card>
        );
    }
  };

  // Charts component with chart type selector
  const renderCharts = () => (
    <Box sx={{ p: 2 }}>
      <Typography level="h4" sx={{ mb: 3 }}>Employee Performance Analytics</Typography>
      
        {/* Summary Cards */}
        <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
          <Grid xs={6} sm={4} md={2.4}>
            <Card variant="outlined" sx={{ p: { xs: 1, sm: 2 }, textAlign: "center" }}>
              <Typography level="h3" color="primary" sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
                {chartData.totalEmployees}
              </Typography>
              <Typography level="body-sm" sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}>
                Total Employees
              </Typography>
            </Card>
          </Grid>
          <Grid xs={6} sm={4} md={2.4}>
            <Card variant="outlined" sx={{ p: { xs: 1, sm: 2 }, textAlign: "center" }}>
              <Typography level="h3" color="success" sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
                {chartData.excellentCount}
              </Typography>
              <Typography level="body-sm" sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}>
                Excellent Performers
              </Typography>
            </Card>
          </Grid>
          <Grid xs={6} sm={4} md={2.4}>
            <Card variant="outlined" sx={{ p: { xs: 1, sm: 2 }, textAlign: "center" }}>
              <Typography level="h3" color="warning" sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
                {chartData.goodCount}
              </Typography>
              <Typography level="body-sm" sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}>
                Good Performers
              </Typography>
            </Card>
          </Grid>
          <Grid xs={6} sm={4} md={2.4}>
            <Card variant="outlined" sx={{ p: { xs: 1, sm: 2 }, textAlign: "center" }}>
              <Typography level="h3" color="danger" sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
                {chartData.needsImprovementCount}
              </Typography>
              <Typography level="body-sm" sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}>
                Need Improvement
              </Typography>
            </Card>
          </Grid>
          <Grid xs={12} sm={4} md={2.4}>
            <Card variant="outlined" sx={{ p: { xs: 1, sm: 2 }, textAlign: "center" }}>
              <Typography level="h3" color="info" sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
                {getRequiredHours()}
              </Typography>
              <Typography level="body-sm" sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}>
                Required Hours ({timePeriod})
              </Typography>
            </Card>
          </Grid>
        </Grid>

      {/* Chart Type Selector */}
      <Box sx={{ 
        mb: 3, 
        display: "flex", 
        alignItems: { xs: "stretch", sm: "center" }, 
        gap: { xs: 1, sm: 2 },
        flexDirection: { xs: "column", sm: "row" }
      }}>
        <Typography 
          level="body-md" 
          sx={{ 
            fontWeight: "bold",
            fontSize: { xs: "0.875rem", sm: "1rem" },
            mb: { xs: 1, sm: 0 }
          }}
        >
          Select Chart Type:
        </Typography>
        <Select
          value={selectedChartType}
          onChange={(event, newValue) => setSelectedChartType(newValue)}
          sx={{ 
            minWidth: { xs: "100%", sm: 200 },
            width: { xs: "100%", sm: "auto" }
          }}
        >
          <Option value="topPerformers">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <BarChartIcon fontSize="small" />
              <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                Top Performers (Bar)
              </Typography>
            </Box>
          </Option>
          <Option value="performanceDistribution">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PieChartIcon fontSize="small" />
              <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                Performance Distribution (Pie)
              </Typography>
            </Box>
          </Option>
          <Option value="attorneyStaffComparison">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <BarChartIcon fontSize="small" />
              <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                Attorney vs Staff (Bar)
              </Typography>
            </Box>
          </Option>
          <Option value="monthlyTrend">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ShowChartIcon fontSize="small" />
              <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                Cases Opened vs Closed (Line)
              </Typography>
            </Box>
          </Option>
          {/* <Option value="performanceScores">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TrendingUpIcon fontSize="small" />
              <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                Performance Scores (Line)
              </Typography>
            </Box>
          </Option> */}
        </Select>
      </Box>

      {/* Selected Chart */}
      {renderSelectedChart()}
    </Box>
  );


  const renderEmployeeTable = (employees, title, icon) => {
    // Mobile/Tablet: Card-based layout
    if (isMobile || isTablet) {
      return (
        <Card variant="outlined" sx={{ 
          p: { xs: 1, sm: 1.5 }, 
          mb: 2,
          border: "1px solid #ddd",
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            mb: 2, 
            flexShrink: 0,
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 }
          }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {icon}
              <Typography level="h4" sx={{ 
                ml: 1, 
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
                textAlign: { xs: "center", sm: "left" }
              }}>
                {title} ({employees.length})
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {employees.length > 0 ? (
              employees.map((employee, index) => {
                const score = calculateScore(employee.billableHours);
                const performanceColor = getPerformanceColor(score);
                const performanceText = getPerformanceText(score);
                
                return (
                  <Card 
                    key={employee.staff_id}
                    variant="outlined" 
                    sx={{ 
                      p: 1.5,
                      border: "1px solid #e0e0e0",
                      borderRadius: 1
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography level="body-md" sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                          #{index + 1} - {employee.first_name} {employee.last_name}
                        </Typography>
                        <Chip
                          color={performanceColor}
                          variant="soft"
                          size="sm"
                          sx={{ fontSize: "0.7rem" }}
                        >
                          {performanceText}
                        </Chip>
                      </Box>
                      
                      <Typography level="body-sm" color="neutral" sx={{ fontSize: "0.75rem" }}>
                        {employee.title || employee.type || "Staff"}
                      </Typography>
                      
                      <Box sx={{ 
                        display: "grid", 
                        gridTemplateColumns: "1fr 1fr", 
                        gap: 1,
                        mt: 1
                      }}>
                        <Box>
                          <Typography level="body-xs" color="neutral" sx={{ fontSize: "0.7rem" }}>
                            Billable Hours
                          </Typography>
                          <Typography 
                            level="body-sm" 
                            sx={{ 
                              fontWeight: "bold", 
                              fontSize: "0.875rem",
                              cursor: "pointer",
                              color: "primary.500",
                              "&:hover": {
                                color: "primary.700",
                                textDecoration: "underline"
                              }
                            }}
                            onClick={() => handleBillableHoursClick(employee)}
                          >
                            {employee.billableHours.toFixed(1)} hrs
                          </Typography>
                          <Typography level="body-xs" color="neutral" sx={{ fontSize: "0.65rem" }}>
                            {employee.nonBillableHours.toFixed(1)} non-billable
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography level="body-xs" color="neutral" sx={{ fontSize: "0.7rem" }}>
                            Billable Amount
                          </Typography>
                          <Typography level="body-sm" sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                            ${employee.billableAmount.toFixed(2)}
                          </Typography>
                        </Box>
                        
                        
                        <Box>
                          <Typography level="body-xs" color="neutral" sx={{ fontSize: "0.7rem" }}>
                            Score
                          </Typography>
                          <Typography 
                            level="body-sm" 
                            sx={{ 
                              fontWeight: "bold",
                              color: score >= 100 ? "success.500" : score >= 80 ? "warning.500" : "danger.500",
                              fontSize: "0.875rem"
                            }}
                          >
                            {score}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Card>
                );
              })
            ) : (
              <Typography level="body-md" color="neutral" sx={{ textAlign: "center", py: 2, fontSize: "0.875rem" }}>
                No {title.toLowerCase()} data available
              </Typography>
            )}
          </Box>
        </Card>
      );
    }
    
    // Desktop: Table layout
    return (
      <Card variant="outlined" sx={{ 
        p: { xs: 1, sm: 2 }, 
        mb: 2, 
        height: { xs: "400px", sm: "500px" }, 
        display: "flex", 
        flexDirection: "column",
        border: "1px solid #ddd",
        borderRadius: 2,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          mb: 2, 
          flexShrink: 0,
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1, sm: 0 }
        }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {icon}
            <Typography level="h4" sx={{ 
              ml: 1, 
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              textAlign: { xs: "center", sm: "left" }
            }}>
              {title} ({employees.length})
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ 
          flex: 1, 
          minHeight: 0, 
          overflow: "hidden", 
          display: "flex", 
          flexDirection: "column"
        }}>
          <Box sx={{ 
            flex: 1, 
            overflowY: "auto", 
            overflowX: "auto",
            minHeight: 0,
            height: "100%",
            maxHeight: "100%",
            "&::-webkit-scrollbar": { width: "8px", height: "8px" }, 
            "&::-webkit-scrollbar-track": { background: "var(--joy-palette-neutral-100)" }, 
            "&::-webkit-scrollbar-thumb": { background: "var(--joy-palette-neutral-300)", borderRadius: "4px" }, 
            "&::-webkit-scrollbar-thumb:hover": { background: "var(--joy-palette-neutral-400)" } 
          }}>
            <Table stickyHeader sx={{ 
              tableLayout: "auto",
              width: "100%",
              minWidth: "740px",
              "& thead th": { 
                backgroundColor: "var(--joy-palette-background-surface)", 
                fontWeight: "bold",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                padding: { xs: "8px 6px", sm: "12px 10px" },
                whiteSpace: "nowrap",
                textAlign: "center",
                borderRight: "1px solid var(--joy-palette-neutral-200)"
              },
              "& tbody tr:hover": { backgroundColor: "var(--joy-palette-neutral-50)" },
              "& tbody tr": { transition: "background-color 0.2s ease" },
              "& tbody td": {
                padding: { xs: "8px 6px", sm: "12px 10px" },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                whiteSpace: "nowrap",
                textAlign: "center",
                verticalAlign: "top",
                borderRight: "1px solid var(--joy-palette-neutral-200)",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }
            }}>
            <thead>
              <tr>
                <th style={{ position: "sticky", top: 0, backgroundColor: "var(--joy-palette-background-surface)", zIndex: 1, minWidth: "60px", width: "60px" }}>
                  Rank
                </th>
                <th style={{ position: "sticky", top: 0, backgroundColor: "var(--joy-palette-background-surface)", zIndex: 1, minWidth: "140px", width: "140px" }}>
                  Name
                </th>
                <th style={{ position: "sticky", top: 0, backgroundColor: "var(--joy-palette-background-surface)", zIndex: 1, minWidth: "120px", width: "120px" }}>
                  Billable Hours
                </th>
                <th style={{ position: "sticky", top: 0, backgroundColor: "var(--joy-palette-background-surface)", zIndex: 1, minWidth: "140px" }}>
                  Billable Amount
                </th>
                <th style={{ position: "sticky", top: 0, backgroundColor: "var(--joy-palette-background-surface)", zIndex: 1, minWidth: "80px" }}>
                  Score
                </th>
                <th style={{ position: "sticky", top: 0, backgroundColor: "var(--joy-palette-background-surface)", zIndex: 1, minWidth: "140px" }}>
                  Performance
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map((employee, index) => {
                  const score = calculateScore(employee.billableHours);
                  const performanceColor = getPerformanceColor(score);
                  const performanceText = getPerformanceText(score);
                  
                  return (
                    <tr key={employee.staff_id}>
                      <td style={{ width: "60px" }}>
                        <Typography level="body-md" sx={{ fontWeight: "bold", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          #{index + 1}
                        </Typography>
                      </td>
                      <td style={{ width: "140px", textAlign: "left" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                          <Typography level="body-md" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, fontWeight: "bold" }}>
                            {employee.first_name} {employee.last_name}
                          </Typography>
                          <Typography level="body-sm" color="neutral" sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}>
                            {employee.title || employee.type || "Staff"}
                          </Typography>
                        </Box>
                      </td>
                      <td style={{ width: "120px" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                          <Typography 
                            level="body-md" 
                            sx={{ 
                              fontWeight: "bold", 
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              cursor: "pointer",
                              color: "primary.500",
                              "&:hover": {
                                color: "primary.700",
                                textDecoration: "underline"
                              }
                            }}
                            onClick={() => handleBillableHoursClick(employee)}
                          >
                            {employee.billableHours.toFixed(1)} hrs
                          </Typography>
                          <Typography level="body-sm" color="neutral" sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}>
                            {employee.nonBillableHours.toFixed(1)} non-billable
                          </Typography>
                        </Box>
                      </td>
                      <td style={{ width: "120px" }}>
                        <Typography level="body-md" sx={{ fontWeight: "bold", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          ${employee.billableAmount.toFixed(2)}
                        </Typography>
                      </td>
                      <td style={{ width: "80px" }}>
                        <Typography 
                          level="body-md" 
                          sx={{ 
                            fontWeight: "bold",
                            color: score >= 100 ? "success.500" : score >= 80 ? "warning.500" : "danger.500",
                            fontSize: { xs: "0.75rem", sm: "0.875rem" }
                          }}
                        >
                          {score}%
                        </Typography>
                      </td>
                      <td style={{ width: "120px" }}>
                        <Chip
                          color={performanceColor}
                          variant="soft"
                          size="sm"
                          sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
                        >
                          {performanceText}
                        </Chip>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                    <Typography level="body-md" color="neutral" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                      No {title.toLowerCase()} data available
                    </Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Box>
      </Box>
    </Card>
    );
  };

  return (
    <Box sx={{ 
      mb: 3,
      border: "1px solid #ddd",
      borderRadius: 2,
      p: { xs: 1, sm: 2 },
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
    }}>
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        mb: 2,
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 1, sm: 0 }
      }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <TrendingUpIcon color="primary" />
          <Typography level="h3" sx={{ ml: 1, fontSize: { xs: "1.5rem", sm: "2rem" } }}>
            Employee Milestones
          </Typography>
        </Box>
      </Box>
      
      <Sheet variant="outlined" sx={{ 
        p: { xs: 1, sm: 2 }, 
        mb: 2,
        border: "1px solid #ddd",
        borderRadius: 2,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <Box sx={{ 
          display: "flex", 
          gap: { xs: 1, sm: 2 }, 
          alignItems: "center", 
          flexWrap: "wrap",
          flexDirection: { xs: "column", sm: "row" }
        }}>
          <Box sx={{ 
            display: "flex", 
            gap: { xs: 1, sm: 2 }, 
            alignItems: "center", 
            flexWrap: "wrap",
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "center", sm: "flex-start" }
          }}>
            <Input
              type="date"
              startDecorator={<CalendarTodayIcon />}
              value={startDate}
              onChange={handleStartDateChange}
              size="sm"
              sx={{ minWidth: { xs: "140px", sm: "160px" } }}
            />
            <Input
              type="date"
              startDecorator={<CalendarTodayIcon />}
              value={endDate}
              onChange={handleEndDateChange}
              size="sm"
              sx={{ minWidth: { xs: "140px", sm: "160px" } }}
            />
            <Select
              value={timePeriod}
              onChange={(event, newValue) => setTimePeriod(newValue)}
              size="sm"
              sx={{ minWidth: { xs: "120px", sm: "140px" } }}
            >
              <Option value="day">Daily</Option>
              <Option value="week">Weekly</Option>
              <Option value="month">Monthly</Option>
            </Select>
            <Button
              onClick={fetchEmployeeData}
              disabled={loading}
              size="sm"
              sx={{ minWidth: { xs: "80px", sm: "100px" } }}
            >
              {loading ? <CircularProgress size="sm" /> : "Refresh"}
            </Button>
          </Box>
          <Typography 
            level="body-sm" 
            color="neutral"
            sx={{ 
              textAlign: { xs: "center", sm: "left" },
              mt: { xs: 1, sm: 0 },
              fontSize: { xs: "0.75rem", sm: "0.875rem" }
            }}
          >
            Current Week: {currentWeek}
          </Typography>
        </Box>
      </Sheet>

      {error && (
        <Box sx={{ p: 2, mb: 2, bgcolor: "danger.50", borderRadius: 1 }}>
          <Typography level="body-sm" color="danger">
            {error}
          </Typography>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "200px", p: 3 }}>
          <CircularProgress size="lg" />
          <Typography level="body-md" sx={{ mt: 2 }}>
            Loading employee milestones...
          </Typography>
        </Box>
      ) : (
        <Tabs 
          key={`${timePeriod}-${refreshKey}`} 
          value={activeTab} 
          onChange={(event, newValue) => setActiveTab(newValue)}
          sx={{
            '--Tabs-indicatorColor': 'transparent',
            '--Tabs-indicatorThickness': '0px',
            '--Tab-indicatorThickness': '0px',
            '--Tab-indicatorColor': 'transparent',
          }}
        >
          <TabList sx={{ 
            flexDirection: { xs: "column", sm: "row" },
            width: { xs: "100%", sm: "auto" },
            gap: { xs: 0.5, sm: 0 }
          }}>
            <Tab sx={{ 
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "1rem" },
              padding: { xs: "10px 12px", sm: "8px 16px" },
              minHeight: { xs: "44px", sm: "auto" },
              backgroundColor: 'transparent',
              '&.Mui-selected': {
                backgroundColor: 'transparent',
                borderBottom: '2px solid var(--joy-palette-primary-500)',
              },
              '&:hover': {
                backgroundColor: 'transparent',
              }
            }}>
              <CheckCircleIcon sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: "1rem", sm: "1.25rem" } }} />
              <Typography sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
                Closures
              </Typography>
            </Tab>
            <Tab sx={{ 
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "1rem" },
              padding: { xs: "10px 12px", sm: "8px 16px" },
              minHeight: { xs: "44px", sm: "auto" },
              backgroundColor: 'transparent',
              '&.Mui-selected': {
                backgroundColor: 'transparent',
                borderBottom: '2px solid var(--joy-palette-primary-500)',
              },
              '&:hover': {
                backgroundColor: 'transparent',
              }
            }}>
              <TableChartIcon sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: "1rem", sm: "1.25rem" } }} />
              <Typography sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
                Employee Tables
              </Typography>
            </Tab>
            <Tab sx={{ 
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "1rem" },
              padding: { xs: "10px 12px", sm: "8px 16px" },
              minHeight: { xs: "44px", sm: "auto" },
              backgroundColor: 'transparent',
              '&.Mui-selected': {
                backgroundColor: 'transparent',
                borderBottom: '2px solid var(--joy-palette-primary-500)',
              },
              '&:hover': {
                backgroundColor: 'transparent',
              }
            }}>
              <BarChartIcon sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: "1rem", sm: "1.25rem" } }} />
              <Typography sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
                Analytics & Charts
              </Typography>
            </Tab>
            <Tab sx={{ 
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.8rem", sm: "1rem" },
              padding: { xs: "10px 12px", sm: "8px 16px" },
              minHeight: { xs: "44px", sm: "auto" },
              backgroundColor: 'transparent',
              '&.Mui-selected': {
                backgroundColor: 'transparent',
                borderBottom: '2px solid var(--joy-palette-primary-500)',
              },
              '&:hover': {
                backgroundColor: 'transparent',
              }
            }}>
              <PersonAddIcon sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: "1rem", sm: "1.25rem" } }} />
              <Typography sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
                New Client
              </Typography>
            </Tab>
          </TabList>

          <TabPanel value={0} key={`closures-${refreshKey}`} sx={{ p: { xs: 1, sm: 2 } }}>
            <Tabs 
              value={selectedMonthIndex} 
              onChange={(event, newValue) => setSelectedMonthIndex(newValue)}
              sx={{
                '--Tabs-indicatorColor': 'transparent',
                '--Tabs-indicatorThickness': '0px',
                '--Tab-indicatorThickness': '0px',
                '--Tab-indicatorColor': 'transparent',
              }}
            >
              <TabList sx={{ 
                flexDirection: { xs: "column", sm: "row" },
                width: { xs: "100%", sm: "auto" },
                gap: { xs: 0.5, sm: 0 },
                mb: 2,
                overflowX: "auto"
              }}>
                {[...Array(4)].map((_, index) => {
                  const monthRange = getMonthDateRange(index);
                  const isCurrentMonth = index === 0;
                  return (
                    <Tab 
                      key={index}
                      value={index}
                      sx={{ 
                        width: { xs: "100%", sm: "auto" },
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        padding: { xs: "8px 10px", sm: "6px 14px" },
                        minHeight: { xs: "40px", sm: "auto" },
                        backgroundColor: 'transparent',
                        '&.Mui-selected': {
                          backgroundColor: 'transparent',
                          borderBottom: '2px solid var(--joy-palette-primary-500)',
                          fontWeight: 'bold'
                        },
                        '&:hover': {
                          backgroundColor: 'transparent',
                        }
                      }}
                    >
                      <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                        {isCurrentMonth ? 'Current Month' : monthRange.monthName}
                      </Typography>
                    </Tab>
                  );
                })}
              </TabList>
              <Box>
                <ClosuresTable
                  attorneys={attorneys}
                  isExcludedFromClosures={isExcludedFromClosures}
                  shouldShowGoal={shouldShowGoal}
                  getClosureGoal={getClosureGoal}
                  timePeriod={timePeriod}
                  onClosureCountClick={handleClosureCountClick}
                />
              </Box>
            </Tabs>
          </TabPanel>

          <TabPanel value={1} sx={{ p: { xs: 1, sm: 2 } }}>
            <Grid container spacing={{ xs: 1, sm: 2 }} key={`tables-${refreshKey}`}>
              <Grid xs={12} md={6}>
                {renderEmployeeTable(
                  attorneys,
                  "Attorneys",
                  <BusinessCenterIcon color="primary" />
                )}
              </Grid>
              <Grid xs={12} md={6}>
                {renderEmployeeTable(
                  staff,
                  "Staff",
                  <PersonIcon color="secondary" />
                )}
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={2} key={`charts-${refreshKey}`} sx={{ p: { xs: 1, sm: 2 } }}>
            {renderCharts()}
          </TabPanel>

          <TabPanel value={3} key={`newclient-${refreshKey}`} sx={{ p: { xs: 1, sm: 2 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
              <Typography level="body-sm" sx={{ fontWeight: "bold", fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                Show:
              </Typography>
              <Select
                value={newClientCaseStatus}
                onChange={(event, newValue) => setNewClientCaseStatus(newValue || "open")}
                size="sm"
                sx={{ minWidth: { xs: "140px", sm: "160px" }, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                <Option value="open">Open cases only</Option>
                <Option value="closed">Closed cases only</Option>
                <Option value="both">Open & closed (both)</Option>
              </Select>
            </Box>
            <Tabs
              value={selectedNewClientMonthIndex}
              onChange={(event, newValue) => setSelectedNewClientMonthIndex(newValue)}
              sx={{
                '--Tabs-indicatorColor': 'transparent',
                '--Tabs-indicatorThickness': '0px',
                '--Tab-indicatorThickness': '0px',
                '--Tab-indicatorColor': 'transparent',
              }}
            >
              <TabList sx={{
                flexDirection: { xs: "column", sm: "row" },
                width: { xs: "100%", sm: "auto" },
                gap: { xs: 0.5, sm: 0 },
                mb: 2,
                overflowX: "auto"
              }}>
                {[...Array(4)].map((_, index) => {
                  const monthRange = getMonthDateRange(index);
                  const isCurrentMonth = index === 0;
                  return (
                    <Tab
                      key={index}
                      value={index}
                      sx={{
                        width: { xs: "100%", sm: "auto" },
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        padding: { xs: "8px 10px", sm: "6px 14px" },
                        minHeight: { xs: "40px", sm: "auto" },
                        backgroundColor: 'transparent',
                        '&.Mui-selected': {
                          backgroundColor: 'transparent',
                          borderBottom: '2px solid var(--joy-palette-primary-500)',
                          fontWeight: 'bold'
                        },
                        '&:hover': {
                          backgroundColor: 'transparent',
                        }
                      }}
                    >
                      <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                        {isCurrentMonth ? 'Current Month' : monthRange.monthName}
                      </Typography>
                    </Tab>
                  );
                })}
              </TabList>
              <Box>
                <NewClientsTable
                  practiceAreaData={newClientByPracticeArea}
                  onPracticeAreaClick={handlePracticeAreaClick}
                />
              </Box>
            </Tabs>
          </TabPanel>
        </Tabs>
      )}

      {/* <Box sx={{ mt: 2, p: 2, bgcolor: "primary.50", borderRadius: 1, border: "1px solid", borderColor: "primary.200" }}>
        <Typography level="body-sm" color="primary" sx={{ fontWeight: "bold" }}>
          📊 Performance Criteria: {getRequiredHours()} hours per {timePeriod} required for full score
        </Typography>
        <Typography level="body-xs" color="neutral" sx={{ mt: 0.5 }}>
          🟢 Green: Meeting/exceeding requirements | 🟡 Yellow: Good performance (80-99%) | 🔴 Red: Needs improvement (&lt;80%)
        </Typography>
      </Box> */}

      {/* Billable Details Modal */}
      <BillableDetailsModal
        open={billableModalOpen}
        onClose={handleCloseBillableModal}
        employee={selectedEmployee}
        startDate={startDate}
        endDate={endDate}
      />

      {/* Closure Cases Modal */}
      <ClosureCasesModal
        open={closureModalOpen}
        onClose={handleCloseClosureModal}
        employee={selectedEmployeeForClosure}
        startDate={startDate}
        endDate={endDate}
      />

      {/* New Client Cases Modal (by practice area) */}
      <NewClientCasesModal
        open={newClientModalOpen}
        onClose={handleCloseNewClientModal}
        practiceArea={selectedPracticeAreaForNewClient}
        startDate={startDate}
        endDate={endDate}
        caseStatus={newClientCaseStatus}
      />
    </Box>
  );
};

export default EmployeesMilestones;

