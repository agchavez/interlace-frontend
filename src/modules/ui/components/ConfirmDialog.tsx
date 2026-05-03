/**
 * Confirmación con dialog MUI en lugar de `window.confirm`.
 *
 * Uso:
 *   const confirm = useConfirm();
 *   const ok = await confirm({
 *     title: 'Cerrar sesión',
 *     message: 'Se calculará la métrica final. ¿Continuar?',
 *     confirmText: 'Cerrar sesión',
 *     confirmColor: 'success',
 *   });
 *   if (!ok) return;
 *
 * Setup: envolver el árbol con <ConfirmProvider> en main.tsx / App.
 */
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';
import {
    HelpOutline as HelpIcon,
    Warning as WarningIcon,
    DeleteOutline as DeleteIcon,
    CheckCircleOutline as CheckIcon,
} from '@mui/icons-material';


type Color = 'primary' | 'success' | 'error' | 'warning';

export interface ConfirmOptions {
    title: string;
    message?: ReactNode;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: Color;
    /** Modifica el ícono y el tono de la severidad. */
    severity?: 'info' | 'success' | 'warning' | 'danger';
}

type Resolver = (value: boolean) => void;

interface State extends ConfirmOptions {
    open: boolean;
    resolve?: Resolver;
}

const Ctx = createContext<((opts: ConfirmOptions) => Promise<boolean>) | null>(null);


export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<State>({ open: false, title: '' });

    const confirm = useCallback((opts: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setState({ ...opts, open: true, resolve });
        });
    }, []);

    const handleClose = (result: boolean) => {
        state.resolve?.(result);
        setState((s) => ({ ...s, open: false, resolve: undefined }));
    };

    return (
        <Ctx.Provider value={confirm}>
            {children}
            <ConfirmModal state={state} onClose={handleClose} />
        </Ctx.Provider>
    );
}


export function useConfirm() {
    const ctx = useContext(Ctx);
    if (!ctx) {
        // Fallback al confirm nativo si no está envuelto en Provider — para
        // que la app no se rompa si alguien llama el hook fuera del árbol.
        return async (opts: ConfirmOptions) => window.confirm(`${opts.title}\n\n${opts.message ?? ''}`);
    }
    return ctx;
}


function ConfirmModal({ state, onClose }: { state: State; onClose: (ok: boolean) => void }) {
    const severity = state.severity ?? 'info';
    const accent = ACCENT[severity];

    return (
        <Dialog
            open={state.open}
            onClose={() => onClose(false)}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1.5 }}>
                <Avatar sx={{ bgcolor: `${accent.color}1a`, color: accent.color, width: 40, height: 40 }}>
                    {accent.icon}
                </Avatar>
                <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                    {state.title}
                </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
                {typeof state.message === 'string' ? (
                    <Typography variant="body2" color="text.secondary">
                        {state.message}
                    </Typography>
                ) : (
                    state.message
                )}
                {severity === 'danger' && (
                    <Alert severity="warning" sx={{ mt: 2, borderRadius: 1 }}>
                        Esta acción no se puede deshacer.
                    </Alert>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button
                    onClick={() => onClose(false)}
                    sx={{ textTransform: 'none' }}
                >
                    {state.cancelText ?? 'Cancelar'}
                </Button>
                <Button
                    variant="contained" disableElevation
                    onClick={() => onClose(true)}
                    color={state.confirmColor ?? (severity === 'danger' ? 'error' : 'primary')}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                    autoFocus
                >
                    {state.confirmText ?? 'Confirmar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}


const ACCENT: Record<NonNullable<ConfirmOptions['severity']>, { color: string; icon: ReactNode }> = {
    info:    { color: '#0288d1', icon: <HelpIcon /> },
    success: { color: '#16a34a', icon: <CheckIcon /> },
    warning: { color: '#f59e0b', icon: <WarningIcon /> },
    danger:  { color: '#dc2626', icon: <DeleteIcon /> },
};
