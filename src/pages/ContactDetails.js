import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemContent,
  Tabs,
  Tab,
  TabList,
  TabPanel,
  Modal,
  ModalDialog,
  ModalClose,
  TextField,
  Container,
  Sheet,
  CircularProgress,
} from "@mui/joy";
import ContactInfoTab from "../components/ContactInfoTab";
import AddContactModal from "../components/AddContactModal";

const ContactDetails = () => {
  const { id } = useParams();
  const [contact, setContact] = useState(null);
  const [privateNotes, setPrivateNotes] = useState([]);
  const [associatedCases, setAssociatedCases] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const fetchContactDetails = async () => {
    setLoading(true);
    try {
      const contactResponse = await axios.get(`/clients/${id}`);
      const contactData = contactResponse.data;
      setContact(contactData);
      
      if (contactData.case_id) {
        const caseIds = contactData.case_id.split(",").map(id => id.trim());
        const casesResponse = await axios.get(`/clients/${id}/cases`, {
          params: { ids: caseIds }
        });
        setAssociatedCases(casesResponse.data || []);
      }

      // Fetch private notes if needed
      // const notesResponse = await axios.get(`/contacts/${id}/notes`);
      // setPrivateNotes(notesResponse.data || []);
    } catch (error) {
      console.error("Error fetching contact details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactDetails();
  }, [id]);

  const handleSave = async (updatedContact) => {
    setIsSaving(true);
    try {
      await axios.put(`/contacts/${id}`, updatedContact);
      await fetchContactDetails(); // Refresh the data
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating contact:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!contact) {
    return <Typography align="center">Contact not found.</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Sidebar Section */}
        <Grid item xs={12} md={4}>
          <Sheet variant="outlined" sx={{ p: 3, borderRadius: 'sm' }}>
            <Typography level="h5" sx={{ mb: 2 }}>Contact Info</Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography level="body2" sx={{ fontWeight: 'bold' }}>Name</Typography>
              <Typography>
                {contact.first_name} {contact.middle_name} {contact.last_name}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography level="body2" sx={{ fontWeight: 'bold' }}>Email</Typography>
              <Typography>{contact.email || "N/A"}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography level="body2" sx={{ fontWeight: 'bold' }}>Group</Typography>
              <Typography>{contact.contact_group || "N/A"}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography level="body2" sx={{ fontWeight: 'bold' }}>Phone</Typography>
              <Typography>{contact.mobile_phone || contact.cell_phone_number || "N/A"}</Typography>
            </Box>

            <Button
              fullWidth
              variant="solid"
              sx={{ mt: 2 }}
              onClick={() => setIsModalOpen(true)}
            >
              Edit Contact
            </Button>
          </Sheet>

          {/* Associated Cases */}
          <Sheet variant="outlined" sx={{ p: 3, mt: 2, borderRadius: 'sm' }}>
            <Typography level="h5" sx={{ mb: 2 }}>Associated Cases</Typography>
            <List>
              {associatedCases.length > 0 ? (
                associatedCases.map((caseItem) => (
                  <ListItem 
                    key={caseItem.case_id} 
                    component={Link} 
                    to={`/cases/${caseItem.case_id}`}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'background.level1'
                      }
                    }}
                  >
                    <ListItemContent>
                      <Typography level="body1" sx={{ fontWeight: 'md' }}>
                        {caseItem.case_name || "Unnamed Case"}
                      </Typography>
                      <Typography level="body2">
                        {caseItem.case_stage || "N/A"} • {caseItem.practice_area || "N/A"}
                      </Typography>
                    </ListItemContent>
                  </ListItem>
                ))
              ) : (
                <Typography level="body2">No associated cases found.</Typography>
              )}
            </List>
          </Sheet>
        </Grid>

        {/* Main Content Section */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Typography level="h2" sx={{ mb: 1 }}>
                {contact.first_name} {contact.last_name}
                <Typography component="span" level="body2" sx={{ ml: 1 }}>
                  ({contact.contact_group || "No Group"})
                </Typography>
              </Typography>

              {/* Tabs */}
              <Tabs 
                value={activeTab} 
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{ mt: 2 }}
              >
                <TabList>
                  <Tab>Info</Tab>
                  <Tab>Cases</Tab>
                  <Tab>Activity</Tab>
                  <Tab>Notes</Tab>
                </TabList>

                {/* Tab Panels */}
                <TabPanel value={0}>
                  <ContactInfoTab contact={contact} privateNotes={privateNotes} />
                </TabPanel>
                
                <TabPanel value={1}>
                  <Typography level="h5" sx={{ mb: 2 }}>Associated Cases</Typography>
                  {associatedCases.length > 0 ? (
                    <List>
                      {associatedCases.map((caseItem) => (
                        <ListItem 
                          key={caseItem.case_id}
                          component={Link}
                          to={`/cases/${caseItem.case_id}`}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'background.level1'
                            }
                          }}
                        >
                          <ListItemContent>
                            <Typography level="title-md">
                              {caseItem.case_name || "Unnamed Case"}
                            </Typography>
                            <Typography level="body2">
                              Stage: {caseItem.case_stage || "N/A"} • 
                              Practice Area: {caseItem.practice_area || "N/A"}
                            </Typography>
                          </ListItemContent>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography>No associated cases found.</Typography>
                  )}
                </TabPanel>
                
                <TabPanel value={2}>
                  <Typography level="h5">Activity</Typography>
                  <Typography sx={{ mt: 1 }}>Activity log will appear here.</Typography>
                </TabPanel>
                
                <TabPanel value={3}>
                  <Typography level="h5">Private Notes</Typography>
                  {privateNotes.length > 0 ? (
                    <List>
                      {privateNotes.map((note) => (
                        <ListItem key={note.id}>
                          <ListItemContent>
                            <Typography>{note.content}</Typography>
                            <Typography level="body2">{note.created_at}</Typography>
                          </ListItemContent>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography sx={{ mt: 1 }}>No private notes yet.</Typography>
                  )}
                </TabPanel>
              </Tabs>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Contact Modal */}
      <AddContactModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContactAdded={handleSave}
        editContact={contact}
        isSaving={isSaving}
      />
    </Container>
  );
};

export default ContactDetails;