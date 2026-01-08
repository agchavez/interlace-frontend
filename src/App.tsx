
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
import { SidebarProvider } from './modules/ui/context/SidebarContext';
import { useEffect } from 'react';


import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { pdfjs } from 'react-pdf';
import PWANotificationManager from './modules/ui/components/PWANotificationManager';
import { registerPushServiceWorker } from './utils/registerPushSW';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function App() {
  // Registrar el service worker de push al cargar la app
  useEffect(() => {
    registerPushServiceWorker();
  }, []);
  return (
    <ThemeProvider theme={maintheme}>
      <Provider store={store}>
      <LocalizationProvider dateAdapter={AdapterDateFns} localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText} adapterLocale={es}>
        <BrowserRouter>
        <SidebarProvider defaultCollapsed={false}>
        <Toaster duration={3000} position="top-right" richColors closeButton />
          <AppRouter />

          {/* PWA: Instalación y Notificaciones Push */}
          <PWANotificationManager />
        </SidebarProvider>
        </BrowserRouter>
        </LocalizationProvider>
      </Provider>
    </ThemeProvider>
  )
}

export default App
