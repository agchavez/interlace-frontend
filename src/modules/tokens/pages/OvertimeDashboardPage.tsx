/**
 * Dashboard gerencial de horas extra.
 *
 * Muestra tendencia, desglose por motivo, tipo y área, y el ranking de personas,
 * con costo estimado a partir de la tarifa vigente de cada centro.
 */
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip as MuiTooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Plugin,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

import { useGetOvertimeDashboardQuery, useGetOvertimeTypesQuery, useGetOvertimeReasonsQuery } from '../services/tokenApi';
import { useGetAreasQuery } from '../../personnel/services/personnelApi';
import {
  OvertimeGranularity,
  OvertimeGroupItem,
} from '../interfaces/overtimeDashboard';
import { useAppSelector } from '../../../store';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

// Paleta validada para daltonismo sobre fondo claro (ΔE 27.3 en protanopía).
const SERIES_REAL = '#c2410c';
const SERIES_EQUIV = '#1976d2';
const BAR_BASE = '#1976d2';
const BAR_SELECTED = '#0d47a1';
const BAR_DIMMED = '#bbdefb';
const GRID = 'rgba(15, 23, 42, 0.08)';
const INK_MUTED = '#64748b';

const numberFmt = new Intl.NumberFormat('es-HN', { maximumFractionDigits: 1 });

const formatHours = (value: number) => `${numberFmt.format(value)} h`;

const GRANULARITY_LABELS: Record<OvertimeGranularity, string> = {
  day: 'Día',
  week: 'Semana',
  month: 'Mes',
};

/** Dibuja el valor al final de cada barra horizontal, sin depender de plugins externos. */
const barValueLabels: Plugin<'bar'> = {
  id: 'barValueLabels',
  afterDatasetsDraw: (chart) => {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    const values = (chart.data.datasets[0]?.data ?? []) as number[];
    ctx.save();
    ctx.font = '600 11px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = INK_MUTED;
    ctx.textBaseline = 'middle';
    meta.data.forEach((bar, index) => {
      const value = values[index];
      if (value === undefined || value === null) return;
      const { x, y } = bar.getProps(['x', 'y'], true);
      ctx.textAlign = 'left';
      ctx.fillText(numberFmt.format(value), x + 8, y);
    });
    ctx.restore();
  },
};

const formatBucketLabel = (iso: string, granularity: OvertimeGranularity) => {
  const d = dayjs(iso);
  if (granularity === 'month') return d.format('MMM YYYY');
  if (granularity === 'week') return `Sem ${d.format('DD MMM')}`;
  return d.format('DD MMM');
};

// ---------------------------------------------------------------- Stat card

interface StatCardProps {
  title: string;
  value: string;
  caption?: string;
  variation: number | null;
  icon: React.ReactElement;
  color: string;
  /** true cuando subir es malo, como el costo o las horas */
  higherIsWorse?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  caption,
  variation,
  icon,
  color,
  higherIsWorse = true,
}) => {
  const hasVariation = variation !== null && Number.isFinite(variation);
  const isFlat = hasVariation && Math.abs(variation as number) < 0.05;
  const isUp = hasVariation && (variation as number) > 0;
  const trendColor = !hasVariation || isFlat
    ? INK_MUTED
    : isUp === higherIsWorse
      ? '#b91c1c'
      : '#15803d';
  const TrendIcon = !hasVariation || isFlat ? TrendingFlatIcon : isUp ? TrendingUpIcon : TrendingDownIcon;

  return (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: INK_MUTED, fontWeight: 500 }} noWrap>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, lineHeight: 1.2 }}>
              {value}
            </Typography>
            {caption && (
              <Typography variant="caption" sx={{ color: INK_MUTED }}>
                {caption}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: `${color}18`,
              color,
              borderRadius: 2,
              p: 1,
              display: 'flex',
            }}
          >
            {icon}
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1.5 }}>
          <TrendIcon sx={{ fontSize: 18, color: trendColor }} />
          <Typography variant="caption" sx={{ color: trendColor, fontWeight: 600 }}>
            {hasVariation ? `${(variation as number) > 0 ? '+' : ''}${numberFmt.format(variation as number)}%` : 'Sin comparable'}
          </Typography>
          <Typography variant="caption" sx={{ color: INK_MUTED }}>
            vs. periodo anterior
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

