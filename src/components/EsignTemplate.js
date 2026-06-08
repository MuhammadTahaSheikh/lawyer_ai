import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  List,
  ListItem,
} from '@mui/joy';
import DescriptionIcon from '@mui/icons-material/Description';

function EsignTemplate({case_id}) {
  const [allTemplates, setAllTemplates] = useState([]);

  useEffect(() => {
    axios.get('/esign-template')
      .then(response => {
        const categories = response.data.categories || [];
        // Flatten all template files from all categories into one array
        const mergedTemplates = Object.values(categories).flat();
        const uniqueTemplates = [...new Set(mergedTemplates)];
        setAllTemplates(uniqueTemplates.sort((a, b) => a.localeCompare(b)));
      })
      .catch(error => {
        console.error('Error fetching templates:', error);
      });
  }, []);

  const handleTemplateSelect = (templateName) => {
    axios({
      url: "/generate-documentESIGN",
      method: 'POST',
      responseType: 'blob',
      data: { template_filename: templateName ,case_id},
    })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', templateName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(error => {
        const msg = error?.response?.data?.error || 'Error generating document.';
        console.error(msg);
      });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography level="h4" sx={{ mb: 2 }}>
        Document Templates
      </Typography>

      {allTemplates.length > 0 ? (
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {allTemplates.map(file => (
            <ListItem
              key={file}
              onClick={() => handleTemplateSelect(file)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                px: 2,
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#f0f0f0' },
              }}
            >
              <DescriptionIcon sx={{ fontSize: 28, color: 'primary.500' }} />
              <Box>
                <Typography level="body1" sx={{ fontWeight: 500 }}>
                  {file.replace(/\.[^/.]+$/, '')}
                </Typography>
                <Typography level="body2" sx={{ color: 'neutral.500' }}>
                  Document template
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography level="body1" sx={{ color: 'neutral.500' }}>
          No document templates available.
        </Typography>
      )}
    </Box>
  );
}

export default EsignTemplate;
