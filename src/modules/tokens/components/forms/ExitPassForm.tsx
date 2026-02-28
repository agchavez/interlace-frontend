import { useState, useMemo } from 'react';
import {
  Box, Grid, TextField, Typography, IconButton, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, FormControlLabel,
  Switch, InputAdornment, Autocomplete, ToggleButton, ToggleButtonGroup, Chip,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ScaleIcon from '@mui/icons-material/Scale';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import EditIcon from '@mui/icons-material/Edit';
import {
  ExitPassCreatePayload,
  ExitPassItemCreatePayload,
  Material,
} from '../../interfaces/token';
import { useGetMaterialsQuery } from '../../services/tokenApi';
import { useGetProductQuery } from '../../../../store/maintenance/maintenanceApi';
import type { Product } from '../../../../interfaces/tracking';

interface ExitPassFormProps {
  value: ExitPassCreatePayload;
  onChange: (value: ExitPassCreatePayload) => void;
}

type ItemType = 'material' | 'product' | 'custom';

const emptyItem: ExitPassItemCreatePayload = {
  custom_description: '',
  quantity: 1,
  unit_value: 0,
  weight_kg: undefined,
  requires_return: false,
};

export const ExitPassForm = ({ value, onChange }: ExitPassFormProps) => {
  const [newItem, setNewItem] = useState<ExitPassItemCreatePayload>({ ...emptyItem });
  const [itemType, setItemType] = useState<ItemType>('material');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch materials and products
  const { data: materialsData } = useGetMaterialsQuery({ limit: 100 });
  const { data: productsData } = useGetProductQuery({ limit: 100, offset: 0 });

  const materials = useMemo(() => materialsData?.results || [], [materialsData]);
  const products = useMemo(() => productsData?.results || [], [productsData]);

  const handleChange = (field: keyof ExitPassCreatePayload, fieldValue: unknown) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const handleItemTypeChange = (_: React.MouseEvent<HTMLElement>, newType: ItemType | null) => {
    if (newType) {
      setItemType(newType);
      setSelectedMaterial(null);
      setSelectedProduct(null);
      setNewItem({ ...emptyItem });
    }
  };

  const handleMaterialSelect = (material: Material | null) => {
    setSelectedMaterial(material);
    if (material) {
      setNewItem({
        ...newItem,
        material: material.id,
        custom_description: material.name,
        unit_value: parseFloat(material.unit_value as any || 0),
        requires_return: material.requires_return,
      });
    } else {
      setNewItem({ ...emptyItem });
    }
  };

  const handleProductSelect = (product: Product | null) => {
    setSelectedProduct(product);
    if (product) {
      setNewItem({
        ...newItem,
        product: product.id,
        custom_description: product.name,
        unit_value: 0, // Products don't have unit_value
      });
    } else {
      setNewItem({ ...emptyItem });
    }
  };

  const handleAddItem = () => {
    if (newItem.custom_description && newItem.quantity > 0) {
      const items = [...(value.items || []), { ...newItem }];
      handleChange('items', items);
      setNewItem({ ...emptyItem });
      setSelectedMaterial(null);
      setSelectedProduct(null);
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

  const getItemTypeLabel = (item: ExitPassItemCreatePayload) => {
    if (item.material) return 'Material';
    if (item.product) return 'Producto';
    return 'Personalizado';
  };

  const getItemTypeColor = (item: ExitPassItemCreatePayload): 'primary' | 'secondary' | 'default' => {
    if (item.material) return 'primary';
    if (item.product) return 'secondary';
    return 'default';
  };

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
              label="Fecha Esperada de Retorno (Opcional)"
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
              {/* Item Type Toggle */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', mb: 1 }}>
                  Tipo de Item:
                </Typography>
                <ToggleButtonGroup
                  value={itemType}
                  exclusive
                  onChange={handleItemTypeChange}
                  size="small"
                >
                  <ToggleButton value="material">
                    <InventoryIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Material
                  </ToggleButton>
                  <ToggleButton value="product">
                    <CategoryIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Producto
                  </ToggleButton>
                  <ToggleButton value="custom">
                    <EditIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Otro
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Grid container spacing={2} alignItems="flex-start">
                {/* Material Selector */}
                {itemType === 'material' && (
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      options={materials}
                      getOptionLabel={(opt) => `${opt.code} - ${opt.name}`}
                      value={selectedMaterial}
                      onChange={(_, val) => handleMaterialSelect(val)}
                      renderOption={(props, opt) => (
                        <Box component="li" {...props}>
                          <Box>
                            <Typography variant="body2">{opt.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {opt.code} | L {parseFloat(opt.unit_value as any || 0).toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Seleccionar Material"
                          placeholder="Buscar..."
                        />
                      )}
                    />
                  </Grid>
                )}

                {/* Product Selector */}
                {itemType === 'product' && (
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      options={products}
                      getOptionLabel={(opt) => `${opt.sap_code} - ${opt.name}`}
                      value={selectedProduct}
                      onChange={(_, val) => handleProductSelect(val)}
                      renderOption={(props, opt) => (
                        <Box component="li" {...props}>
                          <Box>
                            <Typography variant="body2">{opt.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {opt.sap_code} | {opt.brand}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Seleccionar Producto"
                          placeholder="Buscar..."
                        />
                      )}
                    />
                  </Grid>
                )}

                {/* Custom Description */}
                {itemType === 'custom' && (
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Descripción"
                      value={newItem.custom_description}
                      onChange={(e) => setNewItem({ ...newItem, custom_description: e.target.value })}
                      placeholder="Describir item..."
                    />
                  </Grid>
                )}

                <Grid item xs={6} md={1.5}>
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

                <Grid item xs={6} md={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Peso (kg)"
                    type="number"
                    inputProps={{ step: 0.01, min: 0 }}
                    value={newItem.weight_kg || ''}
                    onChange={(e) => setNewItem({ ...newItem, weight_kg: parseFloat(e.target.value) || undefined })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><ScaleIcon fontSize="small" /></InputAdornment>
                    }}
                  />
                </Grid>

                <Grid item xs={6} md={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Valor Unit. (L)"
                    type="number"
                    inputProps={{ step: 0.01, min: 0 }}
                    value={newItem.unit_value}
                    onChange={(e) => setNewItem({ ...newItem, unit_value: parseFloat(e.target.value) || 0 })}
                  />
                </Grid>

                <Grid item xs={6} md={1.5}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newItem.requires_return}
                        onChange={(e) => setNewItem({ ...newItem, requires_return: e.target.checked })}
                        size="small"
                      />
                    }
                    label={<Typography variant="caption">Retornable</Typography>}
                  />
                </Grid>

                <Grid item xs={12} md={2}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAddItem}
                    startIcon={<AddIcon />}
                    disabled={!newItem.custom_description}
                    fullWidth
                  >
                    Agregar
                  </Button>
                </Grid>
              </Grid>

              {newItem.requires_return && (
                <Box sx={{ mt: 2 }}>
                  <DatePicker
                    label="Fecha de Retorno"
                    value={newItem.return_date ? dayjs(newItem.return_date) : null}
                    onChange={(date) => setNewItem({ ...newItem, return_date: date?.format('YYYY-MM-DD') })}
                    slotProps={{ textField: { size: 'small', sx: { maxWidth: 250 } } }}
                  />
                </Box>
              )}
            </Box>

            {(value.items || []).length > 0 && (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Peso (kg)</TableCell>
                      <TableCell align="right">Valor Unit.</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Retornable</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(value.items || []).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip
                            label={getItemTypeLabel(item)}
                            size="small"
                            color={getItemTypeColor(item)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{item.custom_description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{item.weight_kg ? `${item.weight_kg} kg` : '-'}</TableCell>
                        <TableCell align="right">L {parseFloat(item.unit_value as any || 0).toFixed(2)}</TableCell>
                        <TableCell align="right">L {(item.quantity * parseFloat(item.unit_value as any || 0)).toFixed(2)}</TableCell>
                        <TableCell align="center">
                          {item.requires_return ? (
                            <Chip label={item.return_date || 'Sí'} size="small" color="warning" />
                          ) : 'No'}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleRemoveItem(index)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell colSpan={5} align="right"><strong>Total</strong></TableCell>
                      <TableCell align="right"><strong>L {totalValue.toFixed(2)}</strong></TableCell>
                      <TableCell colSpan={2}></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {totalValue > 20000 && (
              <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                Nota: El valor total excede L 20,000, se requerirá aprobación de nivel 3.
              </Typography>
            )}
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};
