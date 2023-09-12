
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Typography, styled } from "@mui/material";
import { FunctionComponent } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { GetAUserResponse, User } from "../../../interfaces/user";


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

interface DeleteCheckProps {
    user?: Partial<User & GetAUserResponse>;
    open: boolean;
    handleClose?: ((event: object, reason: "backdropClick" | "escapeKeyDown") => void) | undefined;
}

export const ChangePasswordModal: FunctionComponent<DeleteCheckProps> = ({ open, handleClose, user }) => {
    const handleClickContinuar = () => {
        //
    }
    return <BootstrapDialog open={open} onClose={handleClose} fullWidth={true} maxWidth="sm">
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
            Restablecer Contraseña
        </DialogTitle>
        <IconButton
            aria-label="close"
            onClick={() => handleClose && handleClose({}, "backdropClick")}
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
        <DialogContent dividers >
            <Box >
                <Container maxWidth="xl">
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography>
                                ¿Está seguro que desea restablecer la contraseña del usuario {`${user?.first_name} ${user?.last_name}`}?
                            </Typography>
                            <Typography>
                                Se le asignará como contraseña <Typography component="span" sx={{fontWeight:500}}>ABCDEFGHIJKLMNOPQRSTUVWXYZ</Typography>
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button variant="outlined" color="inherit" size="medium" onClick={() => handleClose && handleClose({}, "backdropClick")}>
                <Typography variant="body2" component="span" fontWeight={400}>
                    CANCELAR
                </Typography>
            </Button>
            <Button variant="contained" color="primary" size="medium" onClick={handleClickContinuar}>
                <Typography variant="body2" component="span" fontWeight={400} color={'gray.700'}>
                    CONTINUAR
                </Typography>
            </Button>
        </DialogActions>
    </BootstrapDialog>
}