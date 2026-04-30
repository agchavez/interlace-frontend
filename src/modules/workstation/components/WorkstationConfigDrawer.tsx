/**
 * Configuración de un Workstation con preview live a la derecha.
 *
 * Estructura: Dialog full-screen, dividido 50/50.
 * Izquierda: secciones colapsables, una por componente del layout.
 * Derecha: preview de la TV (WorkstationFixedLayout) que se actualiza
 *          en vivo a medida que el usuario guarda secciones.
 *
 * Cada sección "find-or-create": al guardar busca el bloque del type
 * correspondiente en `workstation.blocks`, lo actualiza si existe o lo
 * crea si no. Los QRs y documentos son multi-instancia (CRUD libre).
 */
import { useEffect, useRef, useState } from 'react';
import {
    Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Chip,
    CircularProgress, Dialog, FormControlLabel, IconButton,
    Stack, Switch, TextField, Typography, Tooltip, Divider,
} from '@mui/material';
import {
    Close as CloseIcon, ExpandMore as ExpandMoreIcon,
    Tv as TvIcon, Save as SaveIcon, Delete as DeleteIcon, Add as AddIcon,
    UploadFile as UploadIcon, Link as LinkIcon, Image as ImageIcon,
    Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { Link as RouterLink } from 'react-router-dom';
import {
    useGetWorkstationQuery, useUpdateWorkstationMutation,
    useGetRiskCatalogQuery, useGetProhibitionCatalogQuery,
    useCreateBlockMutation, useUpdateBlockMutation, useDeleteBlockMutation,
    useUploadDocumentMutation, useDeleteDocumentMutation,
    useUploadImageMutation, useDeleteImageMutation,
    useApplyTemplateMutation, useGetAvailableKpisQuery,
} from '../services/workstationApi';
import type {
    BlockType, ProhibitionsBlockConfig, ReactionPlansBlockConfig,
    RisksBlockConfig, SicChartBlockConfig, TriggersBlockConfig,
    PerformersBlockConfig,
    QrDocumentBlockConfig, QrExternalBlockConfig, ImageBlockConfig,
    Workstation, WorkstationBlock,
} from '../interfaces/workstation';
import WorkstationFixedLayout, { type WorkstationZone } from './WorkstationFixedLayout';

/** Mapping de la key del accordion → zona a resaltar en el preview. */
const SECTION_TO_ZONE: Record<string, WorkstationZone | null> = {
    risks:      'RISKS',
    prohib:     'PROHIBITIONS',
    triggers:   'TRIGGERS',
    sic:        'SIC_CHART',
    plans:      'REACTION_PLANS',
    performers: null,
    qrdoc:      'QR_DOCUMENT',
    qrext:      'QR_EXTERNAL',
    images:     'IMAGE',
};

// Default sizes (heredados del template — el usuario no las ve)
const DEFAULT_SIZE: Record<BlockType, { x: number; y: number; w: number; h: number }> = {
    RISKS:          { x: 0, y: 0, w: 4, h: 4 },
    PROHIBITIONS:   { x: 4, y: 0, w: 4, h: 4 },
    TRIGGERS:       { x: 8, y: 0, w: 4, h: 4 },
    SIC_CHART:      { x: 0, y: 4, w: 8, h: 8 },
    REACTION_PLANS: { x: 8, y: 4, w: 4, h: 8 },
    PERFORMERS:     { x: 8, y: 0, w: 4, h: 4 },
    QR_DOCUMENT:    { x: 0, y: 12, w: 2, h: 3 },
    QR_EXTERNAL:    { x: 2, y: 12, w: 2, h: 3 },
    IMAGE:          { x: 4, y: 12, w: 3, h: 3 },
    TEXT:           { x: 7, y: 12, w: 3, h: 2 },
    TITLE:          { x: 0, y: 0, w: 6, h: 1 },
    CLOCK:          { x: 10, y: 0, w: 2, h: 1 },
    DPO:            { x: 10, y: 1, w: 2, h: 1 },
};

interface Props {
    open: boolean;
    workstationId: number | null;
    expectedDcId?: number;
    onClose: () => void;
    centerName: string;
}

export default function WorkstationConfigDrawer({ open, workstationId, onClose, centerName, expectedDcId }: Props) {
    return (
        <Dialog open={open} onClose={onClose} fullScreen
            PaperProps={{ sx: { bgcolor: '#f5f6fa' } }}
        >
            {workstationId && (
                <Body
                    workstationId={workstationId}
                    centerName={centerName}
                    expectedDcId={expectedDcId}
                    onClose={onClose}
                />
            )}
        </Dialog>
    );
}

function Body({
    workstationId, centerName, expectedDcId, onClose,
}: { workstationId: number; centerName: string; expectedDcId?: number; onClose: () => void }) {
    const { data: ws, isLoading } = useGetWorkstationQuery(workstationId);
    const [activeSection, setActiveSection] = useState<string | false>('risks');

    if (isLoading || !ws) {
        return <Box sx={{ p: 8, textAlign: 'center' }}><CircularProgress /></Box>;
    }

    // Guard: si el WS abierto no pertenece al CD esperado, NO permitir editar.
    // Esto evita configurar un workstation de otro CD por error y protege
    // contra estados inconsistentes.
    if (expectedDcId !== undefined && ws.distributor_center !== expectedDcId) {
        return (
            <Box sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Box>
                <Box sx={{ maxWidth: 640, mx: 'auto', mt: 6 }}>
                    <Alert severity="error" sx={{ borderRadius: 1 }}>
                        <Typography variant="body1" fontWeight={700} gutterBottom>
                            Workstation de otro CD
                        </Typography>
                        <Typography variant="body2">
                            Este workstation (#{ws.id}) pertenece al CD #{ws.distributor_center}
                            ({ws.distributor_center_name}), pero abriste el detalle del
                            CD #{expectedDcId} ({centerName}). No es seguro editarlo desde acá.
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            Andá a <code>/maintenance/distributor-center/{ws.distributor_center}</code> si querés editarlo,
                            o avisá a un admin para mover el workstation al CD correcto.
                        </Typography>
                    </Alert>
                </Box>
            </Box>
        );
    }

    const highlightZone = activeSection ? (SECTION_TO_ZONE[activeSection] ?? null) : null;

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header ws={ws} centerName={centerName} onClose={onClose} />
            {/* En desktop: split horizontal config | preview.
                En tablet/mobile: stack vertical, preview arriba (chico) y config debajo. */}
            <Box sx={{
                flex: 1, display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                minHeight: 0,
            }}>
                {/* Preview (en mobile va arriba con altura fija; en desktop va a la derecha 50%) */}
                <Box sx={{
                    order: { xs: 0, md: 1 },
                    flex: { xs: '0 0 auto', md: 1 },
                    height: { xs: 280, md: '100%' },
                    minWidth: 0, minHeight: 0,
                    display: 'flex', flexDirection: 'column',
                    borderBottom: { xs: 1, md: 0 }, borderColor: 'divider',
                }}>
                    <PreviewPane ws={ws} highlight={highlightZone} />
                </Box>
                {/* Sections (config) */}
                <Box sx={{
                    order: { xs: 1, md: 0 },
                    flex: 1, overflowY: 'auto',
                    borderRight: { xs: 0, md: 1 }, borderColor: 'divider',
                    bgcolor: '#fff',
                }}>
                    <SectionsList ws={ws} active={activeSection} onActiveChange={setActiveSection} />
                </Box>
            </Box>
        </Box>
    );
}

function PreviewPane({ ws, highlight }: { ws: Workstation; highlight: WorkstationZone | null }) {
    const ref = useRef<HTMLDivElement>(null);
    const [fullscreen, setFullscreen] = useState(false);

    useEffect(() => {
        const handler = () => setFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    const toggleFullscreen = () => {
        const el = ref.current;
        if (!el) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            el.requestFullscreen?.().catch(() => {
                toast.error('No se pudo entrar en pantalla completa');
            });
        }
    };

    return (
        <Box
            ref={ref}
            sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, bgcolor: '#0f172a' }}
        >
            <Box sx={{
                px: 2, py: 1, bgcolor: '#1e293b', color: '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1,
            }}>
                <Typography variant="caption" sx={{ letterSpacing: 1 }}>
                    VISTA PREVIA · TV
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa del preview'}>
                        <IconButton size="small" onClick={toggleFullscreen} sx={{ color: '#e2e8f0' }}>
                            {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                        </IconButton>
                    </Tooltip>
                    <Button
                        size="small" startIcon={<TvIcon />}
                        onClick={() => window.open(`/tv/dashboard/workstation_${ws.role.toLowerCase()}`, '_blank')}
                        sx={{ color: '#e2e8f0', textTransform: 'none' }}
                    >
                        Abrir en TV real
                    </Button>
                </Box>
            </Box>
            <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <WorkstationFixedLayout workstation={ws} mode="preview" highlight={highlight} />
            </Box>
        </Box>
    );
}

// ────── Header ──────

function Header({ ws, centerName, onClose }: { ws: Workstation; centerName: string; onClose: () => void }) {
    const [updateWs] = useUpdateWorkstationMutation();
    const [applyTemplate] = useApplyTemplateMutation();

    // Nombre editable. Si el usuario no escribió uno custom, mostramos el
    // role_display como placeholder. Solo se persiste cuando pierde foco
    // (onBlur) para evitar request por cada tecla.
    const [name, setName] = useState(ws.name || '');
    useEffect(() => { setName(ws.name || ''); }, [ws.id, ws.name]);

    const persistName = async () => {
        const trimmed = name.trim();
        if ((trimmed || '') === (ws.name || '')) return;
        try {
            await updateWs({ id: ws.id, data: { name: trimmed } }).unwrap();
            toast.success('Nombre actualizado');
        } catch {
            toast.error('No se pudo actualizar el nombre');
            setName(ws.name || '');
        }
    };

    const onApplyTemplate = async () => {
        if (!window.confirm('Esto reemplaza todo el contenido por el template default del rol. ¿Continuar?')) return;
        await applyTemplate(ws.id).unwrap();
        toast.success('Template aplicado');
    };

    return (
        <Box sx={{
            px: 2.5, py: 1.5, bgcolor: '#fff',
            borderBottom: 1, borderColor: 'divider',
            display: 'flex', alignItems: 'center', gap: 2,
        }}>
            <IconButton onClick={onClose}><CloseIcon /></IconButton>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
                    {centerName} · {ws.role_display}
                </Typography>
                <TextField
                    value={name}
                    placeholder={ws.role_display}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={persistName}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                    variant="standard"
                    InputProps={{
                        disableUnderline: true,
                        sx: {
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            lineHeight: 1.2,
                            '&:hover': { bgcolor: 'action.hover' },
                            '&.Mui-focused': { bgcolor: 'action.hover' },
                            borderRadius: 0.5,
                            px: 0.5,
                        },
                    }}
                    inputProps={{ 'aria-label': 'Nombre de la estación', maxLength: 80 }}
                    sx={{ width: '100%', mt: 0.25 }}
                />
            </Box>
            <FormControlLabel
                control={
                    <Switch
                        checked={ws.is_active}
                        onChange={async (e) => {
                            await updateWs({ id: ws.id, data: { is_active: e.target.checked } });
                            toast.success(e.target.checked ? 'Estación activada' : 'Estación desactivada');
                        }}
                    />
                }
                label={<Typography variant="caption">{ws.is_active ? 'Activa' : 'Inactiva'}</Typography>}
            />
            <Button onClick={onApplyTemplate} sx={{ textTransform: 'none' }}>
                Restablecer template
            </Button>
        </Box>
    );
}

// ────── Sections list ──────

function SectionsList({
    ws, active, onActiveChange,
}: {
    ws: Workstation;
    active: string | false;
    onActiveChange: (next: string | false) => void;
}) {
    const open = active;
    const handle = (key: string) => (_: any, expanded: boolean) => onActiveChange(expanded ? key : false);

    return (
        <Box>
            <Section
                title="Riesgos del área (Rojo)"
                description="Íconos triangulares amarillos del catálogo."
                expanded={open === 'risks'} onChange={handle('risks')}
            >
                <RisksSection ws={ws} />
            </Section>
            <Section
                title="Prohibiciones del área (Rojo)"
                description="Círculos rojos tachados del catálogo."
                expanded={open === 'prohib'} onChange={handle('prohib')}
            >
                <ProhibitionsSection ws={ws} />
            </Section>
            <Section
                title="Disparadores y metas (Rojo)"
                description="Indicador, meta y disparador. Tabla del lateral del PPT."
                expanded={open === 'triggers'} onChange={handle('triggers')}
            >
                <TriggersSection ws={ws} />
            </Section>
            <Section
                title="Carta SIC · Resultados Actuales (Amarillo)"
                description="Gráfico SIC con tabs por KPI."
                expanded={open === 'sic'} onChange={handle('sic')}
            >
                <SicSection ws={ws} />
            </Section>
            <Section
                title="Planes de Reacción (Verde)"
                description="Caja amarilla (5 Porqué) y caja roja (Relato de Anomalía)."
                expanded={open === 'plans'} onChange={handle('plans')}
            >
                <ReactionPlansSection ws={ws} />
            </Section>
            <Section
                title="Top / Bottom Performers (Rosado)"
                description="Ranking de personal según un KPI configurable."
                expanded={open === 'performers'} onChange={handle('performers')}
            >
                <PerformersSection ws={ws} />
            </Section>
            <Section
                title="QRs · Documentos PDF (Verde)"
                description="Subí SOPs / OPLs y se muestran como QRs en la TV."
                expanded={open === 'qrdoc'} onChange={handle('qrdoc')}
            >
                <QrDocumentsSection ws={ws} />
            </Section>
            <Section
                title="QRs · Links externos (Verde)"
                description="Apuntá a URLs externas (Forms, web, lo que sea)."
                expanded={open === 'qrext'} onChange={handle('qrext')}
            >
                <QrExternalsSection ws={ws} />
            </Section>
            <Section
                title="Imágenes (Verde)"
                description="Logos, infografías, fotos del área."
                expanded={open === 'images'} onChange={handle('images')}
            >
                <ImagesSection ws={ws} />
            </Section>
        </Box>
    );
}

function Section({
    title, description, expanded, onChange, children,
}: {
    title: string; description: string; expanded: boolean;
    onChange: (e: any, exp: boolean) => void;
    children: React.ReactNode;
}) {
    return (
        <Accordion expanded={expanded} onChange={onChange} disableGutters elevation={0}
            sx={{ borderBottom: 1, borderColor: 'divider', '&:before': { display: 'none' } }}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5 }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
                    <Typography variant="caption" color="text.secondary">{description}</Typography>
                </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 3 }}>
                {children}
            </AccordionDetails>
        </Accordion>
    );
}

