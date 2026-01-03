import React from 'react';
import { useProfileCheck } from '../hooks/useProfileCheck';
import { ProfileCompletionModal } from './ProfileCompletionModal';
import { CircularProgress, Box } from '@mui/material';

interface Props {
  children: React.ReactNode;
}

/**
 * Componente que verifica si el usuario autenticado tiene un perfil de personal.
 * Si no lo tiene, muestra un modal para completar el perfil.
 * Este componente envuelve la aplicación para hacer la verificación global.
 */
export const ProfileCompletionChecker: React.FC<Props> = ({ children }) => {
  const { loading, needsProfile, recheckProfile } = useProfileCheck();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {children}
      {needsProfile && <ProfileCompletionModal onComplete={recheckProfile} />}
    </>
  );
};
