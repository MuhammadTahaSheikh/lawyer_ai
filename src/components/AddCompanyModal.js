import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Input,
  Textarea,
  Button,
  Grid,
  FormControl,
  FormLabel,
  Select,
  Option,
  Sheet
} from "@mui/joy";
import axios from "axios";





const defaultForm = {
  name: "",
  email: "",
  website: "",
  main_phone_number: "",
  fax_phone_number: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip_code: "",
  country: "",
  notes: "",
};

function AddCompanyModal({ open, onClose, initialData = null, refresh }) {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState(defaultForm);
  const [countries, setCountries] = useState([]);
const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || "http://localhost:3001"
});
useEffect(() => {
  const fetchCountries = async () => {
    try {
      const res = await fetch("https://restcountries.com/v3.1/all");
      const data = await res.json();
      const countryNames = data
        .map(c => c.name.common)
        .sort((a, b) => a.localeCompare(b));
      setCountries(countryNames);
    } catch (err) {
      console.error("Failed to fetch countries:", err);
    }
  };

  if (open) {
    fetchCountries();
  }
}, [open]);
  // ✅ Ensure state resets fully on each open
  useEffect(() => {
    if (open) {
      setFormData({ ...defaultForm, ...(initialData || {}) });
    }
  }, [open, initialData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
  try {
    if (isEdit) {
      await api.put(`/companies/${initialData.id}`, formData);
    } else {
      await api.post("/companies", {
        ...formData,
        id: Date.now(),
        created_at: new Date(),
        updated_at: new Date(),
        archived: 0
      });
    }
    onClose();
    refresh();
  } catch (error) {
    console.error("Error saving company:", error);
  }
};

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        layout="center"
        sx={{
          width: "100%",
          maxWidth: 700,
          height: "90vh",
          overflow: "auto",
          p: 3,
          borderRadius: "lg",
        }}
      >
        <ModalClose />
        <Typography level="h4" mb={2}>
          {isEdit ? "Edit Company" : "Add Company"}
        </Typography>

        <Sheet variant="plain" sx={{ px: 1 }}>
          <Grid container spacing={2}>
            {[
              { label: "Name", key: "name" },
              { label: "Email", key: "email" },
              { label: "Website", key: "website" },
              { label: "Main phone", key: "main_phone_number" },
              { label: "Fax number", key: "fax_phone_number" },
              { label: "Address", key: "address1" },
              { label: "Address 2", key: "address2" },
              { label: "City", key: "city" },
              { label: "State", key: "state" },
              { label: "Zip Code", key: "zip_code" },
            ].map(({ label, key }) => (
              <Grid xs={key === "email" || key === "website" ? 12 : 6} key={key}>
                <FormControl>
                  <FormLabel>{label}</FormLabel>
                  <Input
                    value={formData[key] || ""}
                    onChange={(e) => handleChange(key, e.target.value)}
                  />
                </FormControl>
              </Grid>
            ))}

            <Grid xs={12}>
              <FormControl>
                <FormLabel>Country</FormLabel>
                <Select
  value={formData.country || ""}
  placeholder="Select Country"
  onChange={(e, val) => handleChange("country", val)}
>
  {countries.map((country) => (
    <Option key={country} value={country}>
      {country}
    </Option>
  ))}
</Select>

              </FormControl>
            </Grid>

            <Grid xs={12}>
              <FormControl>
                <FormLabel>Private Notes</FormLabel>
                <Textarea
                  minRows={3}
                  value={formData.notes || ""}
                  onChange={(e) => handleChange("notes", e.target.value)}
                />
              </FormControl>
            </Grid>
          </Grid>

          <Grid container justifyContent="flex-end" mt={3} spacing={2}>
            <Grid>
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
            </Grid>
            <Grid>
              <Button variant="solid" onClick={handleSubmit}>
                {isEdit ? "Save Changes" : "Save & Close"}
              </Button>
            </Grid>
          </Grid>
        </Sheet>
      </ModalDialog>
    </Modal>
  );
}

export default AddCompanyModal;