// ────── Hooks helpers ──────

/** Devuelve el bloque único del type indicado, o null si no existe. */
function findUniqueBlock(ws: Workstation, type: BlockType): WorkstationBlock | null {
    return ws.blocks.find(b => b.type === type) || null;
}

/** Hook para crear/actualizar el bloque único de un tipo. */
function useUniqueBlockSaver(ws: Workstation, type: BlockType) {
    const [createBlock] = useCreateBlockMutation();
    const [updateBlock] = useUpdateBlockMutation();

    return async (config: any) => {
        const existing = findUniqueBlock(ws, type);
        if (existing) {
            await updateBlock({ id: existing.id, workstationId: ws.id, data: { config } }).unwrap();
        } else {
            const size = DEFAULT_SIZE[type];
            await createBlock({
                workstation: ws.id, type, config,
                grid_x: size.x, grid_y: size.y, grid_w: size.w, grid_h: size.h,
                is_active: true,
            }).unwrap();
        }
    };
}

// ────── Sección: Riesgos ──────

function RisksSection({ ws }: { ws: Workstation }) {
    const { data: catalog = [] } = useGetRiskCatalogQuery();
    const block = findUniqueBlock(ws, 'RISKS');
    const cfg = (block?.config || { catalog_ids: [] }) as RisksBlockConfig;
    const save = useUniqueBlockSaver(ws, 'RISKS');

    const [selected, setSelected] = useState<Set<number>>(new Set(cfg.catalog_ids || []));
    useEffect(() => { setSelected(new Set(cfg.catalog_ids || [])); }, [block]);

    const onSave = async () => {
        await save({ ...cfg, title: cfg.title || 'Riesgos del área', catalog_ids: Array.from(selected) });
        toast.success('Riesgos guardados');
    };

    return (
        <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {catalog.map(r => (
                    <Chip
                        key={r.id} label={r.name} clickable size="small"
                        color={selected.has(r.id) ? 'warning' : 'default'}
                        variant={selected.has(r.id) ? 'filled' : 'outlined'}
                        onClick={() => {
                            const next = new Set(selected);
                            if (next.has(r.id)) next.delete(r.id); else next.add(r.id);
                            setSelected(next);
                        }}
                    />
                ))}
            </Box>
            <Button startIcon={<SaveIcon />} variant="contained" size="small" onClick={onSave}
                sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
                Guardar riesgos
            </Button>
        </Stack>
    );
}

