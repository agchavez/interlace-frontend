import { useState } from 'react';
import {
  Box, Grid, TextField, Typography, IconButton, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, FormControlLabel,
  Switch
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  ExitPassCreatePayload,
  ExitPassItemCreatePayload
} from '../../interfaces/token';

interface ExitPassFormProps {
  value: ExitPassCreatePayload;
  onChange: (value: ExitPassCreatePayload) => void;
}

const emptyItem: ExitPassItemCreatePayload = {
  custom_description: '',
  quantity: 1,
  unit_value: 0,
  requires_return: false,
};

export const ExitPassForm = ({ value, onChange }: ExitPassFormProps) => {
  const [newItem, setNewItem] = useState<ExitPassItemCreatePayload>({ ...emptyItem });

  const handleChange = (field: keyof ExitPassCreatePayload, fieldValue: unknown) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const handleAddItem = () => {
    if (newItem.custom_description && newItem.quantity > 0) {
      const items = [...(value.items || []), { ...newItem }];
      handleChange('items', items);
      setNewItem({ ...emptyItem });
    }
  };

  const handleRemoveItem = (index: number) => {
    const items = [...(value.items || [])];
    items.splice(index, 1);
    handleChange('items', items);
  };

  const totalValue = (value.items || []).reduce(
    (sum, item) => sum + (item.quantity * item.unit_value),
    0
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Detalles del Pase de Salida
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Destino"
              required
              value={value.destination || ''}
              onChange={(e) => handleChange('destination', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Fecha Esperada de Retorno"
              value={value.expected_return_date ? dayjs(value.expected_return_date) : null}
              onChange={(date) => handleChange('expected_return_date', date?.format('YYYY-MM-DD'))}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Placa del Vehículo"
              value={value.vehicle_plate || ''}
              onChange={(e) => handleChange('vehicle_plate', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Nombre del Conductor"
              value={value.driver_name || ''}
              onChange={(e) => handleChange('driver_name', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Propósito/Motivo"
              multiline
              rows={2}
              required
              value={value.purpose || ''}
              onChange={(e) => handleChange('purpose', e.target.value)}
            />
          </Grid>

          {/* Items Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Items a Retirar
            </Typography>

            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Descripción"
                    value={newItem.custom_description}
                    onChange={(e) => setNewItem({ ...newItem, custom_description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Cantidad"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Valor Unitario"
                    type="number"
                    inputProps={{ step: 0.01, min: 0 }}
                    value={newItem.unit_value}
                    onChange={(e) => setNewItem({ ...newItem, unit_value: parseFloat(e.target.value) || 0 })}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newItem.requires_return}
                        onChange={(e) => setNewItem({ ...newItem, requires_return: e.target.checked })}
                        size="small"
                      />
                    }
                    label="Retornable"
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  {newItem.requires_return && (
                    <DatePicker
                      label="Fecha Retorno"
                      value={newItem.return_date ? dayjs(newItem.return_date) : null}
                      onChange={(date) => setNewItem({ ...newItem, return_date: date?.format('YYYY-MM-DD') })}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={1}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAddItem}
                    startIcon={<AddIcon />}
                    disabled={!newItem.custom_description}
                  >
                    Agregar
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {(value.items || []).length > 0 && (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Descripción</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Valor Unit.</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell>Retornable</TableCell>
                      <TableCell>Fecha Retorno</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(value.items || []).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.custom_description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">${item.unit_value.toFixed(2)}</TableCell>
                        <TableCell align="right">${(item.quantity * item.unit_value).toFixed(2)}</TableCell>
                        <TableCell>{item.requires_return ? 'Sí' : 'No'}</TableCell>
                        <TableCell>{item.return_date || '-'}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleRemoveItem(index)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right"><strong>Total</strong></TableCell>
                      <TableCell align="right"><strong>${totalValue.toFixed(2)}</strong></TableCell>
                      <TableCell colSpan={3}></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {totalValue > 20000 && (
              <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                Nota: El valor total excede $20,000, se requerirá aprobación de nivel 3.
              </Typography>
            )}
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};
