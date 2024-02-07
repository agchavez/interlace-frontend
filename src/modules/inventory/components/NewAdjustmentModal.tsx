import { Button, Dialog, DialogActions, DialogContent, styled, Typography, CircularProgress } from '@mui/material';
import { FC, useState, useEffect } from 'react';
import { toast } from "sonner";
import { useAppDispatch } from '../../../store/store';
import { createLocationAndRoute } from '../../../store/inventory/thunk';
import { InventarioMovimentResult } from '../../../interfaces/tracking';
import { SaveAltTwoTone } from '@mui/icons-material';
import { NewAdjustmentForm } from './NewAdjustmentForm';
import { VoucherNewAdjunstment } from './VoucherNewAdjunstment';
import BootstrapDialogTitle from '../../ui/components/BoostrapDialog';

interface NewAdjustmentModalProps {
    isOpen: boolean
    onClose: () => void,
    refetch: () => void
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialogContent-root": {
        padding: theme.spacing(2),
    },
    "& .MuiDialogActions-root": {
        padding: theme.spacing(1),
    },
}));

export const NewAdjustmentModal: FC<NewAdjustmentModalProps> = ({ isOpen, onClose, refetch }) => {

    const [file, setfile] = useState<{ file: File | null, fileName: string | null }>({ file: null, fileName: null });
    const handleFileChange = (file: File) => {
        // Solo se admiten .xlsx
        if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            toast.error("Solo se admiten archivos .xlsx");
            return;
        }
        setfile({ file: file, fileName: file.name });
    }

    useEffect(() => {
        if (!isOpen) {
            setfile({ file: null, fileName: null });
            setreason("");
            setpage({
                page: 'form',
                data: null,
            });
        }
    }, [isOpen])
    const [loading, setloading] = useState(false);
    const [reason, setreason] = useState<string | null>("");
    const dispatch = useAppDispatch();
    const handleConfirm = () => {
        if (page.page === 'voucher') {
            onClose();
            return;
        }
        if (!file.file) {
            toast.error("Debe seleccionar un archivo");
            return;
        }
        if (!reason) {
            toast.error("Debe ingresar un motivo");
            return;
        }
        setloading(true);
        dispatch(createLocationAndRoute(file.file, reason, onComplete));
    }

    const onComplete = (data: InventarioMovimentResult) => {
        setloading(false);
        refetch();
        if (data.data_error) {
            toast.error(`No se pudo procesar ${data.data_error.length} registros`);
        }
        toast.success(`Reajuste de inventario registrado ${data.data.length} registros`);
        setpage({
            page: 'voucher',
            data: data,
        });

    }

    const [page, setpage] = useState<{
        page: 'form' | 'voucher';
        data: InventarioMovimentResult | null;
    }>({
        page: 'form',
        data: null,
    });

    return (
        <>
            <BootstrapDialog
                open={isOpen}
                onClose={loading ? undefined : onClose}
                fullWidth={true}
                maxWidth="md"
            >
                <BootstrapDialogTitle onClose={loading ? undefined : onClose} id="customized-dialog-title">
                    <Typography variant="h6" component="div" fontWeight={400}>
                        {page.page === 'form' ? "Reajuste de inventario" : "Comprobante de registros"}
                    </Typography>
                </BootstrapDialogTitle>
                {/* <IconButton
                    aria-label="close"
                    onClick={() => loading ? undefined : onClose()}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                        textDecoration: "underline", // Agrega un subrayado para hacerlo parecer un enlace
                        cursor: "pointer", // Cambia el cursor al estilo "mano" para indicar que es interactivo
                    }}
                    color="primary"
                >
                    <CloseIcon />
                </IconButton> */}
                <DialogContent dividers>
                    { page.page === 'form' &&
                        <NewAdjustmentForm
                        file={file}
                        handleFileChange={handleFileChange}
                        reason={reason}
                        setreason={setreason}
                    />}
                    {
                        page.page === 'voucher' && page.data &&
                        <VoucherNewAdjunstment
                            data={page.data}
                            />
                    }
                </DialogContent>
                <DialogActions sx={{ pr: 2.5 }}>
                    <Button autoFocus onClick={handleConfirm}
                        color="primary" variant="outlined"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <SaveAltTwoTone />}
                    >
                        {loading ? "Procesando" : page.page === 'form' ? "Confirmar" : "Cerrar"}
                    </Button>
                </DialogActions>
            </BootstrapDialog>


        </>
    )
}
