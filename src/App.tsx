
import './style/index.scss';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { AppRouter } from './router/AppRouter';
import { Provider } from 'react-redux';
import { store } from './store';
import { BrowserRouter } from 'react-router-dom';
import { maintheme } from './config/theme';
import { ThemeProvider } from '@emotion/react';
import { Toaster } from 'sonner'
import { LocalizationProvider, esES } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { es } from 'date-fns/locale';

function App() {
  return (
    <ThemeProvider theme={maintheme}>
      <Provider store={store}>
      <LocalizationProvider dateAdapter={AdapterDateFns} localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText} adapterLocale={es}>  
        <BrowserRouter>
        <Toaster duration={3000} position="top-right" richColors closeButton />
          <AppRouter />
        </BrowserRouter>
        </LocalizationProvider>
      </Provider>
    </ThemeProvider>
  )
}

export default App
