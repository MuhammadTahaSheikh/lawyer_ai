import React, { createContext, useState, useEffect } from "react";
import { CssVarsProvider, useColorScheme, extendTheme } from "@mui/joy";

// Create a custom theme
const customTheme = extendTheme({
  components: {
    JoyCard: {
      styleOverrides: {
        root: {
          '--Card-padding': '0.5rem',
          padding: '0.5rem',
        },
      },
    },
  },
});

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  return (
    <CssVarsProvider theme={customTheme}>
      <ThemeProviderInternal>{children}</ThemeProviderInternal>
    </CssVarsProvider>
  );
};

const ThemeProviderInternal = ({ children }) => {
  const { mode, setMode } = useColorScheme();
  const storedTheme = localStorage.getItem("theme") || "light";

  useEffect(() => {
    setMode(storedTheme);
  }, [storedTheme, setMode]);

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("theme", newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;