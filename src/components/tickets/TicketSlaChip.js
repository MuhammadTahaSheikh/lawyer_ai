import React from "react";
import { Chip, Stack, Typography } from "@mui/joy";
import { slaChipProps } from "../../utils/ticketConstants";

export default function TicketSlaChip({ ticket }) {
  if (!ticket) return null;
  const first = slaChipProps(ticket.sla_first_status);
  const resolve = slaChipProps(ticket.sla_resolve_status);

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
      <Chip size="sm" color={first.color} variant="soft">
        First response: {first.label}
      </Chip>
      <Chip size="sm" color={resolve.color} variant="soft">
        Resolution: {resolve.label}
      </Chip>
      {ticket.sla_first_due && (
        <Typography level="body-xs" sx={{ color: "neutral.500", alignSelf: "center" }}>
          Due {new Date(ticket.sla_first_due).toLocaleString()}
        </Typography>
      )}
    </Stack>
  );
}
