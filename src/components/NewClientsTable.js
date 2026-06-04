import React from "react";
import {
  Box,
  Typography,
  Table,
  Card,
} from "@mui/joy";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const NewClientsTable = ({
  practiceAreaData = [],
  onPracticeAreaClick,
}) => {
  return (
    <Card variant="outlined" sx={{
      p: { xs: 1, sm: 2 },
      mb: 2,
      height: { xs: "400px", sm: "500px" },
      display: "flex",
      flexDirection: "column",
      border: "1px solid #ddd",
      borderRadius: 2,
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
    }}>
      <Box sx={{
        display: "flex",
        alignItems: "center",
        mb: 2,
        flexShrink: 0,
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 1, sm: 0 }
      }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PersonAddIcon color="primary" />
          <Typography level="h4" sx={{
            ml: 1,
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            textAlign: { xs: "center", sm: "left" }
          }}>
            New Clients by Practice Area
          </Typography>
        </Box>
      </Box>

      <Box sx={{
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}>
        <Box sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "auto",
          minHeight: 0,
          height: "100%",
          maxHeight: "100%",
          "&::-webkit-scrollbar": { width: "8px", height: "8px" },
          "&::-webkit-scrollbar-track": { background: "var(--joy-palette-neutral-100)" },
          "&::-webkit-scrollbar-thumb": { background: "var(--joy-palette-neutral-300)", borderRadius: "4px" },
          "&::-webkit-scrollbar-thumb:hover": { background: "var(--joy-palette-neutral-400)" }
        }}>
          <Table stickyHeader sx={{
            tableLayout: "auto",
            width: "100%",
            minWidth: "400px",
            "& thead th": {
              backgroundColor: "var(--joy-palette-background-surface)",
              fontWeight: "bold",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              padding: { xs: "8px 6px", sm: "12px 10px" },
              whiteSpace: "nowrap",
              textAlign: "center",
              borderRight: "1px solid var(--joy-palette-neutral-200)"
            },
            "& tbody tr:hover": { backgroundColor: "var(--joy-palette-neutral-50)" },
            "& tbody tr": { transition: "background-color 0.2s ease" },
            "& tbody td": {
              padding: { xs: "8px 6px", sm: "12px 10px" },
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              whiteSpace: "nowrap",
              textAlign: "center",
              verticalAlign: "middle",
              borderRight: "1px solid var(--joy-palette-neutral-200)",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }
          }}>
            <thead>
              <tr>
                <th style={{ position: "sticky", top: 0, backgroundColor: "var(--joy-palette-background-surface)", zIndex: 1, minWidth: "200px", textAlign: "left" }}>
                  Practice Area
                </th>
                <th style={{ position: "sticky", top: 0, backgroundColor: "var(--joy-palette-background-surface)", zIndex: 1, minWidth: "140px" }}>
                  Cases Created
                </th>
              </tr>
            </thead>
            <tbody>
              {practiceAreaData.length > 0 ? (
                practiceAreaData.map((row) => (
                  <tr key={row.practice_area}>
                    <td style={{ textAlign: "left", minWidth: "200px" }}>
                      <Typography level="body-md" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, fontWeight: "500" }}>
                        {row.practice_area}
                      </Typography>
                    </td>
                    <td
                      style={{
                        minWidth: "140px",
                        cursor: onPracticeAreaClick ? "pointer" : "default",
                      }}
                      onClick={(e) => {
                        if (onPracticeAreaClick) {
                          e.preventDefault();
                          e.stopPropagation();
                          onPracticeAreaClick(row.practice_area);
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (onPracticeAreaClick) e.currentTarget.style.backgroundColor = "var(--joy-palette-neutral-50)";
                      }}
                      onMouseLeave={(e) => {
                        if (onPracticeAreaClick) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                      title={onPracticeAreaClick ? "Click to view cases" : ""}
                    >
                      <Typography
                        level="body-md"
                        sx={{
                          fontWeight: "bold",
                          color: "primary.500",
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          cursor: onPracticeAreaClick ? "pointer" : "default",
                          userSelect: "none",
                          "&:hover": onPracticeAreaClick ? { color: "primary.700", textDecoration: "underline" } : {}
                        }}
                      >
                        {row.count}
                      </Typography>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} style={{ textAlign: "center", padding: "2rem" }}>
                    <Typography level="body-md" color="neutral" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                      No cases created in this period
                    </Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Box>
      </Box>
    </Card>
  );
};

export default NewClientsTable;
