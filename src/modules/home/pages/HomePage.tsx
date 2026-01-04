import {
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TableCell,
  TableBody,
  styled,
  tableCellClasses,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Switch,
  FormControlLabel,
  Box,
  SpeedDial,
  SpeedDialAction,
  LinearProgress,
  Avatar,
  AvatarGroup,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useAppSelector } from '../../../store/store';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import image from '../../../assets/layout.png';
import { useGetdashboardQuery } from '../../../store/auth/authApi';
import { useState, useEffect, useRef, useMemo } from 'react';
import { DashboardQueryParams } from '../../../interfaces/login';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { format, formatDistanceToNow, formatDuration } from 'date-fns';
import { es } from 'date-fns/locale';
import { GridFilterListIcon } from '@mui/x-data-grid';
import { setDashboardQueryParams } from '../../../store/ui/uiSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import TATGraph from '../components/TATGraph';
import { Responsive as ResponsiveGridLayout } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import BootstrapDialogTitle from '../../ui/components/BootstrapDialogTitle';
import RefreshIcon from '@mui/icons-material/Refresh';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import GroupsIcon from '@mui/icons-material/Groups';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CloseIcon from '@mui/icons-material/Close';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import {
  useGetPersonnelDashboardQuery,
  useGetCertificationsExpiringQuery,
  useGetPersonnelProfilesQuery,
} from '../../../modules/personnel/services/personnelApi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

