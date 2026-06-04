import React, { useCallback, useState } from "react";
import { Box, Card, IconButton } from "@mui/joy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

export function useTicketAccordion() {
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const toggle = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isExpanded = useCallback((id) => expandedIds.has(id), [expandedIds]);

  const expand = useCallback((id) => {
    setExpandedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  return { isExpanded, toggle, expand };
}

export default function TicketAccordionItem({
  expanded,
  onToggle,
  header,
  children,
  dull = false,
  highlight = false,
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: "md",
        overflow: "hidden",
        opacity: dull ? 0.72 : 1,
        bgcolor: highlight ? "warning.50" : dull ? "neutral.50" : "background.surface",
        borderColor: highlight ? "warning.400" : dull ? "neutral.200" : "divider",
        borderWidth: highlight ? 2 : 1,
        filter: dull ? "grayscale(0.35)" : "none",
        transition: "opacity 0.2s ease, filter 0.2s ease, border-color 0.2s ease",
        boxShadow: highlight ? "0 0 0 1px var(--joy-palette-warning-200)" : "none",
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 0.5,
          p: 1.5,
          cursor: "pointer",
          userSelect: "none",
          "&:hover": {
            bgcolor: dull ? "neutral.100" : "background.level1",
          },
        }}
      >
        <IconButton
          size="sm"
          variant="plain"
          color="neutral"
          aria-label={expanded ? "Collapse ticket" : "Expand ticket"}
          sx={{ mt: 0.15, flexShrink: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>{header}</Box>
      </Box>
      {expanded && (
        <Box
          sx={{
            px: 2,
            pb: 2,
            pt: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          {children}
        </Box>
      )}
    </Card>
  );
}
