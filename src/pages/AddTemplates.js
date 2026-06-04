import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TemplateEditor from '../components/TemplateEditor';

const AddTemplates = () => {
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await axios.get('/api/fields');
        setFields(res.data);
      } catch (error) {
        console.error('Error fetching fields', error);
      }
    };
    fetchFields();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      setMessage('Template name is required');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/templates', { name, body });
      setMessage('Template saved successfully');
      setName('');
      setBody('');
    } catch (error) {
      console.error('Error saving template', error);
      setMessage('Error saving template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>Add New Template</h1>
      {message && <p>{message}</p>}
      <div style={{ marginBottom: '16px' }}>
        <label>Template Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label>Template Body</label>
        <TemplateEditor
          initialValue={body}
          onChange={setBody}
          availableFields={fields}
        />
      </div>
      <button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving…' : 'Save Template'}
      </button>
    </div>
  );
};

export default AddTemplates;
