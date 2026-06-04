import React, { useState, useEffect } from 'react'; 
import { Modal, ModalDialog, IconButton, Typography, Button, Input, Select, Option, Checkbox } from '@mui/joy';
import AddEventForm from './AddEventForm';
import TaskModal from './taskModal';

// Helper function to format date as YYYY-MM-DD for input[type="date"]
const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// List of US federal holidays (simplified)
const federalHolidays = [
  '01-01', // New Year's Day
  '01-15', // MLK Day (3rd Monday, simplified)
  '02-19', // Presidents Day (3rd Monday, simplified)
  '05-27', // Memorial Day (last Monday, simplified)
  '06-19', // Juneteenth
  '07-04', // Independence Day
  '09-02', // Labor Day (1st Monday, simplified)
  '10-14', // Columbus Day (2nd Monday, simplified)
  '11-11', // Veterans Day
  '11-28', // Thanksgiving (4th Thursday, simplified)
  '12-25', // Christmas Day
];

// Function to check if a date is a weekend
const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

// Function to check if a date is a holiday
const isHoliday = (date, includeHolidays) => {
  if (!includeHolidays) return false;
  const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return federalHolidays.includes(monthDay);
};

// Function to add business days
const addBusinessDays = (startDate, daysToAdd, includeHolidays) => {
  let result = new Date(startDate);
  let daysRemaining = Math.abs(daysToAdd);
  const direction = daysToAdd >= 0 ? 1 : -1;

  while (daysRemaining > 0) {
    result.setDate(result.getDate() + direction);
    if (!isWeekend(result) && !isHoliday(result, includeHolidays)) {
      daysRemaining--;
    }
  }

  return result;
};


// Function to add calendar days
const addCalendarDays = (startDate, daysToAdd) => {
  const result = new Date(startDate);
  result.setDate(result.getDate() + daysToAdd);
  return result;
};

export default function DateCalculatorModal({ open, onClose }) {
  const today = new Date();
  const [date, setDate] = useState(formatDateForInput(today));
  const [daysToAdd, setDaysToAdd] = useState(7);
  const [dayType, setDayType] = useState('calendar days');
  const [includeHolidays, setIncludeHolidays] = useState(false);
  const [resultDate, setResultDate] = useState(null);
  const [isAddEventFormOpen, setIsAddEventFormOpen] = useState(false);
  const [isAddTaskFormOpen, setIsAddTaskFormOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(true);

  useEffect(() => {
    const startDate = new Date(date);
    const calculatedDate = addCalendarDays(startDate, isAdding ? daysToAdd : -daysToAdd);
    setResultDate(calculatedDate);
  }, [date, daysToAdd, isAdding]);

  const toggleAddSubtract = () => {
    setIsAdding(!isAdding);
  };
  useEffect(() => {
    if (date) {
      const startDate = new Date(date);
      let calculatedDate;
  
      if (dayType === 'business days') {
        calculatedDate = addBusinessDays(startDate, isAdding ? parseInt(daysToAdd) : -parseInt(daysToAdd), includeHolidays);
      } else {
        calculatedDate = addCalendarDays(startDate, isAdding ? parseInt(daysToAdd) : -parseInt(daysToAdd));
      }
  
      setResultDate(calculatedDate);
    }
  }, [date, daysToAdd, dayType, includeHolidays, isAdding]);
  
  const handleOpenAddEventForm = () => {
    setIsAddEventFormOpen(true);
  };

  const handleCloseAddEventForm = () => {
    setIsAddEventFormOpen(false);
  };
  const handleOpenAddTaskForm = () => {
    setIsAddTaskFormOpen(true);
};

const handleCloseAddTaskForm = () => {
    setIsAddTaskFormOpen(false);
};
  return (
    <>
    
      <Modal open={open} onClose={onClose}>
        <ModalDialog>
          <Typography level="h6">Date Calculator</Typography>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
             <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <Input type="number" value={daysToAdd}   onChange={(e) => {
    const value = parseInt(e.target.value, 10);
    setDaysToAdd(isNaN(value) || value < 0 ? 0 : value); // Always stay >= 0
  }} sx={{ width: '60px' }} min={0} />
          <Button 
  sx={{
    border: '1px solid', // Add border
    borderColor: 'neutral.500', // Border color (adjust as needed)
    '&:hover': {
      backgroundColor: 'grey', // Blue background on hover
      color: 'white' // Optional: change text color on hover
    }
  }} 
  variant="plain" 
  onClick={toggleAddSubtract}
>
  {isAdding ? '+' : '-'}
</Button>        </div>
            {/* <Input 
              type="number" 
              value={daysToAdd} 
              onChange={(e) => setDaysToAdd(e.target.value)} 
              sx={{ width: '60px' }} 
            /> */}
            <Select 
              value={dayType} 
              onChange={(e, newValue) => setDayType(newValue)}
            >
              <Option value="calendar days">calendar days</Option>
              <Option value="business days">business days</Option>
            </Select>
          </div>
          {/* Only show holiday checkbox when business days is selected */}
         
            <Checkbox
              label="Include federal US holidays in the date calculation."
              checked={includeHolidays}
              onChange={(e) => setIncludeHolidays(e.target.checked)}
              sx={{ marginTop: '10px' }}
            />
        
          {resultDate && (
            <div style={{ marginTop: '20px' }}>
              {/* <Typography level="body1" sx={{ marginBottom: '10px' }}>
                Result: {resultDate.toDateString()}
              </Typography> */}
              <Button variant="plain" sx={{ marginRight: '10px' }}
         onClick={handleOpenAddEventForm}
      >
                Create event for {resultDate.toDateString()}
              </Button>
              <Button variant="plain" onClick={handleOpenAddTaskForm}>
                Create task due on {resultDate.toDateString()}
              </Button>
            </div>
          )}
        </ModalDialog>
      </Modal>
      <Modal open={isAddEventFormOpen} onClose={handleCloseAddEventForm}>
        <ModalDialog>
          <AddEventForm date={resultDate} onClose={handleCloseAddEventForm} />
        </ModalDialog>
      </Modal>

      <Modal open={isAddTaskFormOpen} onClose={handleCloseAddTaskForm}>
    <ModalDialog>
        <TaskModal 
            open={isAddTaskFormOpen}  // Pass the open state
            onClose={handleCloseAddTaskForm}
            date={resultDate ? new Date(formatDateForInput(resultDate)).toLocaleDateString("en-CA") : ''}  // Format the date here
            // date={task?.due_date ? new Date(task?.due_date).toLocaleDateString("en-CA") : ""}

            // Provide default values for other required props
            // task={{}}
            // setTask={() => {}}
            onSave={() => {}}
            // isEditing={false}
        />
    </ModalDialog>
</Modal>
    </>
  );
}