// ------------------------------------------------------------ Breakdown bars

interface BreakdownChartProps {
  title: string;
  items: OvertimeGroupItem[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  emptyLabel: string;
}

const BreakdownChart: React.FC<BreakdownChartProps> = ({
  title,
  items,
  selectedIds,
  onToggle,
  emptyLabel,
}) => {
  const top = useMemo(() => items.slice(0, 8), [items]);
  const hasSelection = selectedIds.length > 0;

  const data = useMemo(
    () => ({
      labels: top.map((item) => item.name),
      datasets: [
        {
          label: 'Horas equivalentes',
          data: top.map((item) => item.equivalent_hours),
          backgroundColor: top.map((item) => {
            if (item.id !== null && selectedIds.includes(item.id)) return BAR_SELECTED;
            return hasSelection ? BAR_DIMMED : BAR_BASE;
          }),
          borderRadius: 4,
          borderSkipped: false,
          barThickness: 18,
        },
      ],
    }),
    [top, selectedIds, hasSelection]
  );

  const options: ChartOptions<'bar'> = useMemo(
    () => ({
      indexAxis: 'y' as const,
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { right: 48 } },
      // Toda la fila es zona de clic, no solo la barra dibujada.
      interaction: { mode: 'nearest' as const, axis: 'y' as const, intersect: false },
      onClick: (_event, elements) => {
        const element = elements[0];
        if (!element) return;
        const item = top[element.index];
        if (item && item.id !== null) onToggle(item.id);
      },
      onHover: (event, elements) => {
        const target = event.native?.target as HTMLElement | undefined;
        if (target) target.style.cursor = elements.length ? 'pointer' : 'default';
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const item = top[ctx.dataIndex];
              return [
                `Horas equivalentes: ${formatHours(item.equivalent_hours)}`,
                `Horas reales: ${formatHours(item.hours)}`,
                `Tokens: ${item.tokens} · Personas: ${item.people}`,
              ];
            },
            title: (ctx) => String(ctx[0]?.label ?? ''),
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: GRID, drawTicks: false },
          border: { display: false },
          ticks: { color: INK_MUTED, font: { size: 11 } },
        },
        y: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: INK_MUTED, font: { size: 11 }, autoSkip: false },
        },
      },
    }),
    [top, onToggle]
  );

  return (
    <Paper elevation={2} sx={{ p: 2.5, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: INK_MUTED }}>
        Horas equivalentes. Hacé clic en una barra para filtrar el dashboard.
      </Typography>
      <Box sx={{ height: Math.max(180, top.length * 34 + 40), mt: 2 }}>
        {top.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
            <Typography variant="body2" sx={{ color: INK_MUTED }}>
              {emptyLabel}
            </Typography>
          </Stack>
        ) : (
          <Bar data={data} options={options} plugins={[barValueLabels]} />
        )}
      </Box>
    </Paper>
  );
};

// --------------------------------------------------------------------- Page

const todayIso = () => dayjs();

