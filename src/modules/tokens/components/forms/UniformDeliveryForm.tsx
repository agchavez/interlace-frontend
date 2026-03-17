import { useState } from 'react';
import {
  Box, Grid, TextField, Typography, IconButton, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, FormControl,
  InputLabel, Select, MenuItem, FormControlLabel, Switch, Autocomplete,
  CircularProgress,
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
  UniformSizeLabels,
  Material,
} from '../../interfaces/token';
import { useGetMaterialsQuery } from '../../services/tokenApi';

interface UniformDeliveryFormProps {
  value: UniformDeliveryCreatePayload;
  onChange: (value: UniformDeliveryCreatePayload) => void;
}

const emptyItem: UniformItemCreatePayload = {
  size: UniformSize.M,
  quantity: 1,
  requires_return: false,
};

export const UniformDeliveryForm = ({ value, onChange }: UniformDeliveryFormProps) => {
  const [newItem, setNewItem] = useState<UniformItemCreatePayload>({ ...emptyItem });
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Cargar materiales de la categoría UNIFORME
  const { data: materialsData, isLoading: materialsLoading, isError: materialsError } = useGetMaterialsQuery({
    category: 'UNIFORME',
    limit: 100,
  });
  const materials = materialsData?.results || [];
  // Usar dinámico siempre que la API responda exitosamente (aunque esté vacío), fallback solo si hay error
  const useDynamic = !materialsError;

  const handleChange = (field: keyof UniformDeliveryCreatePayload, fieldValue: unknown) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const handleMaterialSelect = (material: Material | null) => {
    setSelectedMaterial(material);
    if (material) {
      setNewItem({
        ...newItem,
        material: material.id,
        custom_description: material.name,
        requires_return: material.requires_return,
      });
    } else {
      setNewItem({ ...emptyItem });
    }
  };

  const handleAddItem = () => {
    const hasSelection = useDynamic ? !!newItem.material : !!newItem.item_type;
    if (hasSelection && newItem.quantity > 0) {
      const items = [...(value.items || []), { ...newItem }];
      handleChange('items', items);
      setNewItem({ ...emptyItem });
      setSelectedMaterial(null);
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

  const isFootwear = (type?: UniformItemType) =>
    type === UniformItemType.SHOES || type === UniformItemType.BOOTS;

  const getSizeOptions = (itemType?: UniformItemType) => {
    if (!itemType) return clothingSizes;
    if (isFootwear(itemType)) return shoeSizes;
    if (itemType === UniformItemType.BADGE || itemType === UniformItemType.OTHER) {
      return [UniformSize.NA];
    }
    return clothingSizes;
  };

  const getItemDisplayName = (item: UniformItemCreatePayload) => {
    if (item.custom_description) return item.custom_description;
    if (item.item_type) return UniformItemTypeLabels[item.item_type] || item.item_type;
    return '-';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Detalles de Entrega de Uniforme
        </Typography>

        <Grid container spacing={2}>
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
                <Grid item xs={12} md={3}>
                  {useDynamic ? (
                    <Autocomplete
                      size="small"
                      options={materials}
                      getOptionLabel={(option) => `${option.code} - ${option.name}`}
                      value={selectedMaterial}
                      onChange={(_, material) => handleMaterialSelect(material)}
                      loading={materialsLoading}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Material"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {materialsLoading ? <CircularProgress size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  ) : (
                    <FormControl fullWidth size="small">
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        value={newItem.item_type || ''}
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
                  )}
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
                <Grid item xs={6} md={1}>
                  {newItem.requires_return && (
                    <DatePicker
                      label="Retorno"
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
                      <TableCell>Prenda / Material</TableCell>
                      <TableCell>Talla</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell>Retornable</TableCell>
                      <TableCell>Fecha Retorno</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(value.items || []).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{getItemDisplayName(item)}</TableCell>
                        <TableCell>{UniformSizeLabels[item.size]}</TableCell>
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
