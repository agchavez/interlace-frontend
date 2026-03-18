/**
 * Selector de múltiples personas para creación masiva de tokens.
 * Tab 1: Búsqueda manual con Autocomplete
 * Tab 2: Carga desde Excel (columna Codigo_Empleado)
 */
import { useState, useRef } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Autocomplete,
  TextField,
  Chip,
  Typography,
  Button,
  Alert,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  UploadFile as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useResolveEmployeeCodesMutation } from '../services/tokenApi';
import type { ResolvedPersonnel } from '../interfaces/token';
import type { PersonnelProfileList } from '../../../interfaces/personnel';
import { toast } from 'sonner';

interface BulkPersonnelSelectorProps {
  selectedPersonnel: ResolvedPersonnel[];
  onPersonnelChange: (personnel: ResolvedPersonnel[]) => void;
  personnelList: PersonnelProfileList[];
}

export const BulkPersonnelSelector = ({
  selectedPersonnel,
  onPersonnelChange,
  personnelList,
}: BulkPersonnelSelectorProps) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [notFoundCodes, setNotFoundCodes] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resolveEmployeeCodes, { isLoading: resolving }] = useResolveEmployeeCodesMutation();

  const handleAddPerson = (_: unknown, newValue: PersonnelProfileList | null) => {
    if (!newValue) return;
    // Prevent duplicates
    if (selectedPersonnel.some((p) => p.id === newValue.id)) {
      toast('Esta persona ya está en la lista');
      return;
    }
    onPersonnelChange([
      ...selectedPersonnel,
      {
        id: newValue.id,
        employee_code: newValue.employee_code,
        full_name: newValue.full_name,
        position: newValue.position || '',
        area_name: '',
        hierarchy_level: '',
      },
    ]);
  };

  const handleRemovePerson = (id: number) => {
    onPersonnelChange(selectedPersonnel.filter((p) => p.id !== id));
  };

  const handleClearAll = () => {
    onPersonnelChange([]);
    setNotFoundCodes([]);
  };

  const handleDownloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet([['Codigo_Empleado'], ['22144'], ['SUP001']]);
    ws['!cols'] = [{ wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Personal');
    XLSX.writeFile(wb, 'plantilla_horas_extra.xlsx');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

      // Extract employee codes from first column (whatever the header is)
      const codes: string[] = [];
      for (const row of rows) {
        const firstValue = Object.values(row)[0];
        if (firstValue !== undefined && firstValue !== null) {
          codes.push(String(firstValue).trim());
        }
      }

      if (codes.length === 0) {
        toast.error('No se encontraron códigos en el archivo');
        return;
      }

      // Resolve codes via API
      const result = await resolveEmployeeCodes({ employee_codes: codes }).unwrap();

      // Merge resolved with existing, deduplicate
      const existingIds = new Set(selectedPersonnel.map((p) => p.id));
      const newPersonnel = result.resolved.filter((p) => !existingIds.has(p.id));
      onPersonnelChange([...selectedPersonnel, ...newPersonnel]);
      setNotFoundCodes(result.not_found);

      if (result.resolved.length > 0) {
        toast.success(`${result.resolved.length} persona(s) cargadas`);
      }
      if (result.not_found.length > 0) {
        toast(`${result.not_found.length} código(s) no encontrados`);
      }
    } catch {
      toast.error('Error al procesar el archivo Excel');
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Box>
      <Tabs
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
        sx={{ mb: 2 }}
        variant="fullWidth"
      >
        <Tab icon={<PersonIcon />} label="Buscar Manual" iconPosition="start" />
        <Tab icon={<UploadIcon />} label="Cargar Excel" iconPosition="start" />
      </Tabs>

      {/* Tab: Manual Search */}
      {tabIndex === 0 && (
        <Autocomplete
          options={personnelList.filter(
            (p) => !selectedPersonnel.some((sp) => sp.id === p.id)
          )}
          getOptionLabel={(option) => `${option.full_name} - ${option.employee_code}`}
          value={null}
          onChange={handleAddPerson}
          renderOption={(props, option) => (
            <Box component="li" {...props} sx={{ display: 'flex', gap: 2, py: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              >
                {option.full_name
                  .split(' ')
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {option.full_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.employee_code} - {option.position}
                </Typography>
              </Box>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Agregar persona"
              placeholder="Buscar por nombre o código..."
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <PersonIcon sx={{ color: 'action.active', mr: 1 }} />
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
          blurOnSelect
          clearOnBlur
        />
      )}

      {/* Tab: Excel Upload */}
      {tabIndex === 1 && (
        <Box>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: 'center',
              borderStyle: 'dashed',
              borderColor: 'secondary.main',
              bgcolor: 'grey.50',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'grey.100' },
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {resolving ? (
              <CircularProgress size={32} />
            ) : (
              <>
                <UploadIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography variant="body1" fontWeight={500}>
                  Haga clic para seleccionar archivo Excel
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Una columna con los códigos de empleado (.xlsx, .xls)
                </Typography>
              </>
            )}
          </Paper>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <Button
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadTemplate}
            sx={{ mt: 1 }}
          >
            Descargar plantilla Excel
          </Button>

          {notFoundCodes.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight={500} gutterBottom>
                Códigos no encontrados:
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {notFoundCodes.map((code) => (
                  <Chip
                    key={code}
                    label={code}
                    size="small"
                    color="error"
                    variant="outlined"
                    icon={<ErrorIcon />}
                  />
                ))}
              </Box>
            </Alert>
          )}
        </Box>
      )}

      {/* Selected Personnel List */}
      {selectedPersonnel.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              <CheckIcon fontSize="small" color="success" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              {selectedPersonnel.length} persona(s) seleccionada(s)
            </Typography>
            <Button size="small" color="error" startIcon={<ClearIcon />} onClick={handleClearAll}>
              Limpiar todo
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Puesto</TableCell>
                  <TableCell width={50} />
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedPersonnel.map((person) => (
                  <TableRow key={person.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {person.employee_code}
                      </Typography>
                    </TableCell>
                    <TableCell>{person.full_name}</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {person.position || person.area_name || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemovePerson(person.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};
