import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useGenerateUsernameMutation, useCheckUsernameMutation } from '../../../store/user/userApi';
import { useDebounce } from '../../../hooks/useDebounce';

interface UsernameSelectorProps {
  value: string;
  onChange: (username: string) => void;
  firstName: string;
  lastName: string;
  error?: string;
  disabled?: boolean;
}

export const UsernameSelector: React.FC<UsernameSelectorProps> = ({
  value,
  onChange,
  firstName,
  lastName,
  error,
  disabled = false,
}) => {
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>('');
  const [manualUsername, setManualUsername] = useState(value);

  const [generateUsername, { data: suggestions, isLoading: isGenerating }] = useGenerateUsernameMutation();
  const [checkUsername, { isLoading: isChecking }] = useCheckUsernameMutation();

  const [availabilityStatus, setAvailabilityStatus] = useState<{
    available: boolean;
    message: string;
  } | null>(null);

  const debouncedManualUsername = useDebounce(manualUsername, 500);

  // Generar sugerencias cuando cambian nombre o apellido (modo automático)
  useEffect(() => {
    if (autoGenerate && firstName && lastName) {
      generateUsername({ first_name: firstName, last_name: lastName });
    }
  }, [firstName, lastName, autoGenerate, generateUsername]);

  // Seleccionar automáticamente la primera sugerencia
  useEffect(() => {
    if (autoGenerate && suggestions?.suggestions && suggestions.suggestions.length > 0) {
      const firstSuggestion = suggestions.suggestions[0].username;
      setSelectedSuggestion(firstSuggestion);
      onChange(firstSuggestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestions, autoGenerate]);

  // Verificar disponibilidad en modo manual
  useEffect(() => {
    if (!autoGenerate && debouncedManualUsername && debouncedManualUsername.length >= 3) {
      checkUsername({ username: debouncedManualUsername })
        .unwrap()
        .then((result) => {
          setAvailabilityStatus({
            available: result.available,
            message: result.message,
          });
          if (result.available) {
            onChange(debouncedManualUsername);
          }
        })
        .catch((err) => {
          if (err.data?.error) {
            setAvailabilityStatus({
              available: false,
              message: err.data.error,
            });
          }
        });
    } else if (!autoGenerate && debouncedManualUsername.length < 3) {
      setAvailabilityStatus({
        available: false,
        message: 'El username debe tener al menos 3 caracteres',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedManualUsername, autoGenerate, checkUsername]);

  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isAuto = event.target.checked;
    setAutoGenerate(isAuto);
    setAvailabilityStatus(null);

    if (isAuto && suggestions?.suggestions && suggestions.suggestions.length > 0) {
      const firstSuggestion = suggestions.suggestions[0].username;
      setSelectedSuggestion(firstSuggestion);
      onChange(firstSuggestion);
    } else if (!isAuto) {
      setManualUsername(value || '');
    }
  };

  const handleSuggestionClick = (username: string) => {
    setSelectedSuggestion(username);
    onChange(username);
  };

  const handleManualChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setManualUsername(newValue);
    setAvailabilityStatus(null);
  };

  return (
    <Box>
      <FormControlLabel
        control={
          <Switch
            checked={autoGenerate}
            onChange={handleModeChange}
            color="primary"
            disabled={disabled}
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon fontSize="small" />
            <Typography variant="body2">Generar automáticamente</Typography>
          </Box>
        }
      />

      {autoGenerate ? (
        <Box sx={{ mt: 2 }}>
          {isGenerating ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Generando sugerencias...
              </Typography>
            </Box>
          ) : !firstName || !lastName ? (
            <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
              Ingresa el nombre y apellido para generar sugerencias de username
            </Alert>
          ) : suggestions?.suggestions && suggestions.suggestions.length > 0 ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Selecciona un username:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {suggestions.suggestions.map((suggestion) => (
                  <Chip
                    key={suggestion.username}
                    label={suggestion.username}
                    onClick={() => handleSuggestionClick(suggestion.username)}
                    color={selectedSuggestion === suggestion.username ? 'primary' : 'default'}
                    variant={selectedSuggestion === suggestion.username ? 'filled' : 'outlined'}
                    icon={<CheckCircleIcon />}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
              {selectedSuggestion && (
                <Paper elevation={0} sx={{ p: 1.5, mt: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon fontSize="small" />
                    Username seleccionado: <strong>{selectedSuggestion}</strong>
                  </Typography>
                </Paper>
              )}
            </>
          ) : (
            <Alert severity="warning" sx={{ fontSize: '0.875rem' }}>
              No se pudieron generar sugerencias. Cambia a modo manual.
            </Alert>
          )}
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Nombre de Usuario *"
            value={manualUsername}
            onChange={handleManualChange}
            error={!!error || (availabilityStatus && !availabilityStatus.available)}
            helperText={
              error ||
              (isChecking
                ? 'Verificando disponibilidad...'
                : availabilityStatus?.message)
            }
            disabled={disabled}
            InputProps={{
              endAdornment: !isChecking && availabilityStatus && (
                availabilityStatus.available ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <CancelIcon color="error" />
                )
              ),
            }}
          />
        </Box>
      )}
    </Box>
  );
};