// ────── Sección: Prohibiciones ──────

function ProhibitionsSection({ ws }: { ws: Workstation }) {
    const { data: catalog = [] } = useGetProhibitionCatalogQuery();
    const block = findUniqueBlock(ws, 'PROHIBITIONS');
    const cfg = (block?.config || { catalog_ids: [] }) as ProhibitionsBlockConfig;
    const save = useUniqueBlockSaver(ws, 'PROHIBITIONS');

    const [selected, setSelected] = useState<Set<number>>(new Set(cfg.catalog_ids || []));
    useEffect(() => { setSelected(new Set(cfg.catalog_ids || [])); }, [block]);

    const onSave = async () => {
        await save({ ...cfg, title: cfg.title || 'Prohibiciones del área', catalog_ids: Array.from(selected) });
        toast.success('Prohibiciones guardadas');
    };

    return (
        <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {catalog.map(p => (
                    <Chip
                        key={p.id} label={p.name} clickable size="small"
                        color={selected.has(p.id) ? 'error' : 'default'}
                        variant={selected.has(p.id) ? 'filled' : 'outlined'}
                        onClick={() => {
                            const next = new Set(selected);
                            if (next.has(p.id)) next.delete(p.id); else next.add(p.id);
                            setSelected(next);
                        }}
                    />
                ))}
            </Box>
            <Button startIcon={<SaveIcon />} variant="contained" color="error" size="small" onClick={onSave}
                sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
                Guardar prohibiciones
            </Button>
        </Stack>
    );
}

