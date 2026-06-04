import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Sheet,
  Table,
  Card,
  Stack,
  Select,
  Option,
  Button,
  MenuButton,
  Menu,
  MenuItem,
  Dropdown,
  Input,
} from "@mui/joy";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function StatuteReport() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCases = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/cases/all");
      setCases(response.data.cases);
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const addFiveYears = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const monthMap = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
      };
      const [day, monthAbbr, year] = dateString.split("-");
      const fullYear = parseInt(year, 10) + 2000;
      const dateObj = new Date(fullYear, monthMap[monthAbbr], parseInt(day, 10));
      dateObj.setFullYear(dateObj.getFullYear() + 5);
      return dateObj.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error parsing date:", dateString);
      return "Invalid Date";
    }
  };

  const exportAsCSV = () => {
    const csvData = [
      ["Case", "Statute of Limitations Date", "SOL Satisfied?"],
      ...filteredCases.map((item) => [
        item.name, addFiveYears(item.date_of_damage), item.satisfied || "N/A"
      ]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvData.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "case_list_report.csv");
    document.body.appendChild(link);
    link.click();
  };
  
  const exportAsPDF = () => {
    const doc = new jsPDF();
    doc.text("Case List Report", 20, 10);
    const tableData = filteredCases.map((item) => [
      item.name, addFiveYears(item.date_of_damage), item.satisfied || "N/A"
    ]);
    autoTable(doc, {
      head: [["Case", "Statute of Limitations Date", "SOL Satisfied?"]],
      body: tableData,
      startY: 20,
    });
    doc.save("case_list_report.pdf");
  };
  

  const filteredCases = cases.filter((item) =>
    (item.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography level="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
        Statute of Limitations Report
      </Typography>
      
      <Card 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          alignItems: 'center', 
          p: 2, 
          gap: 2, 
          bgcolor: '#f5f5f5' 
        }}
      >
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={2} 
          sx={{ flexGrow: 1, width: '100%' }}
        >
          {/* <Box sx={{ width: '100%' }}>
            <Typography level="body1" sx={{ mb: 1 }}>Cases</Typography>
            <Select defaultValue="my_cases" size="md" sx={{ width: '100%' }}>
              <Option value="my_cases">My Cases</Option>
            </Select>
          </Box> */}
 <Box sx={{ width: '100%' }}>
 <Typography level="body1" sx={{ mb: 1 }}>Case</Typography>
        <Input
          placeholder="Search cases..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: '100%', mb: 2 }}
        />
      </Box>
          <Box sx={{ width: '100%' }}>
            <Typography level="body1" sx={{ mb: 1 }}>Satisfaction</Typography>
            <Select defaultValue="all" size="md" sx={{ width: '100%' }}>
              <Option value="all">All</Option>
              <Option value="satisfied">Satisfied</Option>
              <Option value="unsatisfied">Unsatisfied</Option>
            </Select>
          </Box>
        </Stack>

        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={2} 
          sx={{ mt: { xs: 2, md: 0 }, width: '100%', justifyContent: { xs: 'center', md: 'flex-start' } }}
        >
          <Dropdown>
            <MenuButton variant="outlined">Export</MenuButton>
            <Menu>
            <MenuItem onClick={exportAsCSV}>Export as CSV</MenuItem>
            <MenuItem onClick={exportAsPDF}>Export as PDF</MenuItem>
            </Menu>
          </Dropdown>

          <Button variant="solid" color="primary">Run Report</Button>
        </Stack>
      </Card>

     

      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "md", mt: 3 }}>
        {loading ? (
          <Typography sx={{ textAlign: "center" }}>Loading..</Typography>
        ) : filteredCases.length > 0 ? (
          <Table borderAxis="bothBetween">
            <thead>
              <tr>
                <th>Case Name</th>
                <th>Statute of Limitations Date</th>
                {/* <th>Satisfied</th> */}
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{addFiveYears(item.date_of_damage)}</td>
                  {/* <td>{item.satisfied || "N/A"}</td> */}
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Typography sx={{ mt: 2, textAlign: "center" }}>
            There are no cases that match the selected criteria.
          </Typography>
        )}
      </Sheet>
    </Box>
  );
}