enum FilterDate {
  TODAY = 'Hoy',
  WEEK = 'Esta semana',
  MONTH = 'Este mes',
  YEAR = 'Este año',
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#f3f4f6',
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

// Tipos de widgets disponibles
enum WidgetType {
  WELCOME = 'WELCOME',
  TAT = 'TAT',
  PENDING_TRACKERS = 'PENDING_TRACKERS',
  COMPLETED_TRACKERS = 'COMPLETED_TRACKERS',
  TAT_GRAPH = 'TAT_GRAPH',
  PERSONNEL_STATS = 'PERSONNEL_STATS',
  CERTIFICATIONS_EXPIRING = 'CERTIFICATIONS_EXPIRING',
  PERSONNEL_NEW = 'PERSONNEL_NEW',
  PERSONNEL_HIERARCHY = 'PERSONNEL_HIERARCHY',
  PERSONNEL_BY_AREA = 'PERSONNEL_BY_AREA',
  MY_PERFORMANCE = 'MY_PERFORMANCE',
  MY_HISTORY = 'MY_HISTORY',
}

interface WidgetDefinition {
  id: WidgetType;
  title: string;
  icon: JSX.Element;
  requiredPermission?: string;
}

const AVAILABLE_WIDGETS: WidgetDefinition[] = [
  {
    id: WidgetType.WELCOME,
    title: 'Bienvenida',
    icon: <Box component="img" src={image} alt="layout" width={24} />,
  },
  {
    id: WidgetType.TAT,
    title: 'Tiempo Promedio (TAT)',
    icon: <AccessTimeIcon />,
    requiredPermission: 'tracker.view_trackermodel',
  },
  {
    id: WidgetType.PENDING_TRACKERS,
    title: 'Pendientes',
    icon: <ArrowForwardIcon />,
    requiredPermission: 'tracker.view_trackermodel',
  },
  {
    id: WidgetType.COMPLETED_TRACKERS,
    title: 'Completados',
    icon: <ArrowForwardIcon />,
    requiredPermission: 'tracker.view_trackermodel',
  },
  {
    id: WidgetType.TAT_GRAPH,
    title: 'Gráfico TAT',
    icon: <TrendingUpIcon />,
    requiredPermission: 'tracker.view_trackermodel',
  },
  {
    id: WidgetType.PERSONNEL_STATS,
    title: 'Estadísticas Personal',
    icon: <GroupsIcon />,
    requiredPermission: 'personnel.view_personnelprofile',
  },
  {
    id: WidgetType.CERTIFICATIONS_EXPIRING,
    title: 'Certificaciones por Vencer',
    icon: <WorkspacePremiumIcon />,
    requiredPermission: 'personnel.view_certification',
  },
  {
    id: WidgetType.PERSONNEL_NEW,
    title: 'Nuevos Ingresos',
    icon: <PersonAddIcon />,
    requiredPermission: 'personnel.view_personnelprofile',
  },
  {
    id: WidgetType.PERSONNEL_HIERARCHY,
    title: 'Por Jerarquía',
    icon: <BarChartIcon />,
    requiredPermission: 'personnel.view_personnelprofile',
  },
  {
    id: WidgetType.PERSONNEL_BY_AREA,
    title: 'Por Área',
    icon: <PieChartIcon />,
    requiredPermission: 'personnel.view_personnelprofile',
  },
  {
    id: WidgetType.MY_PERFORMANCE,
    title: 'Mi Desempeño',
    icon: <TrendingUpIcon />,
    requiredPermission: 'personnel.view_performancemetric',
  },
  {
    id: WidgetType.MY_HISTORY,
    title: 'Mi Historial',
    icon: <AccessTimeIcon />,
  },
];

// Layouts por defecto para diferentes breakpoints
const DEFAULT_LAYOUTS = {
  lg: [
    { i: WidgetType.WELCOME, x: 0, y: 0, w: 4, h: 1, minW: 2, minH: 1, maxH: 2 },
    { i: WidgetType.TAT, x: 4, y: 0, w: 4, h: 1, minW: 2, minH: 1, maxH: 3 },
    { i: WidgetType.PENDING_TRACKERS, x: 0, y: 2, w: 6, h: 4, minW: 4, minH: 3 },
    { i: WidgetType.COMPLETED_TRACKERS, x: 6, y: 2, w: 6, h: 4, minW: 4, minH: 3 },
    { i: WidgetType.TAT_GRAPH, x: 0, y: 6, w: 12, h: 1, minW: 6, minH: 1 },
    { i: WidgetType.PERSONNEL_STATS, x: 0, y: 10, w: 4, h: 3, minW: 3, minH: 3 },
    { i: WidgetType.CERTIFICATIONS_EXPIRING, x: 4, y: 10, w: 4, h: 3, minW: 3, minH: 3 },
    { i: WidgetType.PERSONNEL_NEW, x: 8, y: 10, w: 4, h: 3, minW: 3, minH: 3 },
    { i: WidgetType.PERSONNEL_HIERARCHY, x: 0, y: 13, w: 6, h: 4, minW: 6, minH: 3 },
    { i: WidgetType.PERSONNEL_BY_AREA, x: 6, y: 13, w: 6, h: 4, minW: 6, minH: 3 },
    { i: WidgetType.MY_PERFORMANCE, x: 0, y: 17, w: 6, h: 3, minW: 4, minH: 3 },
    { i: WidgetType.MY_HISTORY, x: 6, y: 17, w: 6, h: 3, minW: 4, minH: 3 },
  ],
  md: [
    { i: WidgetType.WELCOME, x: 0, y: 0, w: 4, h: 1, minW: 2, minH: 1, maxH: 2 },
    { i: WidgetType.TAT, x: 4, y: 0, w: 4, h: 1, minW: 2, minH: 1, maxH: 3 },
    { i: WidgetType.PENDING_TRACKERS, x: 0, y: 2, w: 6, h: 4, minW: 4, minH: 3 },
    { i: WidgetType.COMPLETED_TRACKERS, x: 6, y: 2, w: 6, h: 4, minW: 4, minH: 3 },
    { i: WidgetType.TAT_GRAPH, x: 0, y: 6, w: 12, h: 2, minW: 6, minH: 1 },
    { i: WidgetType.PERSONNEL_STATS, x: 0, y: 10, w: 6, h: 3, minW: 4, minH: 3 },
    { i: WidgetType.CERTIFICATIONS_EXPIRING, x: 6, y: 10, w: 6, h: 3, minW: 4, minH: 3 },
    { i: WidgetType.PERSONNEL_NEW, x: 0, y: 13, w: 6, h: 3, minW: 4, minH: 3 },
    { i: WidgetType.PERSONNEL_HIERARCHY, x: 6, y: 13, w: 6, h: 4, minW: 4, minH: 3 },
    { i: WidgetType.PERSONNEL_BY_AREA, x: 0, y: 17, w: 6, h: 4, minW: 4, minH: 3 },
    { i: WidgetType.MY_PERFORMANCE, x: 6, y: 17, w: 6, h: 3, minW: 4, minH: 3 },
    { i: WidgetType.MY_HISTORY, x: 0, y: 20, w: 6, h: 3, minW: 4, minH: 3 },
  ],
  sm: [
    { i: WidgetType.WELCOME, x: 0, y: 0, w: 6, h: 1 },
    { i: WidgetType.TAT, x: 0, y: 1, w: 6, h: 1 },
    { i: WidgetType.PENDING_TRACKERS, x: 0, y: 4, w: 6, h: 4 },
    { i: WidgetType.COMPLETED_TRACKERS, x: 0, y: 8, w: 6, h: 4 },
    { i: WidgetType.TAT_GRAPH, x: 0, y: 12, w: 6, h: 2 },
    { i: WidgetType.PERSONNEL_STATS, x: 0, y: 16, w: 6, h: 3 },
    { i: WidgetType.CERTIFICATIONS_EXPIRING, x: 0, y: 19, w: 6, h: 3 },
    { i: WidgetType.PERSONNEL_NEW, x: 0, y: 22, w: 6, h: 3 },
    { i: WidgetType.PERSONNEL_HIERARCHY, x: 0, y: 25, w: 6, h: 4 },
    { i: WidgetType.PERSONNEL_BY_AREA, x: 0, y: 29, w: 6, h: 4 },
    { i: WidgetType.MY_PERFORMANCE, x: 0, y: 33, w: 6, h: 3 },
    { i: WidgetType.MY_HISTORY, x: 0, y: 36, w: 6, h: 3 },
  ],
};

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  const { user } = useAppSelector((state) => state.auth);
  const { dashboardQueryParams } = useAppSelector((state) => state.ui);