// ────── Sección: Disparadores ──────
// Conectado a KPI Targets: el usuario elige qué métricas mostrar y los valores
// (meta / disparador / unidad / dirección) salen automáticamente de la
// configuración vigente de Metas KPI del CD. Si la meta cambia en
// /maintenance/metric-types, el bloque se actualiza solo en la TV (vía WS).

function TriggersSection({ ws }: { ws: Workstation }) {
    const block = findUniqueBlock(ws, 'TRIGGERS');
    const cfg = (block?.config || { metric_codes: [], items: [] }) as TriggersBlockConfig;
    const save = useUniqueBlockSaver(ws, 'TRIGGERS');

    const { data } = useGetAvailableKpisQuery(ws.id);
    const availableKpis = data?.items || [];
    const diag = data?.diagnostics;
    const [selected, setSelected] = useState<Set<string>>(
        new Set(cfg.metric_codes || []),
    );
    useEffect(() => { setSelected(new Set(cfg.metric_codes || [])); }, [block]);

    const onSave = async () => {
        await save({
            ...cfg,
            title: cfg.title || 'Disparador resolución de problemas',
            metric_codes: Array.from(selected),
            items: [],  // descartamos legacy items, el backend expande desde metric_codes
        });
        toast.success('Disparadores guardados');
    };

    const dirty = (() => {
        const initial = new Set(cfg.metric_codes || []);
        if (selected.size !== initial.size) return true;
        for (const c of selected) if (!initial.has(c)) return true;
        return false;
    })();

    return (
        <Stack spacing={1.5}>
            <Alert severity="info" sx={{ borderRadius: 1 }}>
                Los disparadores salen de las <b>Metas KPI</b> del Centro de Distribución
                (Mantenimiento → CD → Métricas de Desempeño). Aquí elegís cuáles mostrar
                en este bloque; meta y disparador se actualizan automáticamente cuando
                se editan ahí.
            </Alert>

            {availableKpis.length === 0 ? (
                <KpiEmptyAlert diag={diag} ws={ws} />
            ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {availableKpis.map(k => {
                        const on = selected.has(k.code);
                        return (
                            <Chip
                                key={k.code} clickable size="small"
                                color={on ? 'primary' : 'default'}
                                variant={on ? 'filled' : 'outlined'}
                                label={
                                    <Box component="span">
                                        <b>{k.name}</b>
                                        <Box component="span" sx={{ opacity: 0.85, ml: 0.5 }}>
                                            · {k.meta}{k.disparador ? ` → ${k.disparador}` : ''}{k.unit ? ` ${k.unit}` : ''}
                                        </Box>
                                    </Box>
                                }
                                onClick={() => {
                                    const next = new Set(selected);
                                    if (next.has(k.code)) next.delete(k.code); else next.add(k.code);
                                    setSelected(next);
                                }}
                            />
                        );
                    })}
                </Box>
            )}

            <Button startIcon={<SaveIcon />} variant="contained" size="small"
                onClick={onSave} disabled={!dirty}
                sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
                Guardar disparadores
            </Button>
        </Stack>
    );
}

