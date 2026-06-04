import React from "react";
import { FormControl, FormLabel, Input, Textarea, Select, Option, Stack } from "@mui/joy";

export default function CategoryTemplateFields({ fields, values, onChange }) {
  if (!fields?.length) return null;

  return (
    <Stack spacing={1.5}>
      {fields.map((field) => {
        const val = values?.[field.name] ?? "";
        const setVal = (v) => onChange({ ...values, [field.name]: v });

        if (field.type === "textarea") {
          return (
            <FormControl key={field.name} required={field.required}>
              <FormLabel>{field.label}</FormLabel>
              <Textarea
                minRows={2}
                value={val}
                onChange={(e) => setVal(e.target.value)}
              />
            </FormControl>
          );
        }
        if (field.type === "select" && Array.isArray(field.options)) {
          return (
            <FormControl key={field.name} required={field.required}>
              <FormLabel>{field.label}</FormLabel>
              <Select value={val || null} onChange={(_, v) => setVal(v || "")}>
                {field.options.map((opt) => (
                  <Option key={opt} value={opt}>
                    {opt}
                  </Option>
                ))}
              </Select>
            </FormControl>
          );
        }
        return (
          <FormControl key={field.name} required={field.required}>
            <FormLabel>{field.label}</FormLabel>
            <Input value={val} onChange={(e) => setVal(e.target.value)} />
          </FormControl>
        );
      })}
    </Stack>
  );
}
