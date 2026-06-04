import React from "react";
import { Card, CardContent } from "@mui/joy";
import { Button, Typography, Box, Divider, Table } from "@mui/joy";
import { Grid } from "@mui/joy";
import { CalendarMonth, AttachMoney, Timer, Receipt, CreditCard, RequestPage } from "@mui/icons-material";

const BillingDashboard = () => {
  return (
    <Box p={3}>
      <Grid container spacing={2}>
        {/* Billing Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography level="h5">Billing Actions</Typography>
              <Grid container spacing={2} mt={2}>
                {[
                  { icon: <Receipt />, label: "Create Invoice" },
                  { icon: <AttachMoney />, label: "Record Payment" },
                  { icon: <Timer />, label: "Add Time Entry" },
                  { icon: <CreditCard />, label: "Deposit Into Trust" },
                  { icon: <RequestPage />, label: "Request Funds" },
                ].map((action, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Button fullWidth startDecorator={action.icon}>
                      {action.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography level="h5">Recent Activity</Typography>
              <Divider />
              <Box mt={2}>
                <Typography>
                  <b>Jennifer Dougherty</b> added a time entry for Email & task about 2 hours ago.
                </Typography>
                <Typography>
                  <b>Cora Travis</b> added a time entry for Email to EMS about 5 hours ago.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* My Timesheet */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography level="h5">My Timesheet</Typography>
              <Box mt={2}>
                <Button variant="soft" fullWidth>By Week</Button>
              </Box>
              <Table borderAxis="both">
                <thead>
                  <tr>
                    <th>Billable</th>
                    <th>Non-Billable</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>0.0</td>
                    <td>0.0</td>
                    <td>$0.00</td>
                  </tr>
                </tbody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BillingDashboard;
