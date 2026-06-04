import * as React from "react";
import { Box, Card, Typography, Button, Stack, CircularProgress } from "@mui/joy";
import axios from "axios";
import { useState, useEffect } from "react";

export default function Info({ case_id_time, cases }) {
  const [billable, setBillAble] = useState("");
  const [billableTime, setBillAbleTime] = useState("");
  const [loadingExpenses, setLoadingExpenses] = useState(true); // Track loading for expenses
  const [loadingTimeEntries, setLoadingTimeEntries] = useState(true); // Track loading for time entries

  const fetchExpenses = async () => {
    try {
      const response = await axios.get("/expenses", {
        params: {
          case_id: case_id_time,
        },
      });
      setBillAble(response?.data?.costSummary);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoadingExpenses(false); // Set loading to false after fetch is done
    }
  };

  const fetchTimeEntries = async () => {
    try {
      const response = await axios.get("/time_entries", {
        params: {
          case_id: case_id_time,
        },
      });
      setBillAbleTime(response?.data?.rateSummary);
    } catch (error) {
      console.error("Error fetching time entries:", error);
    } finally {
      setLoadingTimeEntries(false); // Set loading to false after fetch is done
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchTimeEntries();
  }, []);

  const sum =
    (billable?.total_cost_units || 0) + (billableTime?.total_rate_hours || 0);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
        gap: 2,
        p: 2,
      }}
    >
      {/* Un-Invoiced Balances */}
      <Card variant="outlined" sx={{ p: 2, minWidth: 300 }}>
        <Typography level="h4">Un-Invoiced Balances</Typography>
        {loadingExpenses ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100px", // Height of the loader area
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography
              level="h2"
              sx={{
                mt: 1,
                display: "inline-block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                position: "relative",
                cursor: "pointer",
              }}
            >
              Total:{" "}
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(
                (Number(billableTime?.total_rate_hours) || 0) +
                  (Number(billable?.total_cost_units) || 0)
              )}
            </Typography>
            {/* <Button variant="outlined" sx={{ mt: 1, width: "100%" }}>
              Setup Case Billing Information
            </Button> */}
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Typography>
                Time Entries:{" "}
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(billableTime?.total_rate_hours)}
              </Typography>
              <Typography>
                Expenses:{" "}
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(billable?.total_cost_units)}
              </Typography>
            </Stack>
          </>
        )}
      </Card>

      {/* Case Billing Totals */}
      {/* <Card variant="outlined" sx={{ p: 2, minWidth: 300 }}>
        <Typography level="h4">Case Billing Totals</Typography>
        <Typography>Total Amount Collected: $0.00</Typography>
        <Typography>Invoices Awaiting Payment: $0.00</Typography>
        <Typography level="h2" sx={{ mt: 1 }}>
          Total Invoiced Amount: $0.00
        </Typography>
      </Card> */}

      {/* Trust Balances */}
      {/* <Card variant="outlined" sx={{ p: 2, minWidth: 300 }}>
        <Typography level="h4">Trust Balances</Typography>
        <Typography>Case Trust Balance (Allocated): $0.00</Typography>
        <Typography>Client Trust Balance (Unallocated): $0.00</Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mt: 2 }}
        >
          <Button variant="outlined" fullWidth>
            Request Funds
          </Button>
          <Button variant="outlined" fullWidth>
            Deposit into Trust
          </Button>
        </Stack>
      </Card> */}

      {/* Running Trust Balance */}
      {/* <Card variant="outlined" sx={{ p: 2, minWidth: 300 }}>
        <Typography level="h4">Running Trust Balance</Typography>
        <Typography>Available Trust Balance: $0.00</Typography>
        <Typography>Un-Invoiced Balance: -$5,462.50</Typography>
        <Typography level="h4" sx={{ mt: 1, color: "red" }}>
          Running Trust Balance: -$5,462.50
        </Typography>
      </Card> */}

      {/* <Card variant="outlined" sx={{ p: 2, minWidth: 300 }}>
        <Typography level="h4">Case Billing Information</Typography>

     
          <>
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Typography>Fee Structure</Typography>
              <Typography>Billing Contact</Typography>
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mt: 2 }}
            >
              <Button variant="outlined" fullWidth>
                Edit
              </Button>
              <Button variant="outlined" fullWidth>
                Change Case Rate
              </Button>
            </Stack>
          </>
       
      </Card> */}
    </Box>
  );
}
