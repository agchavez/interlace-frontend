import {createTheme} from '@mui/material/styles'

export const maintheme = createTheme({
    typography:{
        button: {
            textTransform: 'none'
        }
    },
    palette: {
        primary: {
            main:'#e7cf0f'
        },
        secondary: {
            main: '#110f0d'
        }
    }
})