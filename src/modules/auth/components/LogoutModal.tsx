import { useState, useEffect, useRef } from 'react'

import { Button, CircularProgress, Dialog, DialogActions, DialogContent, Typography } from "@mui/material"
import LogoutIcon from '@mui/icons-material/Logout';
import { useAppDispatch, useAppSelector } from "../../../store";
import { closeLogoutModal, logout, startUpdateToken } from "../../../store/auth";
import BootstrapDialogTitle from "../../ui/components/BootstrapDialogTitle";

export const LogoutModal = () => {

    const dispatch = useAppDispatch();
    const { openLogoutModal, logoutType, loading } = useAppSelector(state => state.auth);

    const handleClose = () => {
        if (logoutType === 'timeout') return;
        dispatch(closeLogoutModal());
    };

    const handleLogout = () => {
        dispatch(logout());
    }

    const handleContinue = () => {
        clearTimeout(timerRef.current);
        dispatch(startUpdateToken(() => {
            setSeconds(30);
        }));
    }

    const [seconds, setSeconds] = useState(30);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const timerRef = useRef<any>(null);

    useEffect(() => {
        if (logoutType !== 'timeout') return;
        timerRef.current = setTimeout(() => {
            setSeconds(seconds - 1);
        }, 1000);

        if (!openLogoutModal) {
            clearTimeout(timerRef.current);
            setSeconds(30);
            
        }

        return () => clearTimeout(timerRef.current);
    }, [seconds, openLogoutModal, logoutType]);

    useEffect(() => {
        if (seconds === 0) {
            clearTimeout(timerRef.current);
            setSeconds(30);
            dispatch(logout());
        }
    }, [seconds, dispatch]);




    return (
        <>
            {openLogoutModal &&
                <Dialog
                    open={openLogoutModal}
                    onClose={handleClose}
                    aria-labelledby="customized-dialog-title"
                    maxWidth='xs'
                    fullWidth
                >
                    <BootstrapDialogTitle id="customized-dialog-title" onClose={logoutType === 'timeout' ? undefined : handleClose}>
                        <Typography variant="h6" fontWeight={600} color={'#fff'}>
                            Sesión expirada
                        </Typography>
                    </BootstrapDialogTitle>
                    <DialogContent dividers>
                        <Typography
                            variant="body2"
                        >
                            {logoutType === 'logout' ? '¿Desea cerrar la sesion?' : ''}
                        </Typography>
                        {logoutType === 'timeout' && <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Se cerrara la sesion en
                            <Typography
                                variant="h6"
                                color="primary"
                                component="span"
                                fontWeight={300}
                                sx={{ ml: 1, mr: 1 }}
                            >
                                {seconds}
                            </Typography>
                            segundos
                        </Typography>}

                    </DialogContent>
                    <DialogActions>
                        {
                            loading ?
                                <CircularProgress size={25} />
                                : <>
                                    <Button
                                        onClick={logoutType === 'logout' ? handleClose : handleContinue}
                                        variant="outlined"
                                        size='small'
                                    >
                                        {logoutType === 'logout' ? 'Cancelar' : 'Continuar conectado'}
                                    </Button>

                                    <Button
                                        onClick={handleLogout}
                                        variant="contained"
                                        endIcon={<LogoutIcon />}
                                        size='small'
                                    >
                                        Cerrar sesion
                                    </Button>
                                </>
                        }

                    </DialogActions>

                </Dialog>}
        </>
    )
}