  // Obtener permisos del usuario
  const userPermissions = user?.permissions || user?.list_permissions || [];

  const [query, setQuery] = useState<DashboardQueryParams>(dashboardQueryParams);
  const { data, isLoading, isFetching, refetch } = useGetdashboardQuery(query, {
    skip: !userPermissions.includes('tracker.view_trackermodel'),
  });
  const availableWidgetsForUser = AVAILABLE_WIDGETS.filter((widget) => {
    if (!widget.requiredPermission) return true;
    return userPermissions.includes(widget.requiredPermission);
  });

  // Cargar layouts desde localStorage o usar DEFAULT_LAYOUTS
  const [layouts, setLayouts] = useState<{ lg: Layout; md: Layout; sm: Layout }>(() => {
    try {
      const saved = localStorage.getItem('dashboardLayouts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lg && parsed.md && parsed.sm) {
          // Verificar si los layouts guardados tienen las propiedades actualizadas
          const welcomeLayout = parsed.lg.find((l: Layout) => l.i === WidgetType.WELCOME);

          // Si WELCOME no tiene maxH o tiene altura mayor a 1, limpiar y usar defaults nuevos
          if (!welcomeLayout || !welcomeLayout.hasOwnProperty('maxH') || welcomeLayout.h > 1) {
            console.log('⚠️ Layouts antiguos detectados, limpiando y usando nuevos defaults...');
            localStorage.removeItem('dashboardLayouts');
            return DEFAULT_LAYOUTS;
          }

          console.log('✅ Layouts cargados al inicializar:', {
            lg: parsed.lg.length,
            md: parsed.md.length,
            sm: parsed.sm.length,
          });
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error cargando layouts:', error);
    }
    console.log('📐 Usando DEFAULT_LAYOUTS al inicializar');
    return DEFAULT_LAYOUTS;
  });

  const [enabledWidgets, setEnabledWidgets] = useState<WidgetType[]>(() => {
    const permissions = user?.permissions || user?.list_permissions || [];

    // Función para obtener widgets por defecto según permisos
    const getDefaultWidgets = () => {
      const defaultWidgets: WidgetType[] = [WidgetType.WELCOME, WidgetType.MY_HISTORY];

      // Agregar widgets de Tracker si tiene permiso
      if (permissions.includes('tracker.view_trackermodel')) {
        defaultWidgets.push(
          WidgetType.TAT,
          WidgetType.PENDING_TRACKERS,
          WidgetType.COMPLETED_TRACKERS,
          WidgetType.TAT_GRAPH
        );
      }

      // Agregar widgets de Personal si tiene permiso
      if (permissions.includes('personnel.view_personnelprofile')) {
        defaultWidgets.push(
          WidgetType.PERSONNEL_STATS,
          WidgetType.PERSONNEL_NEW,
          WidgetType.PERSONNEL_HIERARCHY,
          WidgetType.PERSONNEL_BY_AREA
        );
      }

      // Agregar widget de certificaciones si tiene permiso
      if (permissions.includes('personnel.view_certification')) {
        defaultWidgets.push(WidgetType.CERTIFICATIONS_EXPIRING);
      }

      // Agregar widget de desempeño si tiene permiso
      if (permissions.includes('personnel.view_performancemetric')) {
        defaultWidgets.push(WidgetType.MY_PERFORMANCE);
      }

      return defaultWidgets;
    };

    try {
      const savedWidgets = localStorage.getItem('dashboardEnabledWidgets');
      if (savedWidgets) {
        const parsed = JSON.parse(savedWidgets);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((widgetId: WidgetType) => {
            const widget = AVAILABLE_WIDGETS.find((w) => w.id === widgetId);
            if (!widget) return false;
            if (!widget.requiredPermission) return true;
            return permissions.includes(widget.requiredPermission);
          });
          console.log(`✅ Widgets cargados desde localStorage: ${filtered.length} widgets`);
          return filtered;
        } else {
          console.warn('⚠️ savedWidgets no es un array, usando defaults');
        }
      } else {
        console.log('ℹ️ No hay widgets guardados, usando defaults');
      }
    } catch (error) {
      console.error('❌ Error parsing dashboardEnabledWidgets from localStorage:', error);
      localStorage.removeItem('dashboardEnabledWidgets');
    }

    const defaultWidgets = getDefaultWidgets();
    console.log(`📊 Usando widgets por defecto: ${defaultWidgets.length} widgets`);
    return defaultWidgets;
  });

