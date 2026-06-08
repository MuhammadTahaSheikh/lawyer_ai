import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  FormControl,
  FormLabel,
  Select,
  Option,
  Stack,
  Switch,
  Typography,
  Link,
  Textarea,
} from "@mui/joy";
import { auth } from "../firebase/firebase";

const AddContactModal = ({ open, onClose, onContactAdded,editContact  }) => {
  const initialContactState = {
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    contact_group: "Client",
    mobile_phone: "",
    work_phone: "",
    home_phone: "",
    home_street: "",
    home_street_2: "",
    home_city: "",
    home_state: "",
    home_postal_code: "",
    home_country: "",
    timezone: "Islamabad",
    birthdate: "",
    company: "",
    job_title: "",
    driver_license: "",
    driver_state: "",
    website: "",
    fax_number: "",
    notes: "",
  };

  const [newContact, setNewContact] = useState(initialContactState);
  const [showMore, setShowMore] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const currentUser = auth.currentUser?.uid;
useEffect(() => {
  if (editContact) {
    const normalized = {
      first_name: editContact.first_name || "",
      middle_name: editContact.middle_name || "",
      last_name: editContact.last_name || "",
      email: editContact.email || "",
      contact_group: editContact.contact_group || "Client",
      mobile_phone: editContact.cell_phone_number || "",
      work_phone: editContact.work_phone_number || "",
      home_phone: editContact.home_phone_number || "",
      home_street: editContact.address_line || "",
      home_street_2: editContact.home_street_2 || "",
      home_city: editContact.city || editContact.home_city || "",
      home_state: editContact.state || editContact.home_state || "",
      home_postal_code: editContact.zip_code || editContact.home_postal_code || "",
      home_country: editContact.country || editContact.home_country || "",
      timezone: editContact.timezone || "Islamabad",
      birthdate: editContact.birthdate ? editContact.birthdate.slice(0, 10) : "",
      company: editContact.company || "",
      job_title: editContact.job_title || "",
      driver_license: editContact.driver_license || "",
      driver_state: editContact.driver_state || "",
      website: editContact.website || "",
      fax_number: editContact.fax_number || "",
      notes: editContact.notes || "",
    };
    setNewContact(normalized);
  } else {
    setNewContact(initialContactState);
  }
}, [editContact, open]);


  useEffect(() => {
    const fetchCompanies = async () => {
      try {
      const response = await axios.get("/companies/names");
        setCompanyOptions(response.data || []);
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      }
    };
    if (open) fetchCompanies();
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewContact((prev) => ({ ...prev, [name]: value }));
  };

 

 const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    first_name: newContact.first_name,
    middle_name: newContact.middle_name,
    last_name: newContact.last_name,
    email: newContact.email,
    contact_group: newContact.contact_group,
    mobile_phone: newContact.mobile_phone,
    work_phone: newContact.work_phone,
    home_phone: newContact.home_phone,
    home_street: newContact.home_street,
    home_street_2: newContact.home_street_2,
    home_city: newContact.home_city,
    home_state: newContact.home_state,
    home_postal_code: newContact.home_postal_code,
    home_country: newContact.home_country,
    timezone: newContact.timezone,
    birthdate: newContact.birthdate || null,
    company: newContact.company,
    job_title: newContact.job_title,
    driver_license: newContact.driver_license,
    driver_state: newContact.driver_state,
    website: newContact.website,
    fax_number: newContact.fax_number,
    notes: newContact.notes,
    uid: currentUser,
    updated_at: new Date(),
    created_at: new Date()
  };

 try {
    if (editContact?.id) {
      await axios.put(`/clients/${editContact.id}`, payload); // Update
    } else {
      await axios.post("/clients", payload); // Create
    }
    onContactAdded?.();
    onClose();
  } catch (error) {
    console.error("Error adding contact:", error);
  }
};

