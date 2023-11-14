
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Typography, styled } from "@mui/material";
import { FunctionComponent } from "react";
import CloseIcon from '@mui/icons-material/Close';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

interface DeleteCheckProps {
    title?: string;
    message?: string;
    open: boolean;
    handleClose?: ((event: object, reason: "backdropClick" | "escapeKeyDown") => void) | undefined;
    onDelete?: ()=>void 
}

export const DeleteOrderModal: FunctionComponent<DeleteCheckProps> = ({ title, message, open, handleClose, onDelete }) => {    
    return <BootstrapDialog open={open} onClose={handleClose} fullWidth={true} maxWidth="sm">
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
            {title}
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
                                {message}
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button variant="contained" color="error" size="medium" onClick={onDelete}>
                <Typography variant="body2" component="span" fontWeight={400} color={'gray.700'}>
                    Eliminar
                </Typography>
            </Button>
        </DialogActions>
    </BootstrapDialog>
}