  const [editMode, setEditMode] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(() => {
    try {
      const saved = localStorage.getItem('dashboardAutoRefresh');
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      console.error('Error parsing dashboardAutoRefresh from localStorage:', error);
      localStorage.removeItem('dashboardAutoRefresh');
      return false;
    }
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openFilter = Boolean(anchorEl);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Queries de Personal
  const { data: personnelDashboard } = useGetPersonnelDashboardQuery(undefined, {
    skip: !userPermissions.includes('personnel.view_personnelprofile'),
  });
  const { data: certificationsExpiring } = useGetCertificationsExpiringQuery(
    { days: 30 },
    {
      skip: !userPermissions.includes('personnel.view_certification'),
    }
  );
  const { data: newPersonnel } = useGetPersonnelProfilesQuery(
    {
      limit: 5,
      offset: 0,
    },
    {
      skip: !userPermissions.includes('personnel.view_personnelprofile'),
    }
  );

  // Calcular ancho del contenedor
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
        console.log('📏 Ancho del contenedor actualizado:', width, 'px');
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetch();
      }, 60000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFilter = (filter: FilterDate) => {
    const date = new Date();
    let valueDate;
    let start_date;
    let end_date;

    switch (filter) {
      case FilterDate.TODAY:
        start_date = format(date, 'yyyy-MM-dd');
        end_date = format(date, 'yyyy-MM-dd');
        break;
      case FilterDate.WEEK:
        valueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7);
        start_date = format(valueDate, 'yyyy-MM-dd');
        end_date = format(date, 'yyyy-MM-dd');
        break;
      case FilterDate.MONTH:
        valueDate = new Date(date.getFullYear(), date.getMonth(), 1);
        start_date = format(valueDate, 'yyyy-MM-dd');
        end_date = format(date, 'yyyy-MM-dd');
        break;
      case FilterDate.YEAR:
        valueDate = new Date(date.getFullYear(), date.getMonth() - date.getMonth(), 1);
        start_date = format(valueDate, 'yyyy-MM-dd');
        end_date = format(date, 'yyyy-MM-dd');
        break;
      default:
        break;
    }

    setQuery({
      ...query,
      filterDate: filter,
      start_date,
      end_date,
    });
    localStorage.setItem('filterDate', filter);
    refetch();
    handleClose();
  };