// Alerta diagnóstica para cuando available_kpis devuelve 0. Muestra al usuario
// el motivo concreto (legacy / metric inactivo / fuera de vigencia / no hay
// targets) y un botón para ir directamente al editor de KPI Targets.
function KpiEmptyAlert({ diag, ws }: {
    diag?: {
        distributor_center_id: number | null;
        total_targets: number; legacy_targets: number; targets_with_metric: number;
        inactive_metric_type: number; not_yet_effective: number; expired: number; today: string;
    };
    ws?: Workstation;
}) {
    if (!diag) {
        return (
            <Alert severity="warning" sx={{ borderRadius: 1 }}>
                Este CD no tiene KPIs configurados con meta vigente.
            </Alert>
        );
    }

    const reasons: string[] = [];
    if (diag.total_targets === 0) {
        reasons.push(
            `El CD #${diag.distributor_center_id} (${ws?.distributor_center_name || 'sin nombre'}) `
            + 'aún no tiene Metas KPI cargadas. Si configuraste metas en otro CD, las vas a ver acá '
            + 'solo si este workstation pertenece a ese mismo CD.'
        );
    } else {
        if (diag.legacy_targets > 0 && diag.targets_with_metric === 0) {
            reasons.push(
                `Las ${diag.legacy_targets} metas existentes son legacy (sin Tipo de Métrica vinculado).`
                + ' Vinculá un Tipo de Métrica al editar cada meta para que aparezcan acá.'
            );
        }
        if (diag.inactive_metric_type > 0) {
            reasons.push(
                `${diag.inactive_metric_type} meta(s) están vinculadas a Tipos de Métrica inactivos`
                + ' — actívalos en /maintenance/metric-types.'
            );
        }
        if (diag.not_yet_effective > 0) {
            reasons.push(`${diag.not_yet_effective} meta(s) tienen "Vigente Desde" en el futuro (hoy: ${diag.today}).`);
        }
        if (diag.expired > 0) {
            reasons.push(`${diag.expired} meta(s) ya expiraron (Vigente Hasta < ${diag.today}).`);
        }
        if (reasons.length === 0) {
            reasons.push(
                `El CD tiene ${diag.total_targets} meta(s), pero ninguna pasó los filtros — `
                + ' revisá vinculación a Tipo de Métrica, vigencia y estado activo.'
            );
        }
    }

    return (
        <Alert
            severity="warning"
            sx={{ borderRadius: 1 }}
            action={
                <Button
                    component={RouterLink}
                    to="/maintenance/metric-types"
                    size="small"
                    color="inherit"
                    variant="outlined"
                >
                    Configurar Metas KPI
                </Button>
            }
        >
            <Typography variant="body2" fontWeight={700} gutterBottom>
                Sin disparadores disponibles para CD #{diag.distributor_center_id}
                {ws?.distributor_center_name ? ` (${ws.distributor_center_name})` : ''}
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
                {reasons.map((r, i) => (
                    <li key={i}><Typography variant="caption">{r}</Typography></li>
                ))}
            </ul>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Diagnóstico: total {diag.total_targets} · legacy {diag.legacy_targets} · con métrica {diag.targets_with_metric} · métrica inactiva {diag.inactive_metric_type} · vencidas {diag.expired}
            </Typography>
        </Alert>
    );
}

// ────── Sección: SIC Chart ──────
// Misma fuente que Disparadores: KPI Targets del CD. Acá elegís cuáles
// indicadores aparecen en el SIC y, opcionalmente, si la TV cicla entre ellos.
// Los umbrales (verde/amarillo/rojo) salen del KpiTarget vigente — meta y
// disparador. Si cambian en /maintenance/metric-types, las zonas se reajustan.

function SicSection({ ws }: { ws: Workstation }) {
    const block = findUniqueBlock(ws, 'SIC_CHART');
    const cfg = (block?.config || { metric_codes: [], kpis: [] }) as SicChartBlockConfig;
    const save = useUniqueBlockSaver(ws, 'SIC_CHART');

    const { data } = useGetAvailableKpisQuery(ws.id);
    const availableKpis = data?.items || [];
    const sicDiag = data?.diagnostics;
    const [selected, setSelected] = useState<Set<string>>(new Set(cfg.metric_codes || []));
    const [cycle, setCycle] = useState(cfg.cycle_seconds || 0);
    useEffect(() => {
        setSelected(new Set(cfg.metric_codes || []));
        setCycle(cfg.cycle_seconds || 0);
    }, [block]);

    const onSave = async () => {
        await save({
            ...cfg,
            title: cfg.title || 'SIC / Pi Crítico',
            metric_codes: Array.from(selected),
            kpis: [],  // descarte: el backend expande desde metric_codes
            cycle_seconds: cycle,
        });
        toast.success('SIC guardado');
    };

    return (
        <Stack spacing={1.5}>
            <Alert severity="info" sx={{ borderRadius: 1 }}>
                El SIC usa los <b>mismos KPI Targets del CD</b> que el bloque
                Disparadores. Las zonas verde/amarillo/rojo salen automáticamente
                de meta y disparador.
            </Alert>

            <TextField
                size="small" type="number"
                label="Ciclar entre KPIs cada (segundos, 0 = no ciclar)"
                value={cycle}
                onChange={e => setCycle(Number(e.target.value) || 0)}
            />

            {availableKpis.length === 0 ? (
                <KpiEmptyAlert diag={sicDiag} />
            ) : (
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Indicadores que se muestran en el SIC (tabs en la TV):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {availableKpis.map(k => {
                            const on = selected.has(k.code);
                            return (
                                <Chip
                                    key={k.code} clickable size="small"
                                    color={on ? 'primary' : 'default'}
                                    variant={on ? 'filled' : 'outlined'}
                                    label={
                                        <Box component="span">
                                            <b>{k.name}</b>
                                            <Box component="span" sx={{ opacity: 0.85, ml: 0.5 }}>
                                                · {k.meta}{k.disparador ? ` → ${k.disparador}` : ''}{k.unit ? ` ${k.unit}` : ''}
                                            </Box>
                                        </Box>
                                    }
                                    onClick={() => {
                                        const next = new Set(selected);
                                        if (next.has(k.code)) next.delete(k.code); else next.add(k.code);
                                        setSelected(next);
                                    }}
                                />
                            );
                        })}
                    </Box>
                </Box>
            )}

            <Button startIcon={<SaveIcon />} variant="contained" size="small"
                onClick={onSave} sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
                Guardar SIC
            </Button>
        </Stack>
    );
}

