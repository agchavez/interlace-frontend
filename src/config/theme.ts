import {createTheme} from '@mui/material/styles'

export const maintheme = createTheme({
    typography:{
        button: {
            textTransform: 'none'
        }
    },
    palette: {
        primary: {
            main:'#dcbb20'
        },
        secondary: {
            main: '#110f0d'
        }
    }
})