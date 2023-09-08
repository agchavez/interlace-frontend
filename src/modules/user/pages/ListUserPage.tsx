import { Container, Divider, Grid, IconButton, Typography, Chip, Box } from '@mui/material';
import { DataGrid, GridCellParams, GridColDef, esES } from '@mui/x-data-grid';
import { format } from 'date-fns';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import LockResetTwoToneIcon from '@mui/icons-material/LockResetTwoTone';
import { useEffect, useState } from 'react';
import { User, UserQuerySearch } from '../../../interfaces/user';
import { useGetUserQuery } from '../../../store/user/userApi';
import { CustomSearch } from '../../ui/components/CustomSearch';
import { Link } from 'react-router-dom';
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

    const [query, setquery] = useState<UserQuerySearch>({
        limit: 15,
        offset: 0,
        search: '',
    });

    const {
        data, isLoading, refetch
    } = useGetUserQuery(query)

    const columns: GridColDef<User>[] = [
        {
            field: 'first_name',
            flex: 1,
            headerClassName: "base__header",
            headerName: 'NOMBRE', 
            width: 150,
            minWidth: 150,
        },
        {
            field: 'last_name',
            flex: 1,
            headerClassName: "base__header",
            headerName: 'APELLIDO', width: 150,
            minWidth: 150,
        },
        {
            field: 'email',
            flex: 1,
            headerClassName: "base__header",
            headerName: 'CORREO',
            width: 200,
            minWidth: 200,
        },
        {
            field: 'list_groups',
            flex: 1,
            headerClassName: "base__header",
            headerName: 'GRUPO',
            width: 150,
            minWidth: 150,
            renderCell: (params: GridCellParams) =>
                getRoleChip(params.value as string[]),

        },
        {
            field: 'created_at',
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
            renderCell: (params: GridCellParams) => {
                return(
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Link to={`/user/register?edit=${params.row.id}`}>
                        <IconButton
                            color="default"
                            size="medium"
                            onClick={() => console.log(params.row)}
                            title='Editar usuario'
                        >
                            <EditTwoToneIcon fontSize="medium" />
                        </IconButton>
                    </Link>
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
            )},
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

    useEffect(() => {
        setquery({
            ...query,
            limit: paginationModel.pageSize,
            offset: paginationModel.page,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationModel])


    useEffect(() => {
        refetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query])

  return (
    <Container maxWidth="lg">
        <Grid container spacing={1} sx={{ marginTop: 2 }}>
            <Grid item xs={12}>
                <Typography variant="h5" component="h1" fontWeight={400}>
                    Administrar usuarios
                </Typography>
                <Divider sx={{marginBottom: 0, marginTop: 1}} />
            </Grid>
            <Grid item xs={12}>
                <CustomSearch
                    placeholder="Buscar usuario"
                    value={query.search}
                    onChange={(e) => setquery({...query, search: e.target.value})}
                    onClick={() => console.log('click')}
                />
            </Grid>
            <Grid item xs={12}>
                <div style={{ height: 400, width: '100%' }}>
                    <DataGrid
                        {...tableBase}
                        columns={columns}
                        rows={data?.results || []}
                        rowCount={data?.count || 0}                        
                        pagination
                        paginationMode="server"
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        loading={isLoading}
                    />
                </div>
            </Grid>
        </Grid>

    </Container>
  )
}