const safeClose = () => {
  requestAnimationFrame(() => {
    setTimeout(() => {
      onClose();
    }, 0); // Schedule the close at the end of the current frame
  });
};


  return (
    <Modal open={open} onClose={safeClose}>
      <ModalDialog
        sx={{ width: 700, maxHeight: "90vh", overflowY: "auto" }}
      >
        <DialogTitle>
  {editContact ? "Edit Person" : "Add Person"}
</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1}>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>First Name</FormLabel>
                  <Input name="first_name" value={newContact.first_name} onChange={handleChange} required />
                </FormControl>
                <FormControl sx={{ width: 80 }}>
                  <FormLabel>M name</FormLabel>
                  <Input name="middle_name" value={newContact.middle_name} onChange={handleChange} />
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Last Name</FormLabel>
                  <Input name="last_name" value={newContact.last_name} onChange={handleChange} required />
                </FormControl>
              </Stack>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input type="email" name="email" value={newContact.email} onChange={handleChange} required />
              </FormControl>

              <Stack direction="row" spacing={2}>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>People Group</FormLabel>
                  <Select
                    name="contact_group"
                    value={newContact.contact_group}
                    onChange={(e, val) => setNewContact((prev) => ({ ...prev, contact_group: val }))}
                  >
                    <Option value="ATTORNEY">ATTORNEY</Option>
                    <Option value="Client">Client</Option>
                    <Option value="Co-counsel">Co-counsel</Option>
                    <Option value="Expert">Expert</Option>
                    <Option value="Judge">Judge</Option>
                    <Option value="PARALEGAL">PARALEGAL</Option>
                    <Option value="Staff">Staff</Option>
                    <Option value="Unassigned">Unassigned</Option>
                  </Select>
                </FormControl>
                {/* <Link sx={{ alignSelf: 'center', fontSize: 14 }}>Add new people group</Link> */}
              </Stack>

           

              <FormControl>
                <FormLabel>Cell phone</FormLabel>
                <Input name="mobile_phone" value={newContact.mobile_phone} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Work phone</FormLabel>
                <Input name="work_phone" value={newContact.work_phone} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Home phone</FormLabel>
                <Input name="home_phone" value={newContact.home_phone} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Address</FormLabel>
                <Input name="home_street" value={newContact.home_street} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Address 2</FormLabel>
                <Input name="home_street_2" value={newContact.home_street_2} onChange={handleChange} />
              </FormControl>
              <Stack direction="row" spacing={2}>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>City</FormLabel>
                  <Input name="home_city" value={newContact.home_city} onChange={handleChange} />
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>State</FormLabel>
                  <Input name="home_state" value={newContact.home_state} onChange={handleChange} />
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Zip Code</FormLabel>
                  <Input name="home_postal_code" value={newContact.home_postal_code} onChange={handleChange} />
                </FormControl>
              </Stack>
              <FormControl>
                <FormLabel>Country</FormLabel>
                <Input name="home_country" value={newContact.home_country} onChange={handleChange} />
              </FormControl>
              {/* <FormControl>
                <FormLabel>Timezone</FormLabel>
                <Select name="timezone" value={newContact.timezone} onChange={(e, val) => setNewContact(prev => ({ ...prev, timezone: val }))}>
                  <Option value="Islamabad">Islamabad</Option>
                  <Option value="New York">New York</Option>
                  <Option value="London">London</Option>
                </Select>
              </FormControl> */}

             <Link
  component="button"
  type="button" // <-- Add this line
  onClick={() => setShowMore(!showMore)}
>
  {showMore ? "Hide additional information" : "Add More Information"}
</Link>


              {showMore && (
                <Stack spacing={2}>
                  <FormControl>
                    <FormLabel>Birthday</FormLabel>
                    <Input type="date" name="birthdate" value={newContact.birthdate} onChange={handleChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Company</FormLabel>
                    <Select
                      name="company"
                      value={newContact.company}
                      onChange={(e, val) => setNewContact((prev) => ({ ...prev, company: val }))}
                    >
                      {companyOptions.map((company) => (
                        <Option key={company.id} value={company.name}>{company.name}</Option>
                      ))}
                    </Select>
                    {/* <Link>Add new company</Link> */}
                  </FormControl>
                  <FormControl>
                    <FormLabel>Job Title</FormLabel>
                    <Input name="job_title" value={newContact.job_title} onChange={handleChange} />
                  </FormControl>
                  <Stack direction="row" spacing={2}>
                    <FormControl sx={{ flex: 1 }}>
                      <FormLabel>Driver License</FormLabel>
                      <Input name="driver_license" value={newContact.driver_license} onChange={handleChange} />
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <FormLabel>State</FormLabel>
                      <Input name="driver_state" value={newContact.driver_state} onChange={handleChange} />
                    </FormControl>
                  </Stack>
                  <FormControl>
                    <FormLabel>Website</FormLabel>
                    <Input name="website" value={newContact.website} onChange={handleChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Fax Number</FormLabel>
                    <Input name="fax_number" value={newContact.fax_number} onChange={handleChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Notes</FormLabel>
                    <Textarea name="notes" value={newContact.notes} onChange={handleChange} minRows={2} />
                    <Typography level="body-xs">These are never visible to this contact.</Typography>
                  </FormControl>
                </Stack>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="plain" onClick={safeClose}>Cancel</Button>
 <Button type="submit">
    {editContact ? "Update" : "Save"}
  </Button>          </DialogActions>
        </form>
      </ModalDialog>
    </Modal>
  );
};

export default AddContactModal;