export const OvertimeDashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const authToken = useAppSelector((state) => state.auth.token);
  const { disctributionCenters } = useAppSelector((state) => state.maintenance);

  const [dateFrom, setDateFrom] = useState<Dayjs>(todayIso().startOf('month'));
  const [dateTo, setDateTo] = useState<Dayjs>(todayIso());
  const [granularity, setGranularity] = useState<OvertimeGranularity | 'auto'>('auto');
  const [centers, setCenters] = useState<number[]>([]);
  const [reasons, setReasons] = useState<number[]>([]);
  const [types, setTypes] = useState<number[]>([]);
  const [areas, setAreas] = useState<number[]>([]);
  const [people, setPeople] = useState<number[]>([]);
  const [exporting, setExporting] = useState(false);

  const params = useMemo(
    () => ({
      date_from: dateFrom.format('YYYY-MM-DD'),
      date_to: dateTo.format('YYYY-MM-DD'),
      granularity,
      distributor_center: centers,
      reason: reasons,
      overtime_type: types,
      area: areas,
      personnel: people,
    }),
    [dateFrom, dateTo, granularity, centers, reasons, types, areas, people]
  );

  const rangeIsValid = dateFrom.isValid() && dateTo.isValid() && !dateFrom.isAfter(dateTo);

  const { data, isLoading, isFetching, error } = useGetOvertimeDashboardQuery(params, {
    skip: !rangeIsValid,
  });
  const { data: reasonCatalog } = useGetOvertimeReasonsQuery({ limit: 200 });
  const { data: typeCatalog } = useGetOvertimeTypesQuery({ limit: 200 });
  const { data: areaCatalog } = useGetAreasQuery();

  const toggleIn = useCallback(
    (setter: React.Dispatch<React.SetStateAction<number[]>>) => (id: number) => {
      setter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    },
    []
  );

  const clearFilters = () => {
    setCenters([]);
    setReasons([]);
    setTypes([]);
    setAreas([]);
    setPeople([]);
    setGranularity('auto');
  };

  const activeFilterCount =
    centers.length + reasons.length + types.length + areas.length + people.length;

  const handleExport = async () => {
    if (!rangeIsValid) return;
    setExporting(true);
    try {
      const search = new URLSearchParams();
      search.set('date_from', params.date_from);
      search.set('date_to', params.date_to);
      if (granularity !== 'auto') search.set('granularity', granularity);
      if (centers.length) search.set('distributor_center', centers.join(','));
      if (reasons.length) search.set('reason', reasons.join(','));
      if (types.length) search.set('overtime_type', types.join(','));
      if (areas.length) search.set('area', areas.join(','));
      if (people.length) search.set('personnel', people.join(','));

      const url = `${import.meta.env.VITE_JS_APP_API_URL}/api/tokens/overtime_dashboard_export/?${search.toString()}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${authToken}` } });
      if (!res.ok) throw new Error('Error al exportar');
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `horas-extra-${params.date_from}-a-${params.date_to}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Error exportando dashboard de horas extra:', err);
    } finally {
      setExporting(false);
    }
  };

  const timeseries = data?.timeseries ?? [];
  const effectiveGranularity = data?.period.granularity ?? 'day';

  const lineData = useMemo(
    () => ({
      labels: timeseries.map((point) => formatBucketLabel(point.date, effectiveGranularity)),
      datasets: [
        {
          label: 'Horas reales',
          data: timeseries.map((point) => point.hours),
          borderColor: SERIES_REAL,
          backgroundColor: SERIES_REAL,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          tension: 0.25,
        },
        {
          label: 'Horas equivalentes',
          data: timeseries.map((point) => point.equivalent_hours),
          borderColor: SERIES_EQUIV,
          backgroundColor: 'rgba(25, 118, 210, 0.12)',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          tension: 0.25,
          fill: true,
        },
      ],
    }),
    [timeseries, effectiveGranularity]
  );

  const lineOptions: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: {
          position: 'top' as const,
          align: 'end' as const,
          labels: { usePointStyle: true, boxWidth: 8, color: INK_MUTED },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${formatHours(Number(ctx.parsed.y))}`,
            afterBody: (ctx) => {
              const point = timeseries[ctx[0]?.dataIndex ?? 0];
              if (!point) return '';
              return [`Tokens: ${point.tokens} · Personas: ${point.people}`];
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: INK_MUTED, font: { size: 11 }, maxRotation: 0, autoSkipPadding: 16 },
        },
        y: {
          beginAtZero: true,
          grid: { color: GRID, drawTicks: false },
          border: { display: false },
          ticks: { color: INK_MUTED, font: { size: 11 } },
        },
      },
    }),
    [timeseries]
  );

  const kpis = data?.kpis;

  const renderMultiSelect = (
    label: string,
    value: number[],
    onChange: (ids: number[]) => void,
    options: { id: number; name: string }[]
  ) => (
    <FormControl size="small" sx={{ minWidth: 180, flex: 1 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={value}
        input={<OutlinedInput label={label} />}
        onChange={(event) => {
          const next = event.target.value as unknown as number[];
          onChange(typeof next === 'string' ? [] : next);
        }}
        renderValue={(selected) =>
          (selected as number[])
            .map((id) => options.find((o) => o.id === id)?.name ?? id)
            .join(', ')
        }
        MenuProps={{ PaperProps: { style: { maxHeight: 320 } } }}
      >
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            <Checkbox checked={value.includes(option.id)} size="small" />
            <ListItemText primary={option.name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Dashboard de Horas Extra
            </Typography>
            <Typography variant="body2" sx={{ color: INK_MUTED }}>
              Horas autorizadas y su equivalente pagado, ponderado por el multiplicador.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <FileDownloadIcon />}
            onClick={handleExport}
            disabled={exporting || !rangeIsValid}
          >
            Exportar Excel
          </Button>
        </Stack>

        {/* Filtros */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap',
              gap: 2,
              alignItems: { xs: 'stretch', sm: 'center' },
            }}
          >
            <DatePicker
              label="Desde"
              value={dateFrom}
              onChange={(value) => value && setDateFrom(value)}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: 'small', sx: { minWidth: 150 } } }}
            />
            <DatePicker
              label="Hasta"
              value={dateTo}
              onChange={(value) => value && setDateTo(value)}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: 'small', sx: { minWidth: 150 } } }}
            />
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Agrupar por</InputLabel>
              <Select
                value={granularity}
                label="Agrupar por"
                onChange={(event) => setGranularity(event.target.value as OvertimeGranularity | 'auto')}
              >
                <MenuItem value="auto">Automático</MenuItem>
                <MenuItem value="day">Día</MenuItem>
                <MenuItem value="week">Semana</MenuItem>
                <MenuItem value="month">Mes</MenuItem>
              </Select>
            </FormControl>
            {renderMultiSelect('Centro', centers, setCenters, (disctributionCenters ?? []).map((c: any) => ({ id: c.id, name: c.name })))}
            {renderMultiSelect('Motivo', reasons, setReasons, (reasonCatalog?.results ?? []).map((r) => ({ id: r.id, name: r.name })))}
            {renderMultiSelect('Tipo', types, setTypes, (typeCatalog?.results ?? []).map((t) => ({ id: t.id, name: t.name })))}
            {renderMultiSelect('Área', areas, setAreas, (areaCatalog ?? []).map((a) => ({ id: a.id, name: a.name })))}
            <MuiTooltip title="Limpiar filtros">
              <span>
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  disabled={activeFilterCount === 0 && granularity === 'auto'}
                  startIcon={<RestartAltIcon />}
                >
                  Limpiar
                </Button>
              </span>
            </MuiTooltip>
          </Box>

          {people.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
              {people.map((id) => {
                const person = data?.by_person.find((p) => p.id === id);
                return (
                  <Chip
                    key={id}
                    label={`Persona: ${person?.name ?? id}`}
                    onDelete={() => setPeople((prev) => prev.filter((x) => x !== id))}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                );
              })}
            </Stack>
          )}
        </Paper>

        {!rangeIsValid && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            La fecha inicial no puede ser posterior a la fecha final.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {(error as any)?.data?.detail ?? 'No se pudo cargar el dashboard de horas extra.'}
          </Alert>
        )}

        {isLoading && (
          <Stack alignItems="center" sx={{ py: 8 }}>
            <CircularProgress />
          </Stack>
        )}

        {data && kpis && (
          <Box sx={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  title="Horas reales"
                  value={formatHours(kpis.total_hours)}
                  caption={`Promedio ${formatHours(kpis.avg_hours_per_person)} por persona`}
                  variation={kpis.variation.total_hours}
                  icon={<AccessTimeIcon />}
                  color={SERIES_REAL}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  title="Horas equivalentes"
                  value={formatHours(kpis.equivalent_hours)}
                  caption="Ponderadas por el multiplicador"
                  variation={kpis.variation.equivalent_hours}
                  icon={<StackedLineChartIcon />}
                  color={SERIES_EQUIV}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  title="Personas"
                  value={numberFmt.format(kpis.total_people)}
                  caption="Con horas extra autorizadas"
                  variation={kpis.variation.total_people}
                  icon={<PeopleAltIcon />}
                  color="#0f766e"
                  higherIsWorse={false}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  title="Tokens"
                  value={numberFmt.format(kpis.total_tokens)}
                  caption={`${kpis.pending_tokens} pendientes de aprobación`}
                  variation={kpis.variation.total_tokens}
                  icon={<ConfirmationNumberIcon />}
                  color="#b45309"
                />
              </Grid>
            </Grid>

            {/* Tendencia */}
            <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Tendencia de horas extra
                  </Typography>
                  <Typography variant="caption" sx={{ color: INK_MUTED }}>
                    Agrupado por {GRANULARITY_LABELS[effectiveGranularity].toLowerCase()}. Comparado
                    con {data.period.previous_date_from} a {data.period.previous_date_to}.
                  </Typography>
                </Box>
              </Stack>
              <Box sx={{ height: isMobile ? 240 : 320 }}>
                {timeseries.length === 0 ? (
                  <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
                    <Typography variant="body2" sx={{ color: INK_MUTED }}>
                      No hay horas extra autorizadas en el periodo seleccionado.
                    </Typography>
                  </Stack>
                ) : (
                  <Line data={lineData} options={lineOptions} />
                )}
              </Box>
            </Paper>

            {/* Desgloses */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <BreakdownChart
                  title="Por motivo"
                  items={data.by_reason}
                  selectedIds={reasons}
                  onToggle={toggleIn(setReasons)}
                  emptyLabel="Sin motivos registrados"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <BreakdownChart
                  title="Por tipo de hora extra"
                  items={data.by_type}
                  selectedIds={types}
                  onToggle={toggleIn(setTypes)}
                  emptyLabel="Sin tipos registrados"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <BreakdownChart
                  title="Por área"
                  items={data.by_area}
                  selectedIds={areas}
                  onToggle={toggleIn(setAreas)}
                  emptyLabel="Sin áreas registradas"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <BreakdownChart
                  title="Por centro de distribución"
                  items={data.by_center}
                  selectedIds={centers}
                  onToggle={toggleIn(setCenters)}
                  emptyLabel="Sin centros registrados"
                />
              </Grid>
            </Grid>

            {/* Ranking de personas */}
            <Paper elevation={2} sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Personas con más horas extra
              </Typography>
              <Typography variant="caption" sx={{ color: INK_MUTED }}>
                Top 15 del periodo. Hacé clic en una fila para filtrar, o abrí sus tokens en la lista.
              </Typography>
              <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Persona</TableCell>
                      <TableCell>Código</TableCell>
                      <TableCell>Área</TableCell>
                      <TableCell align="right">Tokens</TableCell>
                      <TableCell align="right">Horas</TableCell>
                      <TableCell align="right">Horas equiv.</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.by_person.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ color: INK_MUTED, py: 3 }}>
                          No hay personas con horas extra en el periodo.
                        </TableCell>
                      </TableRow>
                    )}
                    {data.by_person.map((person) => {
                      const isSelected = person.id !== null && people.includes(person.id);
                      return (
                        <TableRow
                          key={`${person.id}-${person.name}`}
                          hover
                          selected={isSelected}
                          sx={{ cursor: person.id !== null ? 'pointer' : 'default' }}
                          onClick={() => person.id !== null && toggleIn(setPeople)(person.id)}
                        >
                          <TableCell sx={{ fontWeight: 600 }}>{person.name}</TableCell>
                          <TableCell>{person.employee_code || '-'}</TableCell>
                          <TableCell>{person.area_name || '-'}</TableCell>
                          <TableCell align="right">{person.tokens}</TableCell>
                          <TableCell align="right">{formatHours(person.hours)}</TableCell>
                          <TableCell align="right">{formatHours(person.equivalent_hours)}</TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();
                                navigate(`/tokens?personnel=${person.id}`);
                              }}
                            >
                              Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <Divider sx={{ mt: 2 }} />
              <Typography variant="caption" sx={{ color: INK_MUTED, display: 'block', mt: 1.5 }}>
                Las horas equivalentes ya incluyen el multiplicador de pago de cada tramo, así que un
                turno al 300% pesa el doble que uno al 150%.
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default OvertimeDashboardPage;
