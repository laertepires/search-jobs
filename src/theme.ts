'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-manrope)',
    fontSize: 14,
    h4: {
      fontSize: '1.75rem',
    },
    h5: {
      fontSize: '1.25rem',
    },
    button: {
      fontWeight: 800,
      textTransform: 'uppercase',
    },
  },
  palette: {
    primary: {
      main: '#1976D2',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
    },
    divider: 'rgba(148, 163, 184, 0.26)',
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          color: '#0F172A',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          paddingInline: 20,
        },
        contained: {
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          paddingBlock: 6,
        },
      },
    },
  },
});

export default theme;
