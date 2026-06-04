import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  Button,
  Modal,
  ModalDialog,
  FormControl,
  Input,
  Select,
  Option,
  Typography,
  Stack,
  Chip,
  Box
} from '@mui/joy';
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { Upload } from 'lucide-react'; // optional icon

function TemplateList() {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [file, setFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('/templates')
      .then(res => {
        const data = res.data;
        const structuredList = [];
        const allCategories = Object.keys(data.categories).filter(c => c !== 'All Document Templates');

        for (const category of allCategories) {
          data.categories[category].forEach(file => {
            structuredList.push({ category, file });
          });
        }

        setTemplates(structuredList);
        setCategories(allCategories);
      })
      .catch(err => console.error('Error fetching templates:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async () => {
    if (!file || !selectedCategory) {
      alert("Please select a file and category.");
      return;
    }

    const formData = new FormData();
    formData.append("template", file);

    try {
      await axios.post(`/templates/${selectedCategory}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Template uploaded successfully!");
      setOpenModal(false);
      setFile(null);
      setSelectedCategory('');
      // Re-fetch templates
      setLoading(true);
      axios.get('/templates')
        .then(res => {
          const data = res.data;
          const structuredList = [];
          const allCategories = Object.keys(data.categories).filter(c => c !== 'All Document Templates');
          for (const category of allCategories) {
            data.categories[category].forEach(file => {
              structuredList.push({ category, file });
            });
          }
          setTemplates(structuredList);
        })
        .finally(() => setLoading(false));
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload template.");
    }
  };
  const handleDelete = async (category, file) => {
  if (!window.confirm(`Delete template "${file}" from category "${category}"?`)) return;
  try {
    await axios.delete(`/templates/${category}/${file}`);
    alert("Template deleted successfully.");
    setTemplates(prev => prev.filter(t => !(t.category === category && t.file === file)));
  } catch (err) {
    console.error("Failed to delete template:", err);
    alert("Failed to delete template.");
  }
};

  // Filter templates based on search term
  const filteredTemplates = templates.filter(template =>
    (template.file || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ padding: { xs: 1, sm: 2, md: '20px' }, maxWidth: '100%', overflow: 'hidden' }}>
      <Typography 
        level="h2" 
        sx={{ 
          mb: { xs: 2, sm: 3, md: 3 }, 
          fontWeight: 'bold',
          fontSize: { xs: '1.25rem', sm: '1.5rem', md: 'inherit' }
        }}
      >
        Document Templates
      </Typography>

      <Stack 
        direction={{ xs: 'column', sm: 'row', md: 'row' }} 
        spacing={2} 
        sx={{ 
          mb: 2, 
          alignItems: { xs: 'stretch', sm: 'center', md: 'center' },
          width: '100%'
        }}
      >
        <Button 
          onClick={() => setOpenModal(true)}
          sx={{ 
            width: { xs: '100%', sm: 'auto', md: 'auto' },
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' }
          }}
        >
          Add Template
        </Button>
        
        <FormControl sx={{ minWidth: { xs: '100%', sm: 300, md: 300 }, width: { xs: '100%', sm: 'auto', md: 'auto' }, flexGrow: { xs: 1, sm: 0, md: 0 } }}>
          <Input
            placeholder="Search templates by file name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startDecorator={<SearchIcon />}
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' }
            }}
          />
        </FormControl>
      </Stack>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Loading templates...
        </Box>
      ) : (
        <>
          {searchTerm && (
            <Typography 
              level="body-sm" 
              sx={{ 
                mb: 1, 
                color: 'text.secondary',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Showing {filteredTemplates.length} of {templates.length} templates
            </Typography>
          )}
          <Box sx={{ 
            overflowX: 'auto', 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px',
            width: '100%',
            '-webkit-overflow-scrolling': 'touch',
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            }
          }}>
            <Table 
              variant="outlined" 
              size="sm" 
              sx={{ 
                tableLayout: 'fixed', 
                width: '100%', 
                minWidth: { xs: '500px', sm: '600px', md: '600px' },
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' }
              }}
            >
          <thead>
            <tr>
              <th style={{ 
                width: '50%', 
                minWidth: '200px',
                padding: '8px 12px',
                textAlign: 'left'
              }}>
                File Name
              </th>
              <th style={{ 
                width: '20%', 
                minWidth: '100px',
                padding: '8px 12px',
                textAlign: 'left'
              }}>
                Category
              </th>
              <th style={{ 
                width: '15%', 
                minWidth: '80px',
                padding: '8px 12px',
                textAlign: 'center'
              }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTemplates.map((t, index) => (
              <tr key={index}>
                <td style={{ 
                  wordBreak: 'break-word', 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '0'
                }} title={t.file}>
                  <Box sx={{ p: { xs: '6px 8px', sm: '8px 12px' } }}>
                    {t.file}
                  </Box>
                </td>
                <td style={{ wordBreak: 'break-word' }}>
                  <Box sx={{ p: { xs: '6px 8px', sm: '8px 12px' } }}>
                    {t.category}
                  </Box>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <Box sx={{ p: { xs: '6px 8px', sm: '8px 12px' } }}>
                  <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} sx={{ alignItems: 'center' }}>
                    <Button
                      variant="soft"
                      size="sm"
                      color="primary"
                      onClick={async () => {
                        try {
                          const response = await axios.get(
                            `/templates/${t.category}/${t.file}/download`,
                            { responseType: 'blob' }
                          );

                          const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });
                          const blobUrl = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = blobUrl;
                          link.setAttribute('download', t.file);
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          window.URL.revokeObjectURL(blobUrl);
                        } catch (err) {
                          console.error("Download failed:", err);
                          alert("Failed to download template.");
                        }
                      }}
                      sx={{ 
                        minWidth: 'auto', 
                        px: { xs: 0.5, sm: 1, md: 1 },
                        fontSize: { xs: '0.7rem', sm: '0.875rem', md: 'inherit' }
                      }}
                    >
                      <DownloadIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: 'small' } }}/>
                    </Button>

                    <Button
                      size="sm"
                      variant="soft"
                      color="danger"
                      onClick={() => handleDelete(t.category, t.file)}
                      sx={{ 
                        minWidth: 'auto', 
                        px: { xs: 0.5, sm: 1, md: 1 },
                        fontSize: { xs: '0.7rem', sm: '0.875rem', md: 'inherit' }
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: 'small' } }}/>
                    </Button>
                  </Stack>
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
          </Box>
        </>
      )}

     <Modal open={openModal} onClose={() => setOpenModal(false)}>
  <ModalDialog 
    variant="outlined" 
    sx={{ 
      borderRadius: 'lg', 
      p: { xs: 2, sm: 3, md: 3 }, 
      minWidth: { xs: '90%', sm: 400, md: 400 },
      maxWidth: { xs: '90%', sm: 500, md: 500 }
    }}
  >
    <Typography 
      level="h4" 
      mb={1}
      sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem', md: 'inherit' } }}
    >
      Upload New Template
    </Typography>

    <FormControl sx={{ mt: 2 }}>
      <Stack 
        direction={{ xs: 'column', sm: 'row', md: 'row' }} 
        alignItems={{ xs: 'stretch', sm: 'center', md: 'center' }} 
        spacing={2}
      >
        <Button
          component="label"
          variant="soft"
          startDecorator={<Upload />}
          sx={{ 
            width: { xs: '100%', sm: 'auto', md: 'auto' },
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' }
          }}
        >
          Choose File
          <input
            type="file"
            accept=".docx"
            hidden
            onChange={e => setFile(e.target.files[0])}
          />
        </Button>

        {file && (
          <Chip 
            variant="soft" 
            color="primary"
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.875rem', md: 'inherit' },
              width: { xs: '100%', sm: 'auto', md: 'auto' },
              justifyContent: { xs: 'center', sm: 'flex-start', md: 'flex-start' }
            }}
          >
            {file.name}
          </Chip>
        )}
      </Stack>
    </FormControl>

    <FormControl sx={{ mt: 3 }}>
      <Select
        placeholder="Select Category"
        value={selectedCategory}
        onChange={(e, newValue) => setSelectedCategory(newValue)}
        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' } }}
      >
        {categories.map((cat, index) => (
          <Option key={index} value={cat}>
            {cat}
          </Option>
        ))}
      </Select>
    </FormControl>

    <Button 
      onClick={handleUpload} 
      sx={{ 
        mt: 3,
        fontSize: { xs: '0.75rem', sm: '0.875rem', md: 'inherit' }
      }} 
      fullWidth
    >
      Upload
    </Button>
  </ModalDialog>
</Modal>
    </Box>
  );
}

export default TemplateList;
