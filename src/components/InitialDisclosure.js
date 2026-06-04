import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Input, Textarea, Button, FormControl, FormLabel, IconButton } from '@mui/joy';
import { Add, Delete } from '@mui/icons-material';
import { auth } from "../firebase/firebase";

const DEFAULT_COMPANY_DESC = 'Knowledge of claim, knowledge of mitigation services performed at the subject property, prepared and/or have knowledge of a report';

const InitialDisclosure = ({ caseId }) => {
  const [initialDisclosureData, setInitialDisclosureData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const currentUserUid = auth.currentUser?.uid;

  useEffect(() => {
    if (caseId) {
      fetchInitialDisclosureData();
    }
  }, [caseId]);

  const fetchInitialDisclosureData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/initial-disclosures', {
        params: { case_id: caseId }
      });
      if (response.data.success) {
        const data = response.data.data || {};
        // Ensure restoration_companies is an array
        if (data.restoration_companies && !Array.isArray(data.restoration_companies)) {
          try {
            data.restoration_companies = typeof data.restoration_companies === 'string' 
              ? JSON.parse(data.restoration_companies) 
              : [];
          } catch (e) {
            data.restoration_companies = [];
          }
        } else if (!data.restoration_companies) {
          data.restoration_companies = [];
        }
        setInitialDisclosureData(data);
      } else {
        setError(response.data.message || 'Failed to fetch initial disclosure data');
      }
    } catch (err) {
      console.error('Fetch initial disclosure data failed', err);
      setError('Failed to fetch initial disclosure data');
      // Initialize with empty object if no data exists
      setInitialDisclosureData({ restoration_companies: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate that at least one field is filled
    if (!hasAtLeastOneFieldFilled()) {
      setError('Please fill at least one field before saving.');
      alert('Please fill at least one field before saving.');
      return;
    }

    // Ensure default description is persisted even if user made no manual edits
    const normalizedCompanies = (initialDisclosureData?.restoration_companies || []).map((c) => ({
      ...c,
      type: (c.type && c.type.trim().length > 0) ? c.type : DEFAULT_COMPANY_DESC,
    }));

    const payload = {
      case_id: caseId,
      ...initialDisclosureData,
      restoration_companies: normalizedCompanies,
      uid: currentUserUid
    };
    
    // 🔍 DETAILED DEBUG LOGGING
    console.log('═══════════════════════════════════════════');
    console.log('🐛 FRONTEND DEBUG - Sending Payload');
    console.log('═══════════════════════════════════════════');
    console.log('📤 Full initialDisclosureData state:', initialDisclosureData);
    console.log('\n📝 Description Fields in State:');
    console.log('  public_adjuster_description:', initialDisclosureData?.public_adjuster_description);
    console.log('  loss_consultant_description:', initialDisclosureData?.loss_consultant_description);
    console.log('  estimator_description:', initialDisclosureData?.estimator_description);
    console.log('  engineer_description:', initialDisclosureData?.engineer_description);
    console.log('  corporate_representative_description:', initialDisclosureData?.corporate_representative_description);
    console.log('  field_adjuster_description:', initialDisclosureData?.field_adjuster_description);
    
    console.log('\n📦 Final Payload:');
    console.log('  public_adjuster_description:', payload.public_adjuster_description);
    console.log('  loss_consultant_description:', payload.loss_consultant_description);
    console.log('  estimator_description:', payload.estimator_description);
    console.log('  engineer_description:', payload.engineer_description);
    console.log('  corporate_representative_description:', payload.corporate_representative_description);
    console.log('  field_adjuster_description:', payload.field_adjuster_description);
    
    console.log('\n🔢 Description Field Lengths:');
    console.log('  public_adjuster_description:', payload.public_adjuster_description?.length || 0);
    console.log('  loss_consultant_description:', payload.loss_consultant_description?.length || 0);
    console.log('  estimator_description:', payload.estimator_description?.length || 0);
    console.log('  engineer_description:', payload.engineer_description?.length || 0);
    console.log('  corporate_representative_description:', payload.corporate_representative_description?.length || 0);
    console.log('  field_adjuster_description:', payload.field_adjuster_description?.length || 0);
    console.log('═══════════════════════════════════════════\n');

    setSaving(true);
    setError(null);
    try {
      const response = await axios.post('/initial-disclosures', payload);
      
      console.log('═══════════════════════════════════════════');
      console.log('🐛 FRONTEND DEBUG - Response Received');
      console.log('═══════════════════════════════════════════');
      console.log('📥 Response data:', response.data);
      
      if (response.data.success && response.data.data) {
        console.log('\n📝 Description Fields in Response:');
        console.log('  public_adjuster_description:', response.data.data.public_adjuster_description);
        console.log('  loss_consultant_description:', response.data.data.loss_consultant_description);
        console.log('  estimator_description:', response.data.data.estimator_description);
        console.log('  engineer_description:', response.data.data.engineer_description);
        console.log('  corporate_representative_description:', response.data.data.corporate_representative_description);
        console.log('  field_adjuster_description:', response.data.data.field_adjuster_description);
      }
      console.log('═══════════════════════════════════════════\n');
      
      if (response.data.success) {
        alert('Initial Disclosure saved successfully');
        if (response.data.data) {
          const data = response.data.data;
          // Ensure restoration_companies is an array
          if (data.restoration_companies && !Array.isArray(data.restoration_companies)) {
            try {
              data.restoration_companies = typeof data.restoration_companies === 'string' 
                ? JSON.parse(data.restoration_companies) 
                : [];
            } catch (e) {
              data.restoration_companies = [];
            }
          } else if (!data.restoration_companies) {
            data.restoration_companies = [];
          }
          setInitialDisclosureData(data);
        }
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (err) {
      console.error('Save initial disclosure failed', err);
      alert('Failed to save initial disclosure');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field, value) => {
    console.log(`✏️ Field changed: ${field} = "${value?.substring(0, 50)}${value?.length > 50 ? '...' : ''}"`);
    
    setInitialDisclosureData(prev => {
      const updated = {
        ...(prev || {}),
        [field]: value
      };
      
      // Log the updated state
      if (field.includes('description')) {
        console.log(`✅ State updated for ${field}:`, updated[field]?.length || 0, 'characters');
      }
      
      return updated;
    });
  };

  const handleRestorationCompanyChange = (index, field, value) => {
    setInitialDisclosureData(prev => {
      const companies = prev?.restoration_companies || [];
      const updatedCompanies = [...companies];
      if (!updatedCompanies[index]) {
        updatedCompanies[index] = { name: '', phone_number: '', address: '', type: '' };
      }
      updatedCompanies[index][field] = value;
      return {
        ...prev,
        restoration_companies: updatedCompanies
      };
    });
  };

  const addRestorationCompany = () => {
    setInitialDisclosureData(prev => {
      const companies = prev?.restoration_companies || [];
      return {
        ...prev,
        restoration_companies: [...companies, { name: '', phone_number: '', address: '', type: DEFAULT_COMPANY_DESC }]
      };
    });
  };

  const removeRestorationCompany = (index) => {
    setInitialDisclosureData(prev => {
      const companies = prev?.restoration_companies || [];
      const updatedCompanies = companies.filter((_, i) => i !== index);
      return {
        ...prev,
        restoration_companies: updatedCompanies
      };
    });
  };

  const hasAtLeastOneFieldFilled = () => {
    if (!initialDisclosureData) return false;
    
    const fields = [
      'public_adjuster_name',
      'public_adjuster_phone_number',
      'public_adjuster_address',
      'public_adjuster_description',
      'loss_consultant_name',
      'loss_consultant_phone_number',
      'loss_consultant_address',
      'loss_consultant_description',
      'estimator_name',
      'estimator_phone_number',
      'estimator_address',
      'estimator_description',
      'engineer_name',
      'engineer_phone_number',
      'engineer_address',
      'engineer_description',
      'corporate_representative_name',
      'corporate_representative_phone_number',
      'corporate_representative_address',
      'corporate_representative_description',
      'field_adjuster_name',
      'field_adjuster_phone_number',
      'field_adjuster_address',
      'field_adjuster_description'
    ];

    // Check restoration companies
    const restorationCompanies = initialDisclosureData?.restoration_companies || [];
    if (Array.isArray(restorationCompanies) && restorationCompanies.length > 0) {
      const hasRestorationCompanyData = restorationCompanies.some(company => {
        const effectiveType = (company.type && company.type.trim().length > 0) ? company.type : DEFAULT_COMPANY_DESC;
        return (
          (company.name && company.name.trim().length > 0) ||
          (company.phone_number && company.phone_number.trim().length > 0) ||
          (company.address && company.address.trim().length > 0) ||
          (effectiveType && effectiveType.trim().length > 0)
        );
      });
      if (hasRestorationCompanyData) return true;
    }

    return fields.some(field => {
      const value = initialDisclosureData[field];
      return value && value.toString().trim().length > 0;
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading initial disclosure data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography level="h4" sx={{ mb: 2 }}>
        Initial Disclosure
      </Typography>

      {error && (
        <Typography color="danger" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box component="form" sx={{ display: 'grid', gap: 2 }}>
        {/* Public Adjuster's Information */}
        <Typography level="title-lg" sx={{ mt: 2, mb: 1 }}>
          1. Public Adjuster's Information
        </Typography>
        <FormControl>
          <FormLabel>Public Adjuster Name</FormLabel>
          <Input
            value={initialDisclosureData?.public_adjuster_name || ''}
            onChange={e => handleFieldChange('public_adjuster_name', e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Public Adjuster Phone Number</FormLabel>
          <Input
            value={initialDisclosureData?.public_adjuster_phone_number || ''}
            onChange={e => handleFieldChange('public_adjuster_phone_number', e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Public Adjuster Address</FormLabel>
          <Input
            value={initialDisclosureData?.public_adjuster_address || ''}
            onChange={e => handleFieldChange('public_adjuster_address', e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            value={initialDisclosureData?.public_adjuster_description || ''}
            onChange={e => handleFieldChange('public_adjuster_description', e.target.value)}
            minRows={3}
            placeholder="Enter description for public adjuster"
          />
        </FormControl>

        {/* Loss Consultant's Information */}
        <Typography level="title-lg" sx={{ mt: 2, mb: 1 }}>
          2. Loss Consultant's Information
        </Typography>
        <FormControl>
          <FormLabel>Loss Consultant Name</FormLabel>
          <Input
            value={initialDisclosureData?.loss_consultant_name || ''}
            onChange={e => handleFieldChange('loss_consultant_name', e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Loss Consultant Phone Number</FormLabel>
          <Input
            value={initialDisclosureData?.loss_consultant_phone_number || ''}
            onChange={e => handleFieldChange('loss_consultant_phone_number', e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Loss Consultant Address</FormLabel>
          <Input
            value={initialDisclosureData?.loss_consultant_address || ''}
            onChange={e => handleFieldChange('loss_consultant_address', e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            value={initialDisclosureData?.loss_consultant_description || ''}
            onChange={e => handleFieldChange('loss_consultant_description', e.target.value)}
            minRows={3}
            placeholder="Enter description for loss consultant"
          />
        </FormControl>

        {/* Estimator's Information */}
        <Typography level="title-lg" sx={{ mt: 2, mb: 1 }}>
          3. Estimator's Information
        </Typography>
        <FormControl>
          <FormLabel>Estimator Name</FormLabel>
          <Input
            value={initialDisclosureData?.estimator_name || ''}
            onChange={e => handleFieldChange('estimator_name', e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Estimator Phone Number</FormLabel>
          <Input
            value={initialDisclosureData?.estimator_phone_number || ''}
            onChange={e => handleFieldChange('estimator_phone_number', e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Estimator Address</FormLabel>
          <Input
            value={initialDisclosureData?.estimator_address || ''}
            onChange={e => handleFieldChange('estimator_address', e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            value={initialDisclosureData?.estimator_description || ''}
            onChange={e => handleFieldChange('estimator_description', e.target.value)}
            minRows={3}
            placeholder="Enter description for estimator"
          />
        </FormControl>

        {/* Restoration Company's Information */}
        <Typography level="title-lg" sx={{ mt: 2, mb: 1 }}>
          4. Restoration Company's Information
        </Typography>
        {(initialDisclosureData?.restoration_companies || []).map((company, index) => (
          <Box key={index} sx={{ border: '1px solid', borderColor: 'divider', p: 2, borderRadius: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
                Company {index + 1}
              </Typography>
              <IconButton
                size="sm"
                variant="outlined"
                color="danger"
                onClick={() => removeRestorationCompany(index)}
              >
                <Delete />
              </IconButton>
            </Box>
            <FormControl sx={{ mb: 1 }}>
              <FormLabel>Company Name</FormLabel>
              <Input
                value={company.name || ''}
                onChange={e => handleRestorationCompanyChange(index, 'name', e.target.value)}
                placeholder="Enter company name"
              />
            </FormControl>
            <FormControl sx={{ mb: 1 }}>
              <FormLabel>Phone Number</FormLabel>
              <Input
                value={company.phone_number || ''}
                onChange={e => handleRestorationCompanyChange(index, 'phone_number', e.target.value)}
                placeholder="Enter phone number"
              />
            </FormControl>
            <FormControl sx={{ mb: 1 }}>
              <FormLabel>Address</FormLabel>
              <Input
                value={company.address || ''}
                onChange={e => handleRestorationCompanyChange(index, 'address', e.target.value)}
                placeholder="Enter address"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={(company.type && company.type.trim().length > 0) ? company.type : DEFAULT_COMPANY_DESC}
                onChange={e => handleRestorationCompanyChange(index, 'type', e.target.value)}
                minRows={5}
              />
            </FormControl>
          </Box>
        ))}
        <Button
          variant="outlined"
          startDecorator={<Add />}
          onClick={addRestorationCompany}
          sx={{ mb: 2 }}
        >
          Add Restoration Company
        </Button>

        {/* Engineer's Information */}
        <Typography level="title-lg" sx={{ mt: 2, mb: 1 }}>
          5. Engineer's Information
        </Typography>
        <FormControl>
          <FormLabel>Engineer Name</FormLabel>
          <Input
            value={initialDisclosureData?.engineer_name || ''}
            onChange={e => handleFieldChange('engineer_name', e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Engineer Phone Number</FormLabel>
          <Input
            value={initialDisclosureData?.engineer_phone_number || ''}
            onChange={e => handleFieldChange('engineer_phone_number', e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Engineer Address</FormLabel>
          <Input
            value={initialDisclosureData?.engineer_address || ''}
            onChange={e => handleFieldChange('engineer_address', e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            value={initialDisclosureData?.engineer_description || ''}
            onChange={e => handleFieldChange('engineer_description', e.target.value)}
            minRows={3}
            placeholder="Enter description for engineer"
          />
        </FormControl>

        {/* Corporate Representative's Information */}
        <Typography level="title-lg" sx={{ mt: 2, mb: 1 }}>
          6. Corporate Representative's Information
        </Typography>
        <FormControl>
          <FormLabel>Corporate Representative Name</FormLabel>
          <Input
            value={initialDisclosureData?.corporate_representative_name || ''}
            onChange={e => handleFieldChange('corporate_representative_name', e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Corporate Representative Phone Number</FormLabel>
          <Input
            value={initialDisclosureData?.corporate_representative_phone_number || ''}
            onChange={e => handleFieldChange('corporate_representative_phone_number', e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Corporate Representative Address</FormLabel>
          <Input
            value={initialDisclosureData?.corporate_representative_address || ''}
            onChange={e => handleFieldChange('corporate_representative_address', e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            value={initialDisclosureData?.corporate_representative_description || ''}
            onChange={e => handleFieldChange('corporate_representative_description', e.target.value)}
            minRows={3}
            placeholder="Enter description for corporate representative"
          />
        </FormControl>

        {/* Field Adjuster's Information */}
        <Typography level="title-lg" sx={{ mt: 2, mb: 1 }}>
          7. Field Adjuster's Information
        </Typography>
        <FormControl>
          <FormLabel>Field Adjuster Name</FormLabel>
          <Input
            value={initialDisclosureData?.field_adjuster_name || ''}
            onChange={e => handleFieldChange('field_adjuster_name', e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Field Adjuster Phone Number</FormLabel>
          <Input
            value={initialDisclosureData?.field_adjuster_phone_number || ''}
            onChange={e => handleFieldChange('field_adjuster_phone_number', e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Field Adjuster Address</FormLabel>
          <Input
            value={initialDisclosureData?.field_adjuster_address || ''}
            onChange={e => handleFieldChange('field_adjuster_address', e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            value={initialDisclosureData?.field_adjuster_description || ''}
            onChange={e => handleFieldChange('field_adjuster_description', e.target.value)}
            minRows={3}
            placeholder="Enter description for field adjuster"
          />
        </FormControl>

        {/* Save Button */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="solid"
            onClick={handleSave}
            disabled={saving || !caseId}
          >
            {saving ? 'Saving...' : 'Save Initial Disclosure'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default InitialDisclosure;