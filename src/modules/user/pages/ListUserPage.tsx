import { Container, Divider, Grid, IconButton, Typography, Button, Chip, Box } from '@mui/material';
import { DataGrid, GridCellParams, GridColDef, esES } from '@mui/x-data-grid';
import { format } from 'date-fns';
import FilterAltTwoToneIcon from '@mui/icons-material/FilterAltTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import LockResetTwoToneIcon from '@mui/icons-material/LockResetTwoTone';
import { useState } from 'react';
function getRoleChip(group: string[]): JSX.Element {
    return <Chip
        label={group[0]}
        variant='filled'
        color="default"
        size="small"
        sx={{
            color: (theme) => theme.palette.secondary.main,
            borderColor: (theme) => theme.palette.primary.main + ' !important',
        }}
    />
}


export const ListUserPage = () => {

    const columns: GridColDef[] = [
        {
            field: 'nombre',
            flex: 1,
            headerClassName: "base__header",
            headerName: 'NOMBRE', width: 150,
            minWidth: 150,
        },
        {
            field: 'apellido',
            flex: 1,
            headerClassName: "base__header",
            headerName: 'APELLIDO', width: 150,
            minWidth: 150,
        },
        {
            field: 'correo',
            flex: 1,
            headerClassName: "base__header",
            headerName: 'CORREO',
            width: 200,
            minWidth: 200,
        },
        {
            field: 'grupo',
            flex: 1,
            headerClassName: "base__header",
            headerName: 'GRUPO',
            width: 150,
            minWidth: 150,
            renderCell: (params: GridCellParams) =>
                getRoleChip(params.value as string[]),

        },
        {
            field: 'fechaCreacion',
            flex: 1,
            headerClassName: "base__header",
            headerName: 'FECHA DE CREACIÓN',
            width: 170,
            minWidth: 170,
            valueFormatter: (params) => format(new Date(params.value), 'dd/MM/yyyy'),
        },
        // {
        //     field: 'estado',
        //     flex: 0,
        //     headerClassName: "base__header",
        //     headerName: 'Estado', width: 150,
        //     renderCell: (params: GridCellParams) =>
        //         getStatusChip(Boolean(params.value)),
        // },
        {
            field: 'actions',
            flex: 0,
            headerClassName: "base__header",
            headerName: 'ACCIONES',
            width: 100,
            align: 'center',
            renderCell: (params: GridCellParams) => (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <IconButton
                        color="default"
                        size="medium"
                        onClick={() => console.log(params.row)}
                        title='Editar usuario'
                    >
                        <EditTwoToneIcon fontSize="medium" />
                    </IconButton>
                    <IconButton
                        color="default"
                        size="medium"
                        onClick={() => console.log(params.row)}
                        // mensaje al poner el mouse encima
                        title="Resetear contraseña"
                        
                    >
                        <LockResetTwoToneIcon fontSize="medium" />
                    </IconButton>
                </Box>
            ),
        },
        // {
        //     field: 'reset',
        //     flex: 0,
        //     headerClassName: "base__header",
        //     headerName: 'Resetear Contraseña',
        //     align: 'center',
        //     width: 100,
        //     renderCell: (params: GridCellParams) => (
        //         <IconButton
        //             color="primary"
        //             size="medium"
        //             onClick={() => handleResetPassword(params.row.usuarioId as number)}
        //         >
        //             <LockResetIcon fontSize="medium" />
        //         </IconButton>
        //     ),

        // }
    ];
    const tableBase = {
        localeText: esES.components.MuiDataGrid.defaultProps.localeText,
        className: "base__table",
        columnHeaderHeight: 35,
        style: { height: "60vh", width: "100%", cursor: "pointer" },
        pageSizeOptions: [15, 20, 50],
        disableColumnFilter: true,
        disableColumnMenu: true,
    }

    const [paginationModel, setPaginationModel] = useState<{ pageSize: number; page: number }>({
        pageSize:  15,
        page: 0,
    });

  return (
    <Container maxWidth="lg">
        <Grid container spacing={1} sx={{ marginTop: 2 }}>
            <Grid item xs={12}>
                <Typography variant="h5" component="h1" fontWeight={400}>
                    Administrar Usuarios
                </Typography>
                <Divider sx={{marginBottom: 0, marginTop: 1}} />
            </Grid>
            <Grid item xs={12} sx={{display: 'flex', justifyContent: 'flex-end'}}>
                <Button 
                    color="primary"
                    size="small"
                    variant="contained"
                    sx={{marginBottom: 1}}
                    onClick={() => console.log('click')}
                    startIcon={<FilterAltTwoToneIcon color="inherit" fontSize="small" />}   
                >
                    <Typography variant="body2" component="span" fontWeight={200} color={'gray.700'}>
                    Filtrar
                    </Typography>
                </Button>
            </Grid>
            <Grid item xs={12}>
                <div style={{ height: 400, width: '100%' }}>
                    <DataGrid
                        {...tableBase}
                        columns={columns}
                        rows={[{
                            id: 1,
                            nombre: 'Juan',
                            apellido: 'Perez',
                            correo: 'juanperez@test.com',
                            grupo: ['ADMINISTRADOR'],
                            fechaCreacion: '2021-10-10',
                            estado: true,
                        }]}
                        pagination
                        paginationMode="server"
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                    />
                </div>
            </Grid>
        </Grid>

    </Container>
  )
}
