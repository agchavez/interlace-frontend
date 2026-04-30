/**
 * Tab "Estaciones de Trabajo" dentro de DistributorCenterDetailPage.
 *
 * Lista las 4 estaciones por rol del CD (Picking, Picker, Contador, Chofer
 * de Patio) como cards limpios. Al hacer click, abre un Drawer lateral con
 * el formulario completo de configuración (riesgos, prohibiciones, planes,
 * documentos).
 */
import { useEffect, useMemo, useState } from 'react';
import {
    Box, Grid, Paper, Typography, Button, Chip, CircularProgress, Stack,
} from '@mui/material';
import {
    useGetWorkstationsQuery,
    useEnsureWorkstationMutation,
} from '../services/workstationApi';
import {
    ROLE_LABELS,
    type WorkstationListItem,
    type WorkstationRole,
} from '../interfaces/workstation';
import WorkstationConfigDrawer from './WorkstationConfigDrawer';

// PICKING quedó deprecated — solo se muestran las estaciones canónicas.
// El rol sigue existiendo en backend para no romper datos viejos.
const ROLE_ORDER: WorkstationRole[] = ['PICKER', 'COUNTER', 'YARD', 'REPACK'];

const ROLE_DESCRIPTION: Record<WorkstationRole, string> = {
    PICKING: 'Estación legacy del operador de picking.',
    PICKER:  'Operador que arma cargas desde el almacén.',
    COUNTER: 'Personal que verifica el conteo final del pedido.',
    YARD:    'Chofer de patio que mueve unidades entre bahías.',
    REPACK:  'Auditoría y reempaque de mercancía.',
};

interface Props {
    distributorCenterId: number;
    distributorCenterName: string;
}

export default function WorkstationsTab({ distributorCenterId, distributorCenterName }: Props) {
    const { data: rows = [], isLoading } = useGetWorkstationsQuery({
        distributor_center: distributorCenterId,
        limit: 1000,
    });
    const [ensureWs] = useEnsureWorkstationMutation();
    const [activeId, setActiveId] = useState<number | null>(null);

    // Defensa: solo aceptamos WS que realmente pertenezcan al CD pedido.
    // Si el filtro del backend fallara por algún motivo, esto evita que se
    // muestren cards de otro CD aquí.
    const safeRows = useMemo(
        () => rows.filter((ws) => ws.distributor_center === distributorCenterId),
        [rows, distributorCenterId],
    );
    const mismatched = rows.length - safeRows.length;

    useEffect(() => {
        if (mismatched > 0) {
            // Loguear las WS sospechosas para diagnóstico.
            // eslint-disable-next-line no-console
            console.warn(
                `[WorkstationsTab] El backend devolvió ${mismatched} workstation(s) de otro CD `
                + `cuando se filtró por distributor_center=${distributorCenterId}. `
                + `Workstations devueltas:`,
                rows.map((r) => ({ id: r.id, role: r.role, dc: r.distributor_center })),
            );
        }
    }, [mismatched, rows, distributorCenterId]);

    const byRole = useMemo<Record<WorkstationRole, WorkstationListItem | undefined>>(() => {
        const map = {} as Record<WorkstationRole, WorkstationListItem | undefined>;
        for (const ws of safeRows) map[ws.role] = ws;
        return map;
    }, [safeRows]);

    const onConfigure = async (role: WorkstationRole) => {
        // Endpoint idempotente: si ya existe `(CD, role)` la trae, sino la crea.
        // Necesario porque la lista cargada puede estar stale por caché o
        // paginación, lo que antes causaba un 400 al re-crear.
        const ws = await ensureWs({
            distributor_center: distributorCenterId,
            role,
        }).unwrap();
        setActiveId(ws.id);
    };

    if (isLoading) {
        return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>;
    }

    return (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                    Estaciones de Trabajo
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Configurá los riesgos, planes de reacción y documentos (SOPs / OPLs) que se muestran en
                    la TV de cada rol del centro.
                </Typography>
            </Box>

            <Grid container spacing={2}>
                {ROLE_ORDER.map(role => {
                    const ws = byRole[role];
                    return (
                        <Grid key={role} item xs={12} sm={6} md={6}>
                            <RoleCard
                                role={role}
                                ws={ws}
                                onConfigure={() => onConfigure(role)}
                            />
                        </Grid>
                    );
                })}
            </Grid>

            <WorkstationConfigDrawer
                open={activeId !== null}
                workstationId={activeId}
                onClose={() => setActiveId(null)}
                centerName={distributorCenterName}
                expectedDcId={distributorCenterId}
            />
        </Box>
    );
}

function RoleCard({
    role, ws, onConfigure,
}: {
    role: WorkstationRole;
    ws: WorkstationListItem | undefined;
    onConfigure: () => void;
}) {
    const configured = !!ws;
    const incomplete = configured && ws!.blocks_count === 0;

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2.5, borderRadius: 2,
                borderColor: configured ? (incomplete ? 'warning.light' : 'primary.main') : 'divider',
                borderWidth: configured ? 1.5 : 1,
                transition: 'border-color .2s ease, box-shadow .2s ease',
                '&:hover': { boxShadow: 2 },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                        {ROLE_LABELS[role]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                        {ROLE_DESCRIPTION[role]}
                    </Typography>
                </Box>
                {configured ? (
                    <Chip
                        size="small"
                        label={ws!.is_active ? 'Activa' : 'Inactiva'}
                        color={ws!.is_active ? (incomplete ? 'warning' : 'success') : 'default'}
                        sx={{ flexShrink: 0 }}
                    />
                ) : (
                    <Chip size="small" label="Sin configurar" sx={{ flexShrink: 0 }} />
                )}
            </Box>

            {configured && (
                <Stack direction="row" spacing={2} sx={{ my: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Stat label="Bloques" value={ws!.blocks_count} />
                    <Stat label="Documentos" value={ws!.documents_count} />
                </Stack>
            )}

            <Box sx={{ display: 'flex', gap: 1, mt: configured ? 1.5 : 2 }}>
                <Button
                    fullWidth
                    variant={configured ? 'outlined' : 'contained'}
                    onClick={onConfigure}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                    {configured ? 'Editar configuración' : 'Configurar estación'}
                </Button>
                {configured && (
                    <Button
                        variant="text"
                        onClick={() => window.open(`/tv/dashboard/workstation_${role.toLowerCase()}`, '_blank')}
                        sx={{ textTransform: 'none', fontWeight: 600, flexShrink: 0 }}
                    >
                        Ver TV
                    </Button>
                )}
            </Box>
        </Paper>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                {label}
            </Typography>
            <Typography variant="body1" fontWeight={700} sx={{ lineHeight: 1.1 }}>
                {value}
            </Typography>
        </Box>
    );
}
