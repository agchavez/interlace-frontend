import {createTheme} from '@mui/material/styles'
import { esES } from '@mui/x-date-pickers/locales';

export const maintheme = createTheme({
    typography:{
        fontFamily: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
        h1: {
            fontWeight: 700,
        },
        h2: {
            fontWeight: 700,
        },
        h3: {
            fontWeight: 600,
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
    },
    palette: {
        primary: {
            main:'#1976d2',
        },
        secondary: {
            main: '#1c2536'
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    textTransform: 'none',
                    borderRadius: 8, // 3 * 4px = 12px
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius:8, // 4 * 4px = 16px
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        fontFamily: 'Inter',
                    },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontFamily: 'Inter',
                },
            },
        },
        MuiAutocomplete: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        fontFamily: 'Inter',
                    },
                },
                paper: {
                    borderRadius: 8,
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontFamily: 'Inter',
                    fontWeight: 500,
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontFamily: 'Inter',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16
                }
            }
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    color:'#1c2536',
                    borderRadius:8
                }
            }
        }
    },
}, esES)    