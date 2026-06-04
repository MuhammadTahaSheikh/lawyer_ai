import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Drawer from "@mui/joy/Drawer";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import IconButton from "@mui/joy/IconButton";
import Button from "@mui/joy/Button";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Textarea from "@mui/joy/Textarea";
import Stack from "@mui/joy/Stack";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";

import TimerIcon from "@mui/icons-material/Timer";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { Autocomplete, FormControl, FormLabel, TextField } from "@mui/joy";
import axios from "axios";
import AddTimeEntryModal from "./AddTimeEntryModal";

function TimerSidebar({
  open,
  onClose,
  time,
  setTime,
  isRunning,
  setIsRunning,
}) {
  // const [time, setTime] = useState(0);
  // const [isRunning, setIsRunning] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cases, setCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCase, setSelectedCase] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  let selectedCaseValue = { name: "test", case_id: selectedCase };

  // Timer logic
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);
  useEffect(() => {
    if (open) {
      // setTime(0);
      // setIsRunning(false);  // Start paused when sidebar opens
    }
  }, [open]);
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const mins = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };
  const calculateDecimalTime = (totalSeconds) => {
    const minutes = totalSeconds / 60; // Convert to minutes
    const decimalTime = Math.ceil(minutes / 6) * 0.1; // Every 6 minutes is 0.1
    return decimalTime.toFixed(1); // To keep format like 0.1, 0.2, ...
  };
  const decimalTime = calculateDecimalTime(time);
  const [isTyping, setIsTyping] = useState(false);

  // Initial cases list — cached 2 min; only refetched when search term changes (debounced)
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    if (!isTyping) return;
    const h = setTimeout(() => { setDebouncedSearch(searchTerm); setIsTyping(false); }, 500);
    return () => clearTimeout(h);
  }, [searchTerm, isTyping]);

  const { data: _casesData } = useQuery({
    queryKey: ['timerCases', debouncedSearch],
    queryFn: async ({ signal }) => {
      const res = await axios.get(`/cases?search=${encodeURIComponent(debouncedSearch)}`, { signal });
      return res?.data?.cases || [];
    },
    staleTime: 2 * 60_000,
  });
  useEffect(() => { if (_casesData) setCases(_casesData); }, [_casesData]);

  // Pause/Play toggle
  const handlePausePlay = () => setIsRunning(!isRunning);

  // Handle Save
  const handleSave = () => {
    console.log({
      time: decimalTime, // Use calculated decimal time
      task: selectedTask,
      description,
    });

    // Save can trigger some backend logic, but DO NOT close sidebar here.
    setModalOpen(true);
  };

  // Reset Timer & Fields (only when confirmed in modal)
  const resetTimerAndClose = () => {
    setTime(0);
    setShowDeleteConfirm(false);
    setIsRunning(false); // pause when resetting
    onClose();
    setSelectedCase("");
    setDescription("");
  };
  const handleModalSuccess = () => {
    setModalOpen(false);
    resetTimerAndClose(); // This already does the reset logic
  };

  return (
    <>
      {/* Main Drawer */}
      <Drawer anchor="right" open={open} onClose={() => {}}>
        <Box sx={{ width: 300, p: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography level="title-md">Timer</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>

          {/* Timer Row */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 2, mb: 2 }}
          >
            <Typography level="h2">{formatTime(time)}</Typography>
            <Stack direction="row" spacing={1}>
              <IconButton onClick={handlePausePlay}>
                {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              {!isRunning && (
                <>
                  <IconButton
                    color="danger"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton color="success" onClick={handleSave}>
                    <SaveIcon />
                  </IconButton>
                </>
              )}
            </Stack>
          </Stack>

          {/* Case Selection */}
          <FormControl fullWidth>
            <FormLabel>Case</FormLabel>
            <Autocomplete
              fullWidth
              options={cases.filter((caseItem) =>
                (caseItem.name || "").toLowerCase().includes(searchTerm.toLowerCase())
              )}
              getOptionLabel={(option) => option.name || ""}
              value={cases.find((c) => c.case_id === selectedCase) || null}
              onChange={(e, value) => {
                setSelectedCase(value?.case_id || "");
                setSearchTerm(value?.name || ""); // Set searchTerm to selected case name
                setIsTyping(false); // Selection is not typing
              }}
              inputValue={searchTerm}
              onInputChange={(e, newInputValue) => {
                setSearchTerm(newInputValue);
                setIsTyping(true); // Typing detected
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search case..."
                  placeholder="Type to search"
                />
              )}
            />
          </FormControl>

          {/* Description */}
          <Typography level="body-sm">Description</Typography>
          <Textarea
            minRows={3}
            placeholder="Add description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Box>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      >
        <ModalDialog>
          <Typography level="title-lg">Confirm Delete</Typography>
          <Typography level="body-md">
            Are you sure you want to reset and close the timer?
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="flex-end"
            sx={{ mt: 2 }}
          >
            <Button onClick={() => setShowDeleteConfirm(false)}>No</Button>
            <Button color="danger" onClick={resetTimerAndClose}>
              Yes
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>
      <AddTimeEntryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        singleCase={selectedCaseValue}
        onSuccessModal={handleModalSuccess}
        cases={cases}
        initialDescription={description}
        initialDuration={decimalTime}
      />
    </>
  );
}

export default TimerSidebar;
