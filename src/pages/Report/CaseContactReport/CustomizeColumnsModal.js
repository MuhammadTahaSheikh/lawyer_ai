// components/CustomizeColumnsModal.jsx
import React from "react";
import {
  Modal, Sheet, Typography, Box, List, ListItem, Checkbox, Button, ListItemDecorator
} from "@mui/joy";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Switch } from "@mui/joy";

const CustomizeColumnsModal = ({
  open,
  onClose,
  availableColumns,
  selectedColumns,
  onToggleColumn,
  onReorderColumns,
  customFields 
}) => {
  // Derive allCustomFieldsChecked from selectedColumns to keep it in sync
  const selectedColumnsSet = React.useMemo(() => new Set(selectedColumns), [selectedColumns]);

  const customFieldNames = React.useMemo(() => 
    customFields.map(f => f.custom_fields_name), 
    [customFields]
  );
  const customFieldNameSet = React.useMemo(() => new Set(customFieldNames), [customFieldNames]);
  
  const allCustomFieldsChecked = React.useMemo(() => {
    if (customFieldNames.length === 0) return false;
    return customFieldNames.every(name => selectedColumnsSet.has(name));
  }, [customFieldNames, selectedColumnsSet]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const updated = [...selectedColumns];
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    onReorderColumns(updated);
  };
const handleToggleAllCustomFields = (checked) => {
  const updated = checked
    ? Array.from(new Set([...selectedColumns, ...customFieldNames]))
    : selectedColumns.filter(col => !customFieldNameSet.has(col));
  onReorderColumns(updated); // Preserves order with added/removed fields
};

const handleUncheckAll = () => {
  onReorderColumns([]);
};

  return (
   <Modal open={open} onClose={onClose}>
  <Sheet sx={{ 
    width: { xs: '90vw', sm: '700px' }, 
    maxWidth: '100%',
    mx: "auto", 
    my: "5vh",
    maxHeight: '90vh',
    overflow: 'auto',
    p: 3, 
    borderRadius: "md", 
    boxShadow: "lg" 
  }}>
    <Typography level="h4" mb={2}>Customize Report Columns</Typography>
    <Box 
      display="flex" 
      flexDirection={{ xs: 'column', sm: 'row' }}
      gap={3}
      sx={{ overflow: 'hidden' }}
    >
      <Box flex={1} sx={{ overflow: 'auto', maxHeight: '60vh' }}>
      <Typography level="body1">Available Fields</Typography>
<List>
  {availableColumns
    .filter(col => !customFieldNameSet.has(col))
    .map(col => (
      <ListItem key={col}>
        <Checkbox
          checked={selectedColumnsSet.has(col)}
          onChange={() => onToggleColumn(col)}
          label={col}
        />
      </ListItem>
    ))}

<Box mt={2} mb={1} display="flex" justifyContent="space-between" alignItems="center">
  <Typography level="body2" fontWeight="lg">Custom Fields</Typography>
  <Switch
  checked={allCustomFieldsChecked}
  onChange={(e) => handleToggleAllCustomFields(e.target.checked)}
  endDecorator={allCustomFieldsChecked ? "On" : "Off"}
  color="primary"
/>

</Box>
  {[...customFields]
  .sort((a, b) => a.custom_fields_name.localeCompare(b.custom_fields_name))
  .map(f => (
    <ListItem key={f.custom_fields_name}>
      <Checkbox
        checked={selectedColumnsSet.has(f.custom_fields_name)}
        onChange={() => onToggleColumn(f.custom_fields_name)}
        label={f.custom_fields_name
          .replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())}
      />
    </ListItem>
))}

</List>

      </Box>
      
      <Box flex={1} sx={{ overflow: 'auto', maxHeight: '60vh' }}>
        <Typography fontWeight="lg">Selected Columns</Typography>
        <Typography level="body2">Drag to reorder</Typography>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="columns">
            {(provided) => (
              <List 
                ref={provided.innerRef} 
                {...provided.droppableProps}
                sx={{ overflow: 'auto' }}
              >
                {selectedColumns.map((col, index) => (
                  <Draggable key={col} draggableId={col} index={index}>
                    {(provided) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <ListItemDecorator>≡</ListItemDecorator>
                        {col}
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
    </Box>
    <Box display="flex" justifyContent="flex-end" mt={3} gap={1}>
      <Button variant="outlined" color="neutral" onClick={handleUncheckAll}>Uncheck All</Button>
      <Button variant="plain" onClick={onClose}>Cancel</Button>
      <Button onClick={onClose}>Update Report</Button>
    </Box>
  </Sheet>
</Modal>
  );
};

export default CustomizeColumnsModal;
