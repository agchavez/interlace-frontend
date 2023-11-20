
import { Box, Button, Container, Dialog, DialogActions, DialogContent, Grid, Typography, styled } from "@mui/material";
import { FunctionComponent } from "react";
import BootstrapDialogTitle from "../../ui/components/BoostrapDialog";

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
        <BootstrapDialogTitle id="customized-dialog-title" onClose={()=> handleClose && handleClose( {}, 'escapeKeyDown')}>
            <Typography variant="h6" component="span" fontWeight={400} color={'gray.700'}>
                {title}
            </Typography>
        </BootstrapDialogTitle>
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