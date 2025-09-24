'use client';

import { createTheme } from '@mui/material/styles';

// Create a function that returns theme based on mode
export const getMaterialTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#3b82f6', // Blue-500 to match your existing blue theme
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#8b5cf6', // Purple-500
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    background: {
      default: mode === 'dark' ? '#0f172a' : '#ffffff', // Slate-900 for dark, white for light
      paper: mode === 'dark' ? '#1e293b' : '#f8fafc',   // Slate-800 for dark, slate-50 for light
    },
    text: {
      primary: mode === 'dark' ? '#f8fafc' : '#0f172a',     // Light text on dark, dark text on light
      secondary: mode === 'dark' ? '#cbd5e1' : '#475569',   // Secondary text colors
    },
    divider: mode === 'dark' ? '#374151' : '#e5e7eb', // Gray-700 for dark, gray-200 for light
    success: {
      main: '#10b981', // Emerald-500
    },
    warning: {
      main: '#f59e0b', // Amber-500
    },
    info: {
      main: '#06b6d4', // Cyan-500
    },
    error: {
      main: '#ef4444', // Red-500
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'dark' ? '#1e293b' : '#ffffff',
          backgroundImage: 'none',
          color: mode === 'dark' ? '#f8fafc' : '#0f172a',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#1e293b' : '#f8fafc',
          backgroundImage: 'none',
          color: mode === 'dark' ? '#f8fafc' : '#0f172a',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            color: mode === 'dark' ? '#cbd5e1' : '#475569',
            '&.Mui-focused': {
              color: '#3b82f6',
            },
          },
          '& .MuiOutlinedInput-root': {
            backgroundColor: mode === 'dark' ? '#374151' : '#ffffff',
            color: mode === 'dark' ? '#f8fafc' : '#0f172a',
            '& fieldset': {
              borderColor: mode === 'dark' ? '#4b5563' : '#d1d5db',
            },
            '&:hover fieldset': {
              borderColor: mode === 'dark' ? '#6b7280' : '#9ca3af',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3b82f6',
            },
            '& input': {
              color: mode === 'dark' ? '#f8fafc' : '#0f172a',
              backgroundColor: 'transparent',
            },
            '& textarea': {
              color: mode === 'dark' ? '#f8fafc' : '#0f172a',
              backgroundColor: 'transparent',
            },
          },
          '& .MuiFormHelperText-root': {
            color: mode === 'dark' ? '#94a3b8' : '#6b7280',
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            color: mode === 'dark' ? '#cbd5e1' : '#475569',
            '&.Mui-focused': {
              color: '#3b82f6',
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#374151' : '#ffffff',
          color: mode === 'dark' ? '#f8fafc' : '#0f172a',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'dark' ? '#4b5563' : '#d1d5db',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'dark' ? '#6b7280' : '#9ca3af',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3b82f6',
          },
          '& input': {
            color: mode === 'dark' ? '#f8fafc' : '#0f172a',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#374151' : '#ffffff',
          color: mode === 'dark' ? '#f8fafc' : '#0f172a',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'dark' ? '#4b5563' : '#d1d5db',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'dark' ? '#6b7280' : '#9ca3af',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3b82f6',
          },
          '& .MuiSelect-select': {
            backgroundColor: mode === 'dark' ? '#374151' : '#ffffff',
            color: mode === 'dark' ? '#f8fafc' : '#0f172a',
          },
          '& .MuiSelect-icon': {
            color: mode === 'dark' ? '#cbd5e1' : '#475569',
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'dark' ? '#1f2937' : '#ffffff',
          color: mode === 'dark' ? '#f8fafc' : '#0f172a',
          boxShadow: mode === 'dark' ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#1f2937' : '#ffffff',
          color: mode === 'dark' ? '#f8fafc' : '#0f172a',
          '&:hover': {
            backgroundColor: mode === 'dark' ? '#374151' : '#f3f4f6',
          },
          '&.Mui-selected': {
            backgroundColor: mode === 'dark' ? '#3b82f6' : '#dbeafe',
            '&:hover': {
              backgroundColor: mode === 'dark' ? '#2563eb' : '#bfdbfe',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});