// ────── Sección: Planes de Reacción ──────

function ReactionPlansSection({ ws }: { ws: Workstation }) {
    const block = findUniqueBlock(ws, 'REACTION_PLANS');
    const cfg = (block?.config || {
        kpi_label: 'Indicador principal',
        yellow: { title: '', description: '' },
        red:    { title: '', description: '' },
    }) as ReactionPlansBlockConfig;
    const save = useUniqueBlockSaver(ws, 'REACTION_PLANS');

    const [form, setForm] = useState<ReactionPlansBlockConfig>(cfg);
    useEffect(() => { setForm(cfg); }, [block]);

    const onSave = async () => {
        await save({ ...form, title: form.title || 'Planes de Reacción' });
        toast.success('Planes guardados');
    };

    const setYellow = (key: string, val: string) =>
        setForm({ ...form, yellow: { ...form.yellow, [key]: val } });
    const setRed = (key: string, val: string) =>
        setForm({ ...form, red: { ...form.red, [key]: val } });

    return (
        <Stack spacing={1.5}>
            <TextField size="small" label="Etiqueta del KPI"
                value={form.kpi_label || ''}
                onChange={e => setForm({ ...form, kpi_label: e.target.value })} />
            <Divider><Chip size="small" label="Zona Amarilla · 5 Porqué" color="warning" /></Divider>
            <TextField size="small" label="Título"
                value={form.yellow?.title || ''} onChange={e => setYellow('title', e.target.value)} />
            <TextField size="small" multiline minRows={2} label="Descripción"
                value={form.yellow?.description || ''} onChange={e => setYellow('description', e.target.value)} />
            <TextField size="small" label="URL del QR (opcional, ej: Forms del 5 Porqué)"
                value={form.yellow?.qr_url || ''} onChange={e => setYellow('qr_url', e.target.value)} />
            <TextField size="small" label="Etiqueta debajo del QR"
                value={form.yellow?.qr_label || ''} onChange={e => setYellow('qr_label', e.target.value)}
                placeholder="5 PORQUÉ" />
            <Divider><Chip size="small" label="Zona Roja · Relato de Anomalía" color="error" /></Divider>
            <TextField size="small" label="Título"
                value={form.red?.title || ''} onChange={e => setRed('title', e.target.value)} />
            <TextField size="small" multiline minRows={2} label="Descripción"
                value={form.red?.description || ''} onChange={e => setRed('description', e.target.value)} />
            <Button startIcon={<SaveIcon />} variant="contained" size="small" onClick={onSave}
                sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
                Guardar planes
            </Button>
        </Stack>
    );
}

// ────── Sección: Top / Bottom Performers ──────
// Configuración del bloque PERFORMERS: qué KPI usar, cuántos mostrar, período.

function PerformersSection({ ws }: { ws: Workstation }) {
    const block = findUniqueBlock(ws, 'PERFORMERS');
    const cfg = (block?.config || {}) as PerformersBlockConfig;
    const save = useUniqueBlockSaver(ws, 'PERFORMERS');

    const { data } = useGetAvailableKpisQuery(ws.id);
    const availableKpis = data?.items || [];
    const diag = data?.diagnostics;

    const [metricCode, setMetricCode] = useState<string>(cfg.metric_code || '');
    const [topCount, setTopCount] = useState<number>(cfg.top_count ?? 3);
    const [bottomCount, setBottomCount] = useState<number>(cfg.bottom_count ?? 3);
    const [period, setPeriod] = useState<'today' | 'week'>(cfg.period ?? 'today');

    useEffect(() => {
        setMetricCode(cfg.metric_code || '');
        setTopCount(cfg.top_count ?? 3);
        setBottomCount(cfg.bottom_count ?? 3);
        setPeriod(cfg.period ?? 'today');
    }, [block]);

    const onSave = async () => {
        await save({
            ...cfg,
            metric_code: metricCode || undefined,
            top_count: clamp(topCount, 1, 10),
            bottom_count: clamp(bottomCount, 1, 10),
            period,
        });
        toast.success('Performers guardados');
    };

    return (
        <Stack spacing={1.5}>
            <Alert severity="info" sx={{ borderRadius: 1 }}>
                Mostra el ranking de personal del CD según un KPI. La data se actualiza cada
                minuto. La dirección (mayor o menor es mejor) se respeta automáticamente —
                top y bottom se calculan en consecuencia.
            </Alert>

            {availableKpis.length === 0 ? (
                <KpiEmptyAlert diag={diag} ws={ws} />
            ) : (
                <>
                    <TextField
                        select
                        size="small"
                        label="KPI para rankear"
                        value={metricCode}
                        onChange={e => setMetricCode(e.target.value)}
                        SelectProps={{ native: true }}
                    >
                        <option value="">— Sin KPI configurado —</option>
                        {availableKpis.map(k => (
                            <option key={k.code} value={k.code}>
                                {k.name}{k.unit ? ` (${k.unit})` : ''}
                            </option>
                        ))}
                    </TextField>

                    <Stack direction="row" spacing={1.5}>
                        <TextField
                            size="small" type="number" label="Top (1-10)"
                            value={topCount}
                            onChange={e => setTopCount(Number(e.target.value) || 3)}
                            inputProps={{ min: 1, max: 10 }}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            size="small" type="number" label="Bottom (1-10)"
                            value={bottomCount}
                            onChange={e => setBottomCount(Number(e.target.value) || 3)}
                            inputProps={{ min: 1, max: 10 }}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            select size="small" label="Período"
                            value={period}
                            onChange={e => setPeriod(e.target.value as 'today' | 'week')}
                            SelectProps={{ native: true }}
                            sx={{ flex: 1 }}
                        >
                            <option value="today">Hoy</option>
                            <option value="week">Últimos 7 días</option>
                        </TextField>
                    </Stack>
                </>
            )}

            <Button startIcon={<SaveIcon />} variant="contained" size="small"
                onClick={onSave} disabled={availableKpis.length === 0}
                sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
                Guardar performers
            </Button>
        </Stack>
    );
}

