import { Chip } from '@mui/material';
import type { PautaStatus } from '../interfaces/truckCycle';

const STATUS_CONFIG: Record<PautaStatus, { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }> = {
    PENDING_PICKING: { label: 'Pendiente de Picking', color: 'default' },
    PICKING_ASSIGNED: { label: 'Picker Asignado', color: 'info' },
    PICKING_IN_PROGRESS: { label: 'Picking en Progreso', color: 'info' },
    PICKING_DONE: { label: 'Picking Completado', color: 'info' },
    IN_BAY: { label: 'En Bahia', color: 'warning' },
    PENDING_COUNT: { label: 'Pendiente de Conteo', color: 'warning' },
    COUNTING: { label: 'En Conteo', color: 'warning' },
    COUNTED: { label: 'Contado', color: 'warning' },
    PENDING_CHECKOUT: { label: 'Pendiente de Checkout', color: 'secondary' },
    CHECKOUT_SECURITY: { label: 'Checkout Seguridad', color: 'secondary' },
    CHECKOUT_OPS: { label: 'Checkout Operaciones', color: 'secondary' },
    DISPATCHED: { label: 'Despachado', color: 'success' },
    IN_RELOAD_QUEUE: { label: 'En Cola de Recarga', color: 'info' },
    PENDING_RETURN: { label: 'Pendiente de Retorno', color: 'error' },
    RETURN_PROCESSED: { label: 'Retorno Procesado', color: 'error' },
    IN_AUDIT: { label: 'En Auditoria', color: 'warning' },
    AUDIT_COMPLETE: { label: 'Auditoria Completa', color: 'warning' },
    CLOSED: { label: 'Cerrada', color: 'default' },
    CANCELLED: { label: 'Cancelada', color: 'error' },
};

interface PautaStatusBadgeProps {
    status: PautaStatus;
    size?: 'small' | 'medium';
}

export default function PautaStatusBadge({ status, size = 'small' }: PautaStatusBadgeProps) {
    const config = STATUS_CONFIG[status] || { label: status, color: 'default' as const };

    return (
        <Chip
            label={config.label}
            color={config.color}
            size={size}
            variant="filled"
        />
    );
}
