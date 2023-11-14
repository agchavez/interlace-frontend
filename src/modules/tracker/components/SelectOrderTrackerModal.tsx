import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Table, TableBody, TableContainer, TableHead, TextField, Typography, styled } from "@mui/material";
import { FC, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import TableRow from '@mui/material/TableRow';
import { StyledTableCell } from './CheckForm';
import { useForm } from "react-hook-form";
import { OrderSelect } from "../../ui/components/OrderSelect";


interface SelectOrderTrackerModalProps {
    open: boolean;
    handleClose: () => void;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialogContent-root": {
        padding: theme.spacing(2),
    },
    "& .MuiDialogActions-root": {
        padding: theme.spacing(1),
    },
}));

export const SelectOrderTrackerModal: FC<SelectOrderTrackerModalProps> = ({ open, handleClose }) => {
    const {control} = useForm();

    return (
        <>
            <BootstrapDialog open={open} onClose={handleClose} fullWidth={true} maxWidth="lg">
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    <Typography variant="h6" component="div" fontWeight={400}>
                        Configuración de pedido
                    </Typography>
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={() => handleClose()}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                        textDecoration: 'underline', // Agrega un subrayado para hacerlo parecer un enlace
                        cursor: 'pointer', // Cambia el cursor al estilo "mano" para indicar que es interactivo
                    }}
                    color="primary"
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent dividers>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <OrderSelect
                                control={control}
                                name="order"
                                label="Pedido"
                                />
                        </Grid>
                        <Grid item xs={3} md={2}>
                            </Grid>
                        <Grid item xs={3} md={2}>
                            <Typography variant="body1" component="h2">
                                Localidad:
                                <Typography variant="body2" component="h2">
                                    COLONIAL 12313  
                                </Typography>
                            </Typography>
                            </Grid>
                            <Grid item xs={3} md={2}>
                            <Typography variant="body1" component="h2">
                                Ruta: 
                                <Typography variant="body2" component="h2">
                                    RN123  
                                </Typography>
                            </Typography>
                            </Grid>
                        <Grid item xs={12} sx={{ marginTop: 2 }}>
                                <Typography variant="h6" component="h2">
                                    Detalle del pedido
                                </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                        <StyledTableCell size="small" align="center">
                                                
                                                </StyledTableCell>
                                            <StyledTableCell size="small" align="center">
                                                #Tracking
                                                </StyledTableCell>
                                            <StyledTableCell size="small" align="center">N° SAP</StyledTableCell>
                                            <StyledTableCell size="small" align="left">Producto</StyledTableCell>
                                            <StyledTableCell size="small" align="center">Cantidad disponible</StyledTableCell>
                                            <StyledTableCell size="small" align="center">Cantidad</StyledTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRowComponent />

                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => handleClose()} color="primary">
                        Confirmar
                    </Button>
                </DialogActions>
            </BootstrapDialog>

        </>
    )
}

const TableRowComponent = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [isTextEnabled, setIsTextEnabled] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    setIsTextEnabled(!isTextEnabled);
  };

  return (
    <TableRow style={{ backgroundColor: !isTextEnabled ? '#e0e0e0' : 'inherit' }} // Cambia el color de fondo si el texto está deshabilitado
    >
      <StyledTableCell size="small" align="left">
        <Checkbox checked={isChecked} onChange={handleCheckboxChange} color="secondary" />
      </StyledTableCell>
      <StyledTableCell size="small" align="center">
        TRK-001233
      </StyledTableCell>
      <StyledTableCell size="small" align="center">
        67687
      </StyledTableCell>
      <StyledTableCell size="small" align="left">MONSTER ENERGY KHAOS (NARANJA) LATA 24 U</StyledTableCell>
      <StyledTableCell size="small" align="left">45</StyledTableCell>
      <StyledTableCell size="small" align="center">
        <TextField
          id="standard-basic"
          label="Cantidad"
          variant="standard"
          color="secondary"
          size="small"
          disabled={!isTextEnabled}
        />
      </StyledTableCell>
    </TableRow>
  );
};

export default TableRowComponent;