  // Inicializar filtro una sola vez
  useEffect(() => {
    const filterDate = localStorage.getItem('filterDate') as FilterDate;
    if (filterDate && Object.values(FilterDate).includes(filterDate)) {
      handleFilter(filterDate);
    } else {
      // Solo configurar el query inicial sin llamar refetch
      const today = new Date();
      setQuery({
        ...query,
        filterDate: FilterDate.TODAY,
        start_date: format(today, 'yyyy-MM-dd'),
        end_date: format(today, 'yyyy-MM-dd'),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch(setDashboardQueryParams(query));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Calcular layouts filtrados para mostrar solo widgets habilitados
  const filteredLayouts = useMemo(() => {
    const filtered = {
      lg: layouts.lg.filter((layout) => enabledWidgets.includes(layout.i as WidgetType)),
      md: layouts.md.filter((layout) => enabledWidgets.includes(layout.i as WidgetType)),
      sm: layouts.sm.filter((layout) => enabledWidgets.includes(layout.i as WidgetType)),
    };
    console.log('🔍 Layouts a renderizar:', {
      total: { lg: layouts.lg.length, md: layouts.md.length, sm: layouts.sm.length },
      filtrados: { lg: filtered.lg.length, md: filtered.md.length, sm: filtered.sm.length },
      widgets: enabledWidgets.length,
    });
    return filtered;
  }, [layouts, enabledWidgets]);

  const isInitialMount = useRef(true);

  const handleLayoutChange = (currentLayout: Layout, allLayouts: { lg: Layout; md: Layout; sm: Layout }) => {
    // Prevenir actualización en el primer render (cuando carga la página)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setLayouts(allLayouts);
    console.log('🔄 Layouts actualizados por el usuario');
  };

  // Auto-guardar cuando cambian los layouts
  const layoutsStringRef = useRef<string>('');
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Marcar como cargado después del primer render
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      layoutsStringRef.current = JSON.stringify(layouts);
      return;
    }

    if (layouts && layouts.lg && layouts.md && layouts.sm) {
      const layoutsString = JSON.stringify(layouts);
      // Solo guardar si realmente cambió (evitar guardados innecesarios)
      if (layoutsString !== layoutsStringRef.current) {
        layoutsStringRef.current = layoutsString;
        localStorage.setItem('dashboardLayouts', layoutsString);
        console.log('💾 Auto-guardado: Layouts guardados automáticamente');
      }
    }
  }, [layouts]);

  const handleSaveLayout = () => {
    console.log('💾 GUARDANDO CONFIGURACIÓN...');
    console.log('Layouts actuales:', layouts);
    console.log('Widgets habilitados:', enabledWidgets);

    try {
      // Validar que layouts tiene la estructura correcta antes de guardar
      if (layouts && layouts.lg && layouts.md && layouts.sm) {
        const layoutsToSave = JSON.stringify(layouts);
        localStorage.setItem('dashboardLayouts', layoutsToSave);
        console.log(`✅ Layouts guardados correctamente (${layoutsToSave.length} caracteres)`);
        console.log('📐 Layouts guardados:', {
          lg: layouts.lg.length + ' items',
          md: layouts.md.length + ' items',
          sm: layouts.sm.length + ' items',
        });
      } else {
        console.warn('⚠️ Layouts tiene estructura inválida, NO se guardó');
      }

      // Validar que enabledWidgets es un array
      if (Array.isArray(enabledWidgets)) {
        localStorage.setItem('dashboardEnabledWidgets', JSON.stringify(enabledWidgets));
        console.log(`✅ Widgets guardados correctamente: ${enabledWidgets.length} widgets`);
        console.log('📊 Widgets:', enabledWidgets);
      } else {
        console.warn('⚠️ enabledWidgets no es un array, NO se guardó');
      }

      localStorage.setItem('dashboardAutoRefresh', JSON.stringify(autoRefresh));
      console.log('✅ Auto-refresh guardado:', autoRefresh);

      setEditMode(false);
      setConfigDialogOpen(false);

      console.log('✅ CONFIGURACIÓN GUARDADA EXITOSAMENTE');
    } catch (error) {
      console.error('❌ Error al guardar configuración del dashboard:', error);
    }
  };

  const handleToggleWidget = (widgetId: WidgetType) => {
    setEnabledWidgets((prev) => {
      const newWidgets = prev.includes(widgetId)
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId];

      console.log(`🔄 Widget ${widgetId} ${prev.includes(widgetId) ? 'desactivado' : 'activado'}`);
      console.log(`📊 Total widgets activos: ${newWidgets.length}`);

      return newWidgets;
    });
  };

  const handleResetLayout = () => {
    // Obtener widgets por defecto según permisos
    const defaultWidgets: WidgetType[] = [WidgetType.WELCOME, WidgetType.MY_HISTORY];

    if (userPermissions.includes('tracker.view_trackermodel')) {
      defaultWidgets.push(
        WidgetType.TAT,
        WidgetType.PENDING_TRACKERS,
        WidgetType.COMPLETED_TRACKERS,
        WidgetType.TAT_GRAPH
      );
    }

    if (userPermissions.includes('personnel.view_personnelprofile')) {
      defaultWidgets.push(
        WidgetType.PERSONNEL_STATS,
        WidgetType.PERSONNEL_NEW,
        WidgetType.PERSONNEL_HIERARCHY
      );
    }

    if (userPermissions.includes('personnel.view_certification')) {
      defaultWidgets.push(WidgetType.CERTIFICATIONS_EXPIRING);
    }

    if (userPermissions.includes('personnel.view_performancemetric')) {
      defaultWidgets.push(WidgetType.MY_PERFORMANCE);
    }

    setLayouts(DEFAULT_LAYOUTS);
    setEnabledWidgets(defaultWidgets);
    localStorage.removeItem('dashboardLayouts');
    localStorage.removeItem('dashboardEnabledWidgets');
  };

  const renderWidget = (widgetType: WidgetType) => {
    switch (widgetType) {
      case WidgetType.WELCOME:
        return (
          <Card elevation={0} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <div>
                <img src={image} alt="layout" width={40} />
              </div>
              <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
              <div>
                <Typography variant="body1" component="h6" color={'secondary'} fontWeight={200}>
                  Bienvenido(a)
                </Typography>
                <Divider />
                <Typography variant="h6" component="p" color={'secondary'} fontWeight={400}>
                  {user?.first_name} {user?.last_name}
                </Typography>
              </div>
            </div>
          </Card>
        );

      case WidgetType.TAT:
        return (
          <Card elevation={1} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <div className="home__dashboard-card">
              <div>
                <Typography variant="body1" component="h6" color={'secondary'} fontWeight={200}>
                  Tiempo promedio de atención
                </Typography>
                <Divider />
                <Typography variant="h6" component="p" color={'secondary'} fontWeight={400}>
                  {user?.centro_distribucion_name}
                </Typography>
              </div>
              <div>
                <Typography variant="h2" component="p" color={'secondary'} fontWeight={400}>
                  TAT
                </Typography>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {data?.time_average === 0 || data?.time_average === undefined ? (
                  '--'
                ) : (
                  <Chip
                    label={formatDuration(
                      {
                        hours: Math.floor(data?.time_average / 3600),
                        minutes: Math.floor((data?.time_average % 3600) / 60),
                      },
                      { locale: es, format: ['hours', 'minutes'], delimiter: ' y ' }
                    )}
                    variant="outlined"
                    color="success"
                    size="medium"
                    sx={{ fontSize: '30px' }}
                    icon={isLoading || isFetching ? <CircularProgress size={20} /> : <AccessTimeIcon />}
                  />
                )}
              </div>
            </div>
          </Card>
        );

      case WidgetType.PENDING_TRACKERS:
        return (
          <Card elevation={1} sx={{ p: 2, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" component="h6" color={'secondary'} fontWeight={200}>
                T1 - Pendientes
              </Typography>
              {isLoading || isFetching ? (
                <CircularProgress size={20} />
              ) : (
                <Typography variant="h6" component="p" color={'secondary'} fontWeight={600}>
                  {data?.total_trackers_pending.length === 0 ? '--' : data?.total_trackers_pending.length}
                </Typography>
              )}
            </div>
            <Divider />
            <TableContainer sx={{ mt: 1, flex: 1, overflow: 'auto' }}>
              <Table size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell align="left">Tracking</StyledTableCell>
                    <StyledTableCell align="left">Atraso</StyledTableCell>
                    <StyledTableCell align="right"></StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.total_trackers_pending.map((row) => (
                    <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell align="left" component="th" scope="row">
                        TRK-{row.id.toString().padStart(5, '0')}
                      </TableCell>
                      <TableCell align="left">
                        {formatDistanceToNow(new Date(row?.created_at), { addSuffix: true, locale: es })}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" onClick={() => navigate('/tracker/detail/' + row.id)}>
                          <ArrowForwardIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        );

      case WidgetType.COMPLETED_TRACKERS:
        return (
          <Card elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" component="h6" color={'secondary'} fontWeight={200}>
                T1 - Completado
              </Typography>
              {isLoading || isFetching ? (
                <CircularProgress size={20} />
              ) : (
                <Typography variant="h6" component="p" color={'secondary'} fontWeight={600}>
                  {data?.total_trackers_completed === 0 ? '--' : data?.total_trackers_completed}
                </Typography>
              )}
            </div>
            <Divider />
            <TableContainer sx={{ mt: 1, flex: 1, overflow: 'auto' }}>
              <Table size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell align="left">Tracking</StyledTableCell>
                    <StyledTableCell align="left">Traslado 5001</StyledTableCell>
                    <StyledTableCell align="right"></StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.last_trackers.map((row) => (
                    <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell align="left" component="th" scope="row">
                        TRK-{row.id.toString().padStart(5, '0')}
                      </TableCell>
                      <TableCell align="left">{row?.transfer_number}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" onClick={() => navigate('/tracker/detail/' + row.id)}>
                          <ArrowForwardIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant="text"
              color="primary"
              size="medium"
              sx={{ mt: 1 }}
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/tracker/manage/?status=COMPLETE')}
            >
              Ver más
            </Button>
          </Card>
        );

      case WidgetType.TAT_GRAPH:
        return (
          <Card elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <TATGraph />
          </Card>
        );

      case WidgetType.PERSONNEL_STATS:
        return (
          <Card elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" component="h6" color="secondary" fontWeight={200}>
                Estadísticas Personal
              </Typography>
              <GroupsIcon color="primary" />
            </Box>
            <Divider />
            <Box sx={{ mt: 2 }}>
              <Typography variant="h3" color="primary" fontWeight={700}>
                {personnelDashboard?.summary.total_active || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Personal Activo
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Inactivos
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {personnelDashboard?.summary.total_inactive || 0}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Nuevos (30d)
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {personnelDashboard?.summary.new_hires_30_days || 0}
                </Typography>
              </Grid>
            </Grid>
            <Box sx={{ mt: 'auto', pt: 2 }}>
              <Button
                variant="text"
                color="primary"
                size="small"
                fullWidth
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/personnel/list')}
              >
                Ver Personal
              </Button>
            </Box>
          </Card>
        );

      case WidgetType.CERTIFICATIONS_EXPIRING:
        return (
          <Card elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" component="h6" color="secondary" fontWeight={200}>
                Certificaciones
              </Typography>
              <WorkspacePremiumIcon color="warning" />
            </Box>
            <Divider />
            <Box sx={{ mt: 2 }}>
              <Typography variant="h3" color="warning.main" fontWeight={700}>
                {personnelDashboard?.certifications.expiring_soon || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Por vencer (30 días)
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Vencidas
              </Typography>
              <Typography variant="h6" fontWeight={600} color="error.main">
                {personnelDashboard?.certifications.expired || 0}
              </Typography>
            </Box>
            <Box sx={{ mt: 'auto', pt: 2 }}>
              <Button
                variant="text"
                color="primary"
                size="small"
                fullWidth
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/personnel/certifications')}
              >
                Ver Certificaciones
              </Button>
            </Box>
          </Card>
        );

      case WidgetType.PERSONNEL_NEW:
        return (
          <Card elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" component="h6" color="secondary" fontWeight={200}>
                Nuevos Ingresos
              </Typography>
              <PersonAddIcon color="success" />
            </Box>
            <Divider />
            {newPersonnel && newPersonnel.results.length > 0 ? (
              <>
                <Box sx={{ mt: 2 }}>
                  <AvatarGroup max={4}>
                    {newPersonnel.results.slice(0, 5).map((person) => (
                      <Avatar key={person.id} alt={person.full_name}>
                        {person.full_name.charAt(0)}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </Box>
                <TableContainer sx={{ mt: 2, flex: 1 }}>
                  <Table size="small">
                    <TableBody>
                      {newPersonnel.results.slice(0, 3).map((person) => (
                        <TableRow key={person.id}>
                          <TableCell>{person.full_name}</TableCell>
                          <TableCell align="right">
                            <Chip label={person.position} size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No hay nuevos ingresos
              </Typography>
            )}
            <Box sx={{ mt: 'auto', pt: 2 }}>
              <Button
                variant="text"
                color="primary"
                size="small"
                fullWidth
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/personnel/list')}
              >
                Ver todos
              </Button>
            </Box>
          </Card>
        );

      case WidgetType.PERSONNEL_HIERARCHY:
        const hierarchyChartData = {
          labels: personnelDashboard?.by_hierarchy?.map((item) => item.hierarchy_level) || [],
          datasets: [
            {
              label: 'Personal por Jerarquía',
              data: personnelDashboard?.by_hierarchy?.map((item) => item.count) || [],
              backgroundColor: ['#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50'],
              borderColor: ['#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50'],
              borderWidth: 1,
            },
          ],
        };

        const hierarchyOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function (context: any) {
                  return `${context.parsed.y} personas`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        };

        return (
          <Card elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" component="h6" color="secondary" fontWeight={200}>
                Distribución por Jerarquía
              </Typography>
              <BarChartIcon color="primary" />
            </Box>
            <Divider />
            {personnelDashboard?.by_hierarchy && personnelDashboard.by_hierarchy.length > 0 ? (
              <Box sx={{ flex: 1, mt: 2, minHeight: 0 }}>
                <Bar data={hierarchyChartData} options={hierarchyOptions} />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No hay datos disponibles
              </Typography>
            )}
          </Card>
        );

      case WidgetType.PERSONNEL_BY_AREA:
        const areaChartData = {
          labels: personnelDashboard?.by_area?.map((item) => item.area__name) || [],
          datasets: [
            {
              label: 'Personal por Área',
              data: personnelDashboard?.by_area?.map((item) => item.count) || [],
              backgroundColor: [
                '#ff6384',
                '#36a2eb',
                '#ffce56',
                '#4bc0c0',
                '#9966ff',
                '#ff9f40',
                '#ff6384',
                '#c9cbcf',
              ],
              borderColor: '#ffffff',
              borderWidth: 2,
            },
          ],
        };

        const areaOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right' as const,
              labels: {
                boxWidth: 15,
                padding: 10,
                font: {
                  size: 11,
                },
              },
            },
            tooltip: {
              callbacks: {
                label: function (context: any) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = personnelDashboard?.summary.total_active || 0;
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                  return `${label}: ${value} (${percentage}%)`;
                },
              },
            },
          },
        };

        return (
          <Card elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" component="h6" color="secondary" fontWeight={200}>
                Distribución por Área
              </Typography>
              <PieChartIcon color="primary" />
            </Box>
            <Divider />
            {personnelDashboard?.by_area && personnelDashboard.by_area.length > 0 ? (
              <Box sx={{ flex: 1, mt: 2, minHeight: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Pie data={areaChartData} options={areaOptions} />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No hay datos disponibles
              </Typography>
            )}
          </Card>
        );

      case WidgetType.MY_PERFORMANCE:
        return (
          <Card elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" component="h6" color="secondary" fontWeight={200}>
                Mi Desempeño
              </Typography>
              <TrendingUpIcon color="primary" />
            </Box>
            <Divider />
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="h2" color="primary" fontWeight={700}>
                4.5
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Promedio General
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Productividad
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  4.8
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Calidad
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  4.6
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Puntualidad
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  4.9
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Trabajo en Equipo
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  4.3
                </Typography>
              </Grid>
            </Grid>
          </Card>
        );

      case WidgetType.MY_HISTORY:
        return (
          <Card elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" component="h6" color="secondary" fontWeight={200}>
                Mi Historial
              </Typography>
              <AccessTimeIcon color="secondary" />
            </Box>
            <Divider />
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Actividad Reciente
              </Typography>
              <TableContainer sx={{ mt: 1, flex: 1 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          Perfil Actualizado
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Hace 2 días
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          Certificación Renovada
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Hace 1 semana
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          Evaluación Completada
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Hace 2 semanas
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Card>
        );

      default:
        return null;
    }
  };

  // Determinar el breakpoint actual
  const currentBreakpoint = isMobile ? 'sm' : isTablet ? 'md' : 'lg';
  const cols = isMobile ? 6 : isTablet ? 12 : 12;

  return (
    <Container maxWidth="xl" ref={containerRef}>
      {/* Header */}
      <Box sx={{ mt: 3, mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Chip
          label={query.filterDate}
          variant="outlined"
          color="secondary"
          clickable
          onClick={handleClick}
          icon={isLoading || isFetching ? <CircularProgress size={20} /> : <GridFilterListIcon />}
        />
        <Menu anchorEl={anchorEl} open={openFilter} onClose={handleClose}>
          <MenuItem onClick={() => handleFilter(FilterDate.TODAY)}>Hoy</MenuItem>
          <MenuItem onClick={() => handleFilter(FilterDate.WEEK)}>Esta semana</MenuItem>
          <MenuItem onClick={() => handleFilter(FilterDate.MONTH)}>Este mes</MenuItem>
          <MenuItem onClick={() => handleFilter(FilterDate.YEAR)}>Este año</MenuItem>
        </Menu>
      </Box>

      {/* Dashboard - Renderizado separado para Desktop y Mobile */}
      <Box sx={{ mb: 10 }}>
        {isMobile ? (
          /* === MOBILE UI === */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {enabledWidgets.map((widgetType) => (
              <Box key={widgetType}>{renderWidget(widgetType)}</Box>
            ))}
          </Box>
        ) : containerWidth === null ? (
          /* === LOADING - Esperando medición del contenedor === */
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          /* === DESKTOP UI === */
          <>
            {console.log('🎨 Renderizando ResponsiveGridLayout:', {
              layouts: {
                lg: filteredLayouts.lg.length + ' items',
                md: filteredLayouts.md.length + ' items',
              },
              width: containerWidth,
              rowHeight: 100,
              editMode,
            })}
            <ResponsiveGridLayout
              key={`grid-${containerWidth}`}
              className="layout"
              layouts={filteredLayouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768 }}
              cols={{ lg: 12, md: 12, sm: 6 }}
              rowHeight={100}
              width={containerWidth}
              isDraggable={true}
              isResizable={true}
              onLayoutChange={handleLayoutChange}
              compactType="vertical"
              preventCollision={false}
            >
            {enabledWidgets.map((widgetType) => (
              <div key={widgetType}>
                {editMode && (
                  <Box
                    className="drag-handle"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 32,
                      bgcolor: 'primary.main',
                      color: 'white',
                      cursor: 'move',
                      zIndex: 1000,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    <DragIndicatorIcon sx={{ fontSize: 18, mr: 0.5 }} />
                    Mover
                  </Box>
                )}
                <Box sx={{ height: '100%', pt: editMode ? '32px' : 0 }}>
                  {renderWidget(widgetType)}
                </Box>
              </div>
            ))}
          </ResponsiveGridLayout>
          </>
        )}
      </Box>

      {/* SpeedDial - Botón flotante */}
      <SpeedDial
        ariaLabel="Dashboard actions"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={editMode ? <CloseIcon /> : <SettingsIcon />}
      >
        {!isMobile && (
          <SpeedDialAction
            icon={editMode ? <SaveIcon /> : <DragIndicatorIcon />}
            tooltipTitle={editMode ? 'Guardar Cambios' : 'Editar Dashboard'}
            onClick={() => (editMode ? handleSaveLayout() : setEditMode(true))}
          />
        )}
        <SpeedDialAction
          icon={<SettingsIcon />}
          tooltipTitle="Configurar Widgets"
          onClick={() => setConfigDialogOpen(true)}
        />
        <SpeedDialAction
          icon={autoRefresh ? <RefreshIcon color="success" /> : <RefreshIcon />}
          tooltipTitle={autoRefresh ? 'Auto-refresh: ON' : 'Auto-refresh: OFF'}
          onClick={() => {
            setAutoRefresh(!autoRefresh);
            localStorage.setItem('dashboardAutoRefresh', JSON.stringify(!autoRefresh));
          }}
        />
        <SpeedDialAction icon={<RefreshIcon />} tooltipTitle="Actualizar Ahora" onClick={() => refetch()} />
      </SpeedDial>

      {/* Dialog de configuración */}
      <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="sm" fullWidth>
        <BootstrapDialogTitle id="config-dashboard-dialog-title" onClose={() => setConfigDialogOpen(false)}>
          <Typography variant="h6" fontWeight={600} color={'#fff'}>
            Configurar Dashboard
          </Typography>
        </BootstrapDialogTitle>
        <DialogContent>
          <FormControlLabel
            control={<Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />}
            label="Auto-refresh cada minuto"
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Widgets Visibles
          </Typography>
          <List>
            {availableWidgetsForUser.map((widget) => (
              <ListItem
                key={widget.id}
                button
                onClick={() => handleToggleWidget(widget.id)}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemIcon>
                  <Checkbox checked={enabledWidgets.includes(widget.id)} />
                </ListItemIcon>
                <ListItemIcon>{widget.icon}</ListItemIcon>
                <ListItemText primary={widget.title} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetLayout} color="error">
            Restaurar
          </Button>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveLayout} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
