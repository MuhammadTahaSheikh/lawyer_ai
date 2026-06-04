import React,{useEffect} from 'react'
import {
  Table,
  Sheet,
  Typography,
  Button,
  Input,
  Select,
  Option,
  Stack,
  Modal,
  ModalDialog,
  ModalClose,
  Box,
  IconButton,
  Checkbox,
} from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import { auth } from "../firebase/firebase";
const EditPermissionsModal = ({editModalOpen,setEditModalOpen,practiceAreas,selectedStaff,setSelectedStaff,caseSearch,setCaseSearch,cases,totalCases,fetchCases,loadingCases,casePage,handleSavePermissions,setCasePage,setCases,onPermissionsSaved}) => {
  useEffect(() => {
  const delayDebounce = setTimeout(() => {
    setCases([]);         // Clear existing results
    setCasePage(1);       // Reset to page 1
    fetchCases(1, caseSearch);
  }, 500);

  return () => clearTimeout(delayDebounce);
}, [caseSearch]);
const allVisibleSelected = cases.every(c => selectedStaff?.case_ids?.includes(c.case_id));
const allPracticeAreaLabels = (practiceAreas || []).map((area) => area.label);
const selectedPracticeAreas = selectedStaff?.practice_area || [];
const allPracticeAreasSelected =
  allPracticeAreaLabels.length > 0 &&
  allPracticeAreaLabels.every((label) => selectedPracticeAreas.includes(label));
const somePracticeAreasSelected =
  selectedPracticeAreas.length > 0 && !allPracticeAreasSelected;

const savePermissions = async () => {
  try {
    const case_ids = selectedStaff?.case_ids || [];
const practice_areas = selectedStaff?.practice_area || [];
const allPracticeAreasChosen =
  allPracticeAreaLabels.length > 0 &&
  allPracticeAreaLabels.every((label) => practice_areas.includes(label));

const payloadCaseIds = allPracticeAreasChosen ? [] : case_ids;
const payloadPracticeAreas = allPracticeAreasChosen ? [] : practice_areas;

const access_all_cases =
  allPracticeAreasChosen || (case_ids?.length === 0 && practice_areas?.length === 0) ? 1 : 0;
    const res = await axios.post("/api/update-permissions", {
      uid: selectedStaff.uid,
  case_ids: payloadCaseIds,
  practice_areas: payloadPracticeAreas,
  access_all_cases,
    });
    console.log("Saved:", res.data);
    if (typeof onPermissionsSaved === "function") {
      onPermissionsSaved(selectedStaff.uid, payloadCaseIds, payloadPracticeAreas);
    }
    setEditModalOpen(false);
  } catch (error) {
    console.error("Error saving permissions", error);
  }
};



    return (
    <div>

        <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} sx={{ display: "flex", justifyContent: "center", alignItems: "center",p: 1, }}>
<ModalDialog
  sx={{
    width: "95%",
    maxWidth: "1000px",
    maxHeight: "95vh",
        height: { xs: "95vh", md: "auto" },

    overflow: "auto",        // Enables scrolling inside the modal
    p: 0,
    borderRadius: "lg",      // Smooth corner rounding
    boxShadow: "lg",         // Add light shadow
  }}
>
 <Box
  sx={{
    display: "flex",
    flexDirection: { xs: "column", md: "row" },
    width: "100%",
    height: "100%",
    overflow: "auto", // Important for vertical scroll on small screens
  }}
>


      
      {/* Left Table: Practice Areas */}
      <Box sx={{ width: "60%", borderRight: "1px solid #ccc", p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography level="title-sm">Practice Areas</Typography>
          <Checkbox
            label={allPracticeAreasSelected ? "Unselect All" : "Select All"}
            checked={allPracticeAreasSelected}
            indeterminate={somePracticeAreasSelected}
            onChange={(e) => {
              setSelectedStaff((prev) => ({
                ...prev,
                practice_area: e.target.checked ? allPracticeAreaLabels : [],
              }));
            }}
          />
        </Box>
        <Table sx={{ minWidth: 500, fontSize: 14 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Practice Area</th>
              <th style={{ textAlign: "right" }}>Active Cases</th>
              {/* <th></th> */}
            </tr>
          </thead>
        <tbody>
          
{[...practiceAreas]
  .sort((a, b) => {
    const selected = selectedStaff?.practice_area || [];
    const aSelected = selected.includes(a.label);
    const bSelected = selected.includes(b.label);
    return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
  })
  .map((item, index) => (
  <tr key={index}>
    <td>{item.label}</td>
    <td style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent:"end" }}>
      {item.count}
      <Checkbox
  checked={
    Array.isArray(selectedStaff?.practice_area) &&
    selectedStaff?.practice_area.includes(item?.label)
  }
  onChange={(e) => {
    const updated = e.target.checked
      ? [...(selectedStaff?.practice_area || []), item?.label]
      : (selectedStaff?.practice_area || []).filter(label => label !== item?.label);

    setSelectedStaff(prev => ({
      ...prev,
      practice_area: updated,
    }));
  }}
  sx={{
    p: 0,
    minWidth: 0,
    boxShadow: 'none',
    backgroundColor: 'transparent',
    '&:hover': { backgroundColor: 'transparent' },
  }}
/>
    </td>
    {/* <td></td> */}
  </tr>
))}


</tbody>


        </Table>
      </Box>

      {/* Right Panel */}
      <Box
  sx={{
    width: { xs: "100%", md: "40%" },
    p: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }}
>
  
{/* <Checkbox
  label="Select All Cases"
  checked={allVisibleSelected}
  indeterminate={
    selectedStaff?.case_ids?.length > 0 && !allVisibleSelected
  }
  onChange={(e) => {
    if (e.target.checked) {
      // Add all visible cases
      const allIds = [...new Set([...(selectedStaff.case_ids || []), ...cases.map(c => c.case_id)])];
      setSelectedStaff(prev => ({
        ...prev,
        case_ids: allIds,
      }));
    } else {
      // Remove only the visible ones (not all, if some are still to be fetched)
      const remaining = (selectedStaff.case_ids || []).filter(id => !cases.map(c => c.case_id).includes(id));
      setSelectedStaff(prev => ({
        ...prev,
        case_ids: remaining,
      }));
    }
  }}
  sx={{ mb: 1 }}
/> */}



 <Input
  placeholder="SEARCH FOR CASES"
  value={caseSearch}
  onChange={(e) => setCaseSearch(e.target.value)}
  sx={{
    width: "100%",
    borderRadius: "md",
    fontWeight: "md",
    px: 2,
    py: 1,
    bgcolor: "#fff",
    border: "1px solid #ccc",
    boxShadow: "xs",
  }}
/>



  <Box sx={{ mt: 2,  overflowY: "auto" }}>
{[...new Map(
  [
    ...(selectedStaff?.selectedCaseObjects || []), // selected cases from all pages
    ...cases, // currently loaded paginated cases
  ].map(caseItem => [caseItem.case_id, caseItem]) // deduplicate by case_id
).values()]
  .sort((a, b) => {
    const selected = selectedStaff?.case_ids || [];
    const aSelected = selected.includes(a.case_id);
    const bSelected = selected.includes(b.case_id);
    return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
  })
  .map((caseItem) => (      <Box
  key={caseItem.case_id}
  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #eee",
    py: 1,
    gap: 1,
  }}
>
  <Typography
    level="body1"
    sx={{
      flex: 1,
      whiteSpace: "normal",
wordBreak: "break-word",

    }}
    title={caseItem.name} // Tooltip for full text on hover
  >
    {caseItem.name}
  </Typography>
<Checkbox
  disabled={false} // Or remove the `disabled` entirely

  checked={
    Array.isArray(selectedStaff?.case_ids) &&
    selectedStaff?.case_ids?.includes(caseItem?.case_id)
  }
  onChange={(e) => {
    const updatedCaseIds = e.target.checked
      ? [...(selectedStaff?.case_ids || []), caseItem?.case_id]
      : (selectedStaff?.case_ids || []).filter((id) => id !== caseItem?.case_id);

    setSelectedStaff((prev) => ({
      ...prev,
      case_ids: updatedCaseIds,
    }));
  }}
/>

</Box>

    ))}
  </Box>

  {cases.length < totalCases && (
    <Button
      fullWidth
      onClick={() => fetchCases(casePage + 1, caseSearch)}
      disabled={loadingCases}
      sx={{ mt: 2 }}
    >
      {loadingCases ? "Loading..." : "Show More"}
    </Button>
  )}
  <Button
  fullWidth
  color="success"
  variant="solid"
  sx={{ mt: 1 }}
  onClick={() => {
  savePermissions();
    // TODO: Save logic (e.g., send updated selectedStaff data to backend)
    console.log("Save clicked", selectedStaff);
  }}
>
  Save
</Button>

</Box>

    </Box>
  </ModalDialog>
</Modal>
    </div>
  )
}

export default EditPermissionsModal