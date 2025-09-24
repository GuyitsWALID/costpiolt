'use client';

import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from '@/components/theme-provider';
import { getMaterialTheme } from '@/theme/materialTheme';

interface MaterialThemeProviderProps {
  children: React.ReactNode;
}

export function MaterialThemeProvider({ children }: MaterialThemeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const themeContext = useTheme();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }
  
  // Use the current theme mode, fallback to dark if not available
  const currentMode = themeContext?.theme === 'light' ? 'light' : 'dark';
  const currentTheme = getMaterialTheme(currentMode);
  
  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}