import { useEffect } from "react";

const useSessionTimeoutSaveNote = ({
  subject,
  note,
  selectedCase,
  type = "add",
  date,
  noteId,
}) => {
  const storageKey = type === "edit" ? "autosave_edit_note" : "autosave_add_note";

  const handleTimeoutWarning = () => {
    const dataToSave = {
      subject,
      note,
      case_id: selectedCase,
    };

    if (type === "edit") {
      dataToSave.date = date;
      dataToSave.note_id = noteId;
    }

    if (subject?.trim() || note?.trim()) {
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      console.log(`[SessionTimeout] Saved ${storageKey}`);
    }
  };

  useEffect(() => {
    window.addEventListener("session-timeout-warning", handleTimeoutWarning);
    return () => {
      window.removeEventListener("session-timeout-warning", handleTimeoutWarning);
    };
  }, [subject, note, selectedCase, date, noteId, type]);
};

export default useSessionTimeoutSaveNote;