function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
}

// ────── Sección: QRs · Documentos PDF ──────

function QrDocumentsSection({ ws }: { ws: Workstation }) {
    const blocks = ws.blocks.filter(b => b.type === 'QR_DOCUMENT');
    const [createBlock] = useCreateBlockMutation();
    const [deleteBlock] = useDeleteBlockMutation();
    const [uploadDoc, { isLoading: uploading }] = useUploadDocumentMutation();
    const [deleteDoc] = useDeleteDocumentMutation();

    const onAdd = async (file: File) => {
        const name = window.prompt('Nombre del documento:', file.name.replace(/\.pdf$/i, ''));
        if (!name) return;
        const docType = window.prompt('Tipo (SOP / OPL / OTHER):', 'SOP') || 'SOP';
        const normalized = ['SOP', 'OPL', 'OTHER'].includes(docType.toUpperCase()) ? docType.toUpperCase() : 'SOP';
        try {
            const doc = await uploadDoc({ workstationId: ws.id, doc_type: normalized, name, file }).unwrap();
            const size = DEFAULT_SIZE.QR_DOCUMENT;
            await createBlock({
                workstation: ws.id, type: 'QR_DOCUMENT',
                config: { document_id: doc.id, title: doc.name } as QrDocumentBlockConfig,
                grid_x: size.x, grid_y: size.y, grid_w: size.w, grid_h: size.h,
                is_active: true,
            }).unwrap();
            toast.success('QR agregado');
        } catch (e: any) {
            toast.error('Error: ' + (e?.data?.detail || 'desconocido'));
        }
    };

    const onRemove = async (block: WorkstationBlock) => {
        if (!window.confirm('¿Quitar este QR del layout?')) return;
        const docId = (block.config as QrDocumentBlockConfig).document_id;
        await deleteBlock({ id: block.id, workstationId: ws.id }).unwrap();
        if (docId && window.confirm('¿Eliminar también el archivo PDF subido?')) {
            await deleteDoc({ id: docId, workstationId: ws.id });
        }
    };

    return (
        <Stack spacing={1.5}>
            {blocks.length === 0 && (
                <Alert severity="info" sx={{ borderRadius: 1 }}>
                    Sin documentos. Subí un PDF para que aparezca como QR en la TV.
                </Alert>
            )}
            {blocks.map(b => {
                const cfg = b.config as QrDocumentBlockConfig;
                const doc = ws.documents.find(d => d.id === cfg.document_id);
                return (
                    <Box key={b.id} sx={{
                        display: 'flex', alignItems: 'center', gap: 2,
                        p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1,
                    }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography fontWeight={700} noWrap>
                                {doc ? `[${doc.doc_type}] ${doc.name}` : 'Documento eliminado'}
                            </Typography>
                            {doc && (
                                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                                    {window.location.origin}{doc.qr_url}
                                </Typography>
                            )}
                        </Box>
                        {doc && (
                            <Tooltip title="Abrir PDF">
                                <IconButton size="small" onClick={() => window.open(doc.qr_url, '_blank')}>
                                    <UploadIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        <IconButton size="small" color="error" onClick={() => onRemove(b)}><DeleteIcon /></IconButton>
                    </Box>
                );
            })}
            <Button component="label" startIcon={<UploadIcon />} variant="contained" size="small"
                disabled={uploading} sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
                {uploading ? 'Subiendo…' : 'Subir nuevo PDF'}
                <input type="file" hidden accept="application/pdf"
                    onChange={e => { const f = e.target.files?.[0]; if (f) onAdd(f); e.target.value = ''; }} />
            </Button>
        </Stack>
    );
}

// ────── Sección: QRs · Links externos ──────

function QrExternalsSection({ ws }: { ws: Workstation }) {
    const blocks = ws.blocks.filter(b => b.type === 'QR_EXTERNAL');
    const [createBlock] = useCreateBlockMutation();
    const [updateBlock] = useUpdateBlockMutation();
    const [deleteBlock] = useDeleteBlockMutation();

    const [draft, setDraft] = useState<{ url: string; label: string }>({ url: '', label: '' });

    const onAdd = async () => {
        if (!draft.url.trim()) {
            toast.error('Ingresá la URL primero');
            return;
        }
        const size = DEFAULT_SIZE.QR_EXTERNAL;
        await createBlock({
            workstation: ws.id, type: 'QR_EXTERNAL',
            config: { url: draft.url.trim(), label: draft.label.trim() || 'Escanear' } as QrExternalBlockConfig,
            grid_x: size.x, grid_y: size.y, grid_w: size.w, grid_h: size.h,
            is_active: true,
        }).unwrap();
        setDraft({ url: '', label: '' });
        toast.success('QR externo agregado');
    };

    return (
        <Stack spacing={1.5}>
            {blocks.length === 0 && (
                <Alert severity="info" sx={{ borderRadius: 1 }}>
                    Sin QRs externos. Agregá uno apuntando a un Microsoft Forms u otra URL.
                </Alert>
            )}
            {blocks.map(b => (
                <QrExternalRow key={b.id} block={b} workstationId={ws.id}
                    onUpdate={(cfg) => updateBlock({ id: b.id, workstationId: ws.id, data: { config: cfg } })}
                    onDelete={async () => {
                        if (window.confirm('¿Quitar este QR externo?')) {
                            await deleteBlock({ id: b.id, workstationId: ws.id });
                        }
                    }}
                />
            ))}
            <Box sx={{ p: 1.5, border: 1, borderColor: 'primary.main', borderRadius: 1, bgcolor: 'primary.50' }}>
                <Stack spacing={1}>
                    <Typography variant="caption" fontWeight={700} color="primary.main">
                        Agregar nuevo QR externo
                    </Typography>
                    <TextField size="small" label="URL" required placeholder="https://forms.office.com/…"
                        value={draft.url} onChange={e => setDraft({ ...draft, url: e.target.value })} />
                    <TextField size="small" label="Etiqueta debajo del QR" placeholder="Ej: 5 PORQUÉ"
                        value={draft.label} onChange={e => setDraft({ ...draft, label: e.target.value })} />
                    <Button startIcon={<LinkIcon />} variant="contained" size="small" onClick={onAdd}
                        sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
                        disabled={!draft.url.trim()}>
                        Agregar QR externo
                    </Button>
                </Stack>
            </Box>
        </Stack>
    );
}

function QrExternalRow({
    block, onUpdate, onDelete,
}: {
    block: WorkstationBlock; workstationId: number;
    onUpdate: (cfg: QrExternalBlockConfig) => void;
    onDelete: () => void;
}) {
    const cfg = block.config as QrExternalBlockConfig;
    const [url, setUrl] = useState(cfg.url || '');
    const [label, setLabel] = useState(cfg.label || '');
    useEffect(() => { setUrl(cfg.url || ''); setLabel(cfg.label || ''); }, [block]);

    const dirty = url !== cfg.url || label !== cfg.label;

    return (
        <Box sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Stack spacing={1}>
                <TextField size="small" label="URL" value={url} onChange={e => setUrl(e.target.value)} />
                <TextField size="small" label="Etiqueta" value={label} onChange={e => setLabel(e.target.value)} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {dirty && (
                        <Button size="small" variant="contained" startIcon={<SaveIcon />}
                            onClick={() => onUpdate({ ...cfg, url, label })}
                            sx={{ textTransform: 'none' }}>
                            Guardar
                        </Button>
                    )}
                    <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={onDelete}
                        sx={{ textTransform: 'none', ml: 'auto' }}>
                        Quitar
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
}

// ────── Sección: Imágenes ──────

function ImagesSection({ ws }: { ws: Workstation }) {
    const blocks = ws.blocks.filter(b => b.type === 'IMAGE');
    const [createBlock] = useCreateBlockMutation();
    const [deleteBlock] = useDeleteBlockMutation();
    const [uploadImg, { isLoading: uploading }] = useUploadImageMutation();
    const [deleteImg] = useDeleteImageMutation();

    const onAdd = async (file: File) => {
        const name = window.prompt('Nombre de la imagen:', file.name);
        if (!name) return;
        try {
            const img = await uploadImg({ workstationId: ws.id, name, file }).unwrap();
            const size = DEFAULT_SIZE.IMAGE;
            await createBlock({
                workstation: ws.id, type: 'IMAGE',
                config: { image_id: img.id, fit: 'contain', title: name } as ImageBlockConfig,
                grid_x: size.x, grid_y: size.y, grid_w: size.w, grid_h: size.h,
                is_active: true,
            }).unwrap();
            toast.success('Imagen agregada');
        } catch (e: any) {
            toast.error('Error: ' + (e?.data?.detail || 'desconocido'));
        }
    };

    const onRemove = async (b: WorkstationBlock) => {
        if (!window.confirm('¿Quitar esta imagen del layout?')) return;
        const imgId = (b.config as ImageBlockConfig).image_id;
        await deleteBlock({ id: b.id, workstationId: ws.id }).unwrap();
        if (imgId && window.confirm('¿Eliminar también el archivo subido?')) {
            await deleteImg({ id: imgId, workstationId: ws.id });
        }
    };

    return (
        <Stack spacing={1.5}>
            {blocks.length === 0 && (
                <Alert severity="info" sx={{ borderRadius: 1 }}>
                    Sin imágenes en el layout.
                </Alert>
            )}
            {blocks.map(b => {
                const cfg = b.config as ImageBlockConfig;
                const img = ws.images.find(i => i.id === cfg.image_id);
                return (
                    <Box key={b.id} sx={{
                        display: 'flex', alignItems: 'center', gap: 2,
                        p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1,
                    }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography fontWeight={700}>{img?.name || 'Imagen sin archivo'}</Typography>
                        </Box>
                        <IconButton size="small" color="error" onClick={() => onRemove(b)}><DeleteIcon /></IconButton>
                    </Box>
                );
            })}
            <Button component="label" startIcon={<ImageIcon />} variant="contained" size="small"
                disabled={uploading} sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
                {uploading ? 'Subiendo…' : 'Subir nueva imagen'}
                <input type="file" hidden accept="image/*"
                    onChange={e => { const f = e.target.files?.[0]; if (f) onAdd(f); e.target.value = ''; }} />
            </Button>
        </Stack>
    );
}
