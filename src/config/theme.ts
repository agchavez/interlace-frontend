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
            main:'#dcbb20',
        },
        secondary: {
            main: '#1c2536'
        },
    },
}, esES)    