import { useState } from 'react';
import {
  Box, Grid, TextField, Typography, IconButton, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, FormControl,
  InputLabel, Select, MenuItem, FormControlLabel, Switch
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  UniformDeliveryCreatePayload,
  UniformItemCreatePayload,
  UniformItemType,
  UniformItemTypeLabels,
  UniformSize,
  UniformSizeLabels
} from '../../interfaces/token';

interface UniformDeliveryFormProps {
  value: UniformDeliveryCreatePayload;
  onChange: (value: UniformDeliveryCreatePayload) => void;
}

const emptyItem: UniformItemCreatePayload = {
  item_type: UniformItemType.SHIRT,
  size: UniformSize.M,
  quantity: 1,
  requires_return: false,
};

export const UniformDeliveryForm = ({ value, onChange }: UniformDeliveryFormProps) => {
  const [newItem, setNewItem] = useState<UniformItemCreatePayload>({ ...emptyItem });

  const handleChange = (field: keyof UniformDeliveryCreatePayload, fieldValue: unknown) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const handleAddItem = () => {
    if (newItem.item_type && newItem.quantity > 0) {
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

  // Tallas de ropa
  const clothingSizes = [
    UniformSize.XS, UniformSize.S, UniformSize.M, UniformSize.L,
    UniformSize.XL, UniformSize.XXL, UniformSize.XXXL
  ];

  // Tallas de calzado
  const shoeSizes = [
    UniformSize.SIZE_35, UniformSize.SIZE_36, UniformSize.SIZE_37,
    UniformSize.SIZE_38, UniformSize.SIZE_39, UniformSize.SIZE_40,
    UniformSize.SIZE_41, UniformSize.SIZE_42, UniformSize.SIZE_43,
    UniformSize.SIZE_44, UniformSize.SIZE_45
  ];

  const isFootwear = (type: UniformItemType) =>
    type === UniformItemType.SHOES || type === UniformItemType.BOOTS;

  const getSizeOptions = (itemType: UniformItemType) => {
    if (isFootwear(itemType)) return shoeSizes;
    if (itemType === UniformItemType.BADGE || itemType === UniformItemType.OTHER) {
      return [UniformSize.NA];
    }
    return clothingSizes;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Detalles de Entrega de Uniforme
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Centro de Distribución"
              value={value.delivery_location || ''}
              onChange={(e) => handleChange('delivery_location', e.target.value)}
              placeholder="Ej: CD Tegucigalpa, CD San Pedro Sula..."
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Notas de Entrega"
              multiline
              rows={2}
              value={value.delivery_notes || ''}
              onChange={(e) => handleChange('delivery_notes', e.target.value)}
            />
          </Grid>

          {/* Items Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Prendas a Entregar
            </Typography>

            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={newItem.item_type}
                      label="Tipo"
                      onChange={(e) => {
                        const type = e.target.value as UniformItemType;
                        const sizeOptions = getSizeOptions(type);
                        setNewItem({
                          ...newItem,
                          item_type: type,
                          size: sizeOptions[0]
                        });
                      }}
                    >
                      {Object.entries(UniformItemTypeLabels).map(([key, label]) => (
                        <MenuItem key={key} value={key}>{label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Talla</InputLabel>
                    <Select
                      value={newItem.size}
                      label="Talla"
                      onChange={(e) => setNewItem({ ...newItem, size: e.target.value as UniformSize })}
                    >
                      {getSizeOptions(newItem.item_type).map((size) => (
                        <MenuItem key={size} value={size}>{UniformSizeLabels[size]}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} md={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Cant."
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
                    label="Color"
                    value={newItem.color || ''}
                    onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
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
                      <TableCell>Tipo</TableCell>
                      <TableCell>Talla</TableCell>
                      <TableCell>Color</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell>Retornable</TableCell>
                      <TableCell>Fecha Retorno</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(value.items || []).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{UniformItemTypeLabels[item.item_type]}</TableCell>
                        <TableCell>{UniformSizeLabels[item.size]}</TableCell>
                        <TableCell>{item.color || '-'}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell>{item.requires_return ? 'Sí' : 'No'}</TableCell>
                        <TableCell>{item.return_date || '-'}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleRemoveItem(index)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};
