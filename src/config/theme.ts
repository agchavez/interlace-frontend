import {createTheme} from '@mui/material/styles'
import { esES } from '@mui/x-date-pickers/locales';

export const maintheme = createTheme({
    typography:{
        button: {
            textTransform: 'none'
        }
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