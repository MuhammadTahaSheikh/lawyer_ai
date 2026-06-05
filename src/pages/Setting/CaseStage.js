import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, ModalDialog, Typography, Button, Input } from '@mui/joy';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import SortableItem from './SortableItem';
import "./CaseStage.css";

const CaseStagesComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [stages, setStages] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newStageName, setNewStageName] = useState('');

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const response = await axios.get('/case_stages');
      // Assume backend sorts by stage_order
      setStages(response.data);
    } catch (error) {
      console.error('Error fetching stages:', error);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchStages();
  };

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      // Send updated stages (which include stage_order) to the backend
      await axios.put('/case_stages', stages);
      setIsEditing(false);
      fetchStages();
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageChange = (id, newValue) => {
    setStages(
      stages.map(stage =>
        stage.case_stage_id === id ? { ...stage, case_stage_name: newValue } : stage
      )
    );
  };

  const handleDeleteStage = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this stage?");
    if (isConfirmed) {
      try {
        await axios.delete(`/case_stages/${id}`);
        fetchStages();
      } catch (error) {
        console.error("Error deleting stage:", error);
      }
    }
  };

  const handleModalAddStage = async () => {
    try {
      const newStage = { name: newStageName };
      const response = await axios.post('/case_stages', newStage);
      const updatedStages = [...stages, response.data];
      setStages(updatedStages);
      setNewStageName('');
      setOpenModal(false);
    } catch (error) {
      console.error('Error adding new stage:', error);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = stages.findIndex(stage => `${stage.case_stage_id}` === active.id);
    const newIndex = stages.findIndex(stage => `${stage.case_stage_id}` === over.id);
    const newStages = arrayMove(stages, oldIndex, newIndex);
    // Update stage_order for each stage based on its new position
    const updatedStages = newStages.map((stage, index) => ({
      ...stage,
      stage_order: index,
    }));
    setStages(updatedStages);
  };

  return (
    <div className="case-stages-component">
      <div className="header" style={{ textAlign: 'left' }}>
        {/* <h2 style={{color:"#fff", fontSize: window.innerWidth < 600 ? '1.25rem' : '1.5rem'}}>Case Stages</h2> */}
      </div>
      <div style={{ 
        padding: window.innerWidth < 600 ? "15px" : "25px", 
        border: "1px solid #ddd", 
        boxShadow: "0 .125rem .25rem rgba(0, 0, 0, .075)", 
        backgroundClip:"border-box",  
        background:"#fff", 
        borderRadius: window.innerWidth < 600 ? "15px" : "25px" 
      }}>
        <p style={{ fontSize: window.innerWidth < 600 ? '0.875rem' : '1rem' }}>
          Manage your case stages. Click Edit Stages to create or reorder stages.
        </p>
        <div 
          className="button-group" 
          style={{ 
            display: 'flex', 
            justifyContent: window.innerWidth < 600 ? 'center' : 'end', 
            marginBottom: '16px', 
            gap: window.innerWidth < 600 ? '0.5rem' : '1rem',
            flexWrap: 'wrap',
          }}
        >
          {isEditing ? (
            <>
              <button 
                onClick={handleCancel} 
                className='cancel_stages_case_stage'
                style={{ fontSize: window.innerWidth < 600 ? '0.75rem' : '1rem', padding: window.innerWidth < 600 ? '6px 12px' : '8px 16px' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => setOpenModal(true)} 
                className='addnew_stages_case_stage'
                style={{ fontSize: window.innerWidth < 600 ? '0.75rem' : '1rem', padding: window.innerWidth < 600 ? '6px 12px' : '8px 16px' }}
              >
                Add New Stage
              </button>
              <button 
                onClick={handleSaveChanges} 
                className='save_stages_case_stage' 
                disabled={isLoading}
                style={{ fontSize: window.innerWidth < 600 ? '0.75rem' : '1rem', padding: window.innerWidth < 600 ? '6px 12px' : '8px 16px' }}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleEditClick} 
                className='edit_stages_case_stage'
                style={{ fontSize: window.innerWidth < 600 ? '0.75rem' : '1rem', padding: window.innerWidth < 600 ? '6px 12px' : '8px 16px' }}
              >
                Edit Stages
              </button>
              <button 
                className='tellUs_stages_case_stage'
                style={{ fontSize: window.innerWidth < 600 ? '0.75rem' : '1rem', padding: window.innerWidth < 600 ? '6px 12px' : '8px 16px' }}
              >
                Tell us what you think
              </button>
            </>
          )}
        </div>

        {isEditing ? (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={stages.map(stage => `${stage.case_stage_id}`)} strategy={verticalListSortingStrategy}>
              <div className="stages-list">
                {stages.map(stage => (
                  <SortableItem 
                    key={stage.case_stage_id}
                    id={`${stage.case_stage_id}`}
                    stage={stage}
                    handleStageChange={handleStageChange}
                    handleDeleteStage={handleDeleteStage}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="stages-list">
            {stages.map(stage => (
              <div 
                key={stage.case_stage_id} 
                className="stage-item" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  background: '#f7f7f9',
                  border: '1px solid #f7f7f9',
                  margin: '0.5rem 0',
                  padding: window.innerWidth < 600 ? '0.75rem 0.5rem' : '0.5rem',
                  boxSizing: 'border-box',
                  flexDirection: window.innerWidth < 600 ? 'column' : 'row',
                  gap: window.innerWidth < 600 ? '0.5rem' : '0',
                }}
              >
                <span style={{ 
                  margin: window.innerWidth < 600 ? '0' : '0px 2rem', 
                  width: window.innerWidth < 600 ? '100%' : '50px', 
                  textAlign: window.innerWidth < 600 ? 'center' : 'left',
                  fontSize: window.innerWidth < 600 ? '0.875rem' : '1rem',
                }}>
                  {stage.case_stage_id}.
                </span>
                <span style={{ 
                  marginLeft: window.innerWidth < 600 ? '0' : '5rem', 
                  flex: '1', 
                  textAlign: window.innerWidth < 600 ? 'center' : 'left',
                  fontSize: window.innerWidth < 600 ? '0.875rem' : '1rem',
                }}>
                  {stage.case_stage_name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 1, md: 0 } }}
      >
        <ModalDialog 
          aria-labelledby="add-new-stage-title" 
          aria-describedby="add-new-stage-description" 
          sx={{ width: { xs: '90%', sm: 400 }, maxWidth: '90vw' }}
        >
          <Typography id="add-new-stage-title" component="h2" sx={{ fontSize: { xs: '1.125rem', md: '1.25rem' } }}>
            Add New Stage
          </Typography>
          <Input 
            placeholder="Stage Name"
            value={newStageName}
            onChange={(e) => setNewStageName(e.target.value)}
            fullWidth
            sx={{ mt: 2, fontSize: { xs: '0.875rem', md: '1rem' } }}
          />
          <Button 
            onClick={handleModalAddStage} 
            sx={{ mt: 2, fontSize: { xs: '0.875rem', md: '1rem' } }}
          >
            Submit
          </Button>
          <Button 
            onClick={() => { setOpenModal(false); setNewStageName(''); }} 
            sx={{ mt: 1, fontSize: { xs: '0.875rem', md: '1rem' } }}
          >
            Cancel
          </Button>
        </ModalDialog>
      </Modal>
    </div>
  );
};

export default CaseStagesComponent;
