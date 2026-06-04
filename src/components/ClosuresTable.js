import React from "react";
import {
  Box,
  Typography,
  Table,
  Card,
  Chip,
} from "@mui/joy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const isDisabledUser = (user) =>
  user.disabled && String(user.disabled).toLowerCase().trim() === "yes";

const ClosuresTable = ({ 
  attorneys, 
  isExcludedFromClosures, 
  shouldShowGoal, 
  getClosureGoal, 
  timePeriod,
  onClosureCountClick
}) => {
  // Don't show disabled users in the table
  const activeAttorneys = attorneys.filter((a) => !isDisabledUser(a));
  // Sort attorneys by closure count (descending), then by name
  const sortedAttorneys = [...activeAttorneys].sort((a, b) => {
    const aCount = isExcludedFromClosures(a) ? -1 : (a.closureCount || 0);
    const bCount = isExcludedFromClosures(b) ? -1 : (b.closureCount || 0);
    if (aCount !== bCount) {
      return bCount - aCount; // Descending by closure count
    }
    // If same count, sort by name
    return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
  });

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
          <CheckCircleIcon color="primary" />
          <Typography level="h4" sx={{ 
            ml: 1, 
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            textAlign: { xs: "center", sm: "left" }
          }}>
            Case Closures 
          </Typography>
        </Box>
        {shouldShowGoal() && (
          <Typography level="body-sm" color="neutral" sx={{ ml: { xs: 0, sm: 2 }, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
            Goal: {Math.round(getClosureGoal())} closures per {timePeriod}
          </Typography>
        )}
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
            minWidth: "600px",
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
              verticalAlign: "top",
              borderRight: "1px solid var(--joy-palette-neutral-200)",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }
          }}>
            <thead>
              <tr>
                <th style={{ position: "sticky", top: 0, backgroundColor: "var(--joy-palette-background-surface)", zIndex: 1, minWidth: "60px", width: "60px" }}>
                  Rank
                </th>
                <th style={{ position: "sticky", top: 0, backgroundColor: "var(--joy-palette-background-surface)", zIndex: 1, minWidth: "200px", width: "200px" }}>
                  Attorney Name
                </th>
                <th style={{ position: "sticky", top: 0, backgroundColor: "var(--joy-palette-background-surface)", zIndex: 1, minWidth: "120px" }}>
                  Closure Count
                </th>
                <th style={{ position: "sticky", top: 0, backgroundColor: "var(--joy-palette-background-surface)", zIndex: 1, minWidth: "80px" }}>
                  Score
                </th>
                {shouldShowGoal() && (
                  <th style={{ position: "sticky", top: 0, backgroundColor: "var(--joy-palette-background-surface)", zIndex: 1, minWidth: "120px" }}>
                    Goal
                  </th>
                )}
                {shouldShowGoal() && (
                  <th style={{ position: "sticky", top: 0, backgroundColor: "var(--joy-palette-background-surface)", zIndex: 1, minWidth: "140px" }}>
                    Status
                  </th>
                )}
                <th style={{ position: "sticky", top: 0, backgroundColor: "var(--joy-palette-background-surface)", zIndex: 1, minWidth: "140px" }}>
                  Performance
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAttorneys.length > 0 ? (
                sortedAttorneys.map((attorney, index) => {
                  const isExcluded = isExcludedFromClosures(attorney);
                  const closureCount = attorney.closureCount || 0;
                  const goal = getClosureGoal();
                  const meetsGoal = !isExcluded && closureCount >= goal;
                  // Calculate score: (closureCount / goal) * 100, capped at 100%
                  const score = isExcluded || goal === 0 ? 0 : Math.min(Math.round((closureCount / goal) * 100), 100);
                  // Get score color: green for 100+, yellow for 80-99, red for <80
                  const scoreColor = score >= 100 ? "success.500" : score >= 80 ? "warning.500" : "danger.500";
                  
                  return (
                    <tr key={attorney.staff_id}>
                      <td style={{ width: "60px" }}>
                        <Typography level="body-md" sx={{ fontWeight: "bold", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                          #{index + 1}
                        </Typography>
                      </td>
                      <td style={{ width: "200px", textAlign: "left" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                          <Typography level="body-md" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, fontWeight: "bold" }}>
                            {attorney.first_name} {attorney.last_name}
                          </Typography>
                          <Typography level="body-sm" color="neutral" sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}>
                            {attorney.title || attorney.type || "Attorney"}
                          </Typography>
                        </Box>
                      </td>
                      <td 
                        style={{ 
                          width: "120px",
                          cursor: !isExcluded && onClosureCountClick ? "pointer" : "default",
                          position: "relative"
                        }}
                        onClick={(e) => {
                          if (!isExcluded && onClosureCountClick) {
                            e.preventDefault();
                            e.stopPropagation();
                            onClosureCountClick(attorney);
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (!isExcluded && onClosureCountClick) {
                            e.currentTarget.style.backgroundColor = "var(--joy-palette-neutral-50)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isExcluded && onClosureCountClick) {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }
                        }}
                        title={!isExcluded && onClosureCountClick ? "Click to view closure cases" : ""}
                      >
                        {isExcluded ? (
                          <Typography 
                            level="body-md" 
                            sx={{ 
                              fontWeight: "bold",
                              color: "neutral.500",
                              fontSize: { xs: "0.75rem", sm: "0.875rem" }
                            }}
                          >
                            --
                          </Typography>
                        ) : (
                          <Typography 
                            level="body-md" 
                            sx={{ 
                              fontWeight: "bold",
                              color: meetsGoal ? "success.500" : "danger.500",
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              cursor: "pointer",
                              userSelect: "none",
                              pointerEvents: "none",
                              "&:hover": {
                                color: meetsGoal ? "success.700" : "danger.700",
                                textDecoration: "underline"
                              }
                            }}
                          >
                            {closureCount}
                          </Typography>
                        )}
                      </td>
                      <td style={{ width: "80px" }}>
                        {isExcluded ? (
                          <Typography 
                            level="body-md" 
                            sx={{ 
                              color: "neutral.500",
                              fontSize: { xs: "0.75rem", sm: "0.875rem" }
                            }}
                          >
                            --
                          </Typography>
                        ) : (
                          <Typography 
                            level="body-md" 
                            sx={{ 
                              fontWeight: "bold",
                              color: scoreColor,
                              fontSize: { xs: "0.75rem", sm: "0.875rem" }
                            }}
                          >
                            {score}%
                          </Typography>
                        )}
                      </td>
                      {shouldShowGoal() && (
                        <td style={{ width: "120px" }}>
                          {isExcluded ? (
                            <Typography 
                              level="body-sm" 
                              sx={{ 
                                color: "neutral.500",
                                fontSize: { xs: "0.75rem", sm: "0.875rem" }
                              }}
                            >
                              --
                            </Typography>
                          ) : (
                            <Typography 
                              level="body-sm" 
                              sx={{ 
                                fontWeight: "bold",
                                fontSize: { xs: "0.75rem", sm: "0.875rem" }
                              }}
                            >
                              {Math.round(goal)}
                            </Typography>
                          )}
                        </td>
                      )}
                      {shouldShowGoal() && (
                        <td style={{ width: "140px" }}>
                          {isExcluded ? (
                            <Typography 
                              level="body-sm" 
                              sx={{ 
                                color: "neutral.500",
                                fontSize: { xs: "0.75rem", sm: "0.875rem" }
                              }}
                            >
                              --
                            </Typography>
                          ) : (
                            <Chip
                              color={meetsGoal ? "success" : "danger"}
                              variant="soft"
                              size="sm"
                              sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
                            >
                              {meetsGoal ? "✓ Goal Met" : `Goal: ${Math.round(goal)}`}
                            </Chip>
                          )}
                        </td>
                      )}
                      <td style={{ width: "140px" }}>
                        {isExcluded ? (
                          <Typography 
                            level="body-sm" 
                            sx={{ 
                              color: "neutral.500",
                              fontSize: { xs: "0.75rem", sm: "0.875rem" }
                            }}
                          >
                            --
                          </Typography>
                        ) : (
                          <Chip
                            color={meetsGoal ? "success" : "danger"}
                            variant="soft"
                            size="sm"
                            sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
                          >
                            {meetsGoal ? "Excellent" : "Needs Improvement"}
                          </Chip>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={shouldShowGoal() ? 7 : 5} style={{ textAlign: "center", padding: "2rem" }}>
                    <Typography level="body-md" color="neutral" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                      No attorney data available
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

export default ClosuresTable;


