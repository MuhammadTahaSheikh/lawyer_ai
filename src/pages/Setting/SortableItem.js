import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const SortableItem = ({ id, stage, handleStageChange, handleDeleteStage }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    background: '#f7f7f9',
    border: '1px solid #f7f7f9',
    margin: '0.5rem 0',
    padding: '0.5rem',
    boxSizing: 'border-box'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div {...listeners} style={{ display: 'flex', alignItems: 'center', marginRight: '8px', cursor: 'grab' }}>
        <DragIndicatorIcon />
      </div>
      <input 
        type="text" 
        value={stage.case_stage_name}
        onChange={(e) => handleStageChange(stage.case_stage_id, e.target.value)}
        style={{ flexGrow: 1, marginRight: '8px' }}
      />
      <button onClick={() => handleDeleteStage(stage.case_stage_id)}>Delete</button>
    </div>
  );
};

export default SortableItem;
