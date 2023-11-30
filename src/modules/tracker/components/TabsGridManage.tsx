import { DataGrid, GridCellParams, GridColDef, esES } from "@mui/x-data-grid";
import { format } from "date-fns/esm";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { EditNoteOutlined, LocalShippingOutlined } from "@mui/icons-material";

import PublicTwoToneIcon from '@mui/icons-material/PublicTwoTone';
import { FC, useEffect, useState } from "react";
import { Tracker, TrackerQueryParams } from '../../../interfaces/tracking';
import { Typography, IconButton, Grid, Box, Tabs, Tab } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store";
import { chanceStatusTracking } from '../../../store/seguimiento/trackerThunk';
import { formatDistance } from "date-fns";
import { es } from "date-fns/locale";


const tableBase = {
    localeText: esES.components.MuiDataGrid.defaultProps.localeText,
    className: "base__table",
    columnHeaderHeight: 35,
    style: { height: "60vh", width: "100%", cursor: "pointer" },
    pageSizeOptions: [15, 20, 50],
    disableColumnFilter: true,
    disableColumnMenu: true,
};

interface TabsGridManageProps {
    query: TrackerQueryParams;
    setquery: React.Dispatch<React.SetStateAction<TrackerQueryParams>>;
    data: Tracker[];
    loading: boolean;
    count: number;
}
export const TabsGridManage: FC<TabsGridManageProps> = ({ query, setquery, data, loading, count }) => {
    const navigate = useNavigate();
    const [value, setValue] = useState(0);
    const { user } = useAppSelector((state) => state.auth);
    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        switch (newValue) {
            case 0:
                setquery({ ...query, type: "LOCAL" });
                break;
            case 1:
                setquery({ ...query, type: "IMPORT" });
                break;
            default:
                setquery({ ...query, type: "LOCAL" });
                break;
        }
        setValue(newValue);
    };


    const columns: GridColDef<Tracker>[] = [
        {
            field: "created_at",
            headerName: "Fecha",
            flex: 1,
            width: 120,
            minWidth: 120,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        {params.value ? format(new Date(params.value), "dd/MM/yyyy") : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "id",
            headerName: "Tracking",
            flex: 1,
            width: 140,
            minWidth: 140,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        TRK-{params.value.toString().padStart(5, "0")}
                    </Typography>
                );
            },
        },

        {
            field: "distributor_center_data",
            headerName: "Centro de distribución",
            flex: 1,
            width: 170,
            minWidth: 170,
            renderCell: (params) => {
                return <Typography variant="body2">{params.value.name}</Typography>;
            },
        },
        {
            field: "input_document_number",
            headerName: "Tranferencia de entrada",
            flex: 1,
            width: 180,
            minWidth: 180,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        {params.value ? params.value : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "transfer_number",
            headerName: "Traslado 5001",
            flex: 1,
            width: 130,
            minWidth: 130,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        {params.value ? params.value : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "accounted",
            headerName: "Contabilizado",
            flex: 1,
            width: 120,
            minWidth: 120,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        {params.value ? params.value : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "user_name",
            headerName: "Usuario",
            flex: 1,
            width: 200,
            minWidth: 200,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        {params.value ? params.value : "-"}
                    </Typography>
                );
            },
        },


        // {
        //     field: "output_document_number",
        //     headerName: "Tranferencia de salida",
        //     flex: 1,
        //     width: 180,
        //     minWidth: 180,
        //     renderCell: (params) => {
        //         return (
        //             <Typography variant="body2">
        //                 {params.value ? params.value : "-"}
        //             </Typography>
        //         );
        //     },
        // },

        // {
        //     field: "status",
        //     headerName: "Estado",
        //     flex: 1,
        //     width: 120,
        //     minWidth: 120,
        //     renderCell: (params) => {
        //         return (
        //             <Chip
        //                 label={
        //                     params.value == "COMPLETE"
        //                         ? "Completado"
        //                         : params.value == "PENDING"
        //                             ? "Pendiente"
        //                             : "En atención"
        //                 }
        //                 variant="outlined"
        //                 color={
        //                     params.value == "COMPLETE"
        //                         ? "success"
        //                         : params.value == "PENDING"
        //                             ? "warning"
        //                             : "info"
        //                 }
        //             />
        //         );
        //     },
        // },
        // {
        //     field: "invoice_number",
        //     headerName: "No. Factura",
        //     flex: 1,
        //     width: 130,
        //     minWidth: 130,
        //     renderCell: (params) => {
        //         return (
        //             <Typography variant="body2">
        //                 {params.value ? params.value : "-"}
        //             </Typography>
        //         );
        //     },
        // },
        {
            field: "time_invested",
            headerName: "TAT (Tiempo Invertido)",
            flex: 1,
            width: 180,
            minWidth: 180,
            renderCell: (params: GridCellParams<Tracker>) => {
                const tiempoSalida = params.row.output_date;
                const tiempoEntrada = params.row.input_date;
                return (
                    <Typography variant="body2">
                        {tiempoSalida && tiempoEntrada
                            ? formatDistance(new Date(tiempoSalida), new Date(tiempoEntrada), {
                                locale: es,
                            })
                            : "--:--:--"}
                    </Typography>
                );
            },
        },
        {
            field: "observation",
            headerName: "Observaciones",
            flex: 1,
            width: 300,
            minWidth: 300,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        {params.value ? params.value : "--"}
                    </Typography>
                );
            },
        },
        // {
        //     field: "archivo_name",
        //     headerName: "Documentos Adjuntos",
        //     flex: 1,
        //     width: 170,
        //     minWidth: 170,
        //     renderCell: (params) => {
        //        return <ChipFile tracker={params.row} />;
        //     },
        // },

        {
            field: "ver",
            headerName: "Acciones",
            flex: 0,
            width: 80,
            renderCell: (params) => {
                return (
                    <>
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate("/tracker/detail/" + params.row.id)}
                        >
                            <ArrowForwardIcon />
                        </IconButton>
                        {params.row.status === "PENDING" &&
                            user != null &&
                            params.row.user === +user.id && (
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleEditState(params.row.id)}
                                >
                                    <EditNoteOutlined />
                                </IconButton>
                            )}
                    </>
                );
            },
        },
    ];

    const columnsimport: GridColDef<Tracker>[] = [
        {
            field: "created_at",
            headerName: "Fecha",
            flex: 1,
            width: 120,
            minWidth: 120,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        {params.value ? format(new Date(params.value), "dd/MM/yyyy") : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "id",
            headerName: "Tracking",
            flex: 1,
            width: 140,
            minWidth: 140,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        TRK-{params.value.toString().padStart(5, "0")}
                    </Typography>
                );
            },
        },

        {
            field: "distributor_center_data",
            headerName: "Centro de distribución",
            flex: 1,
            width: 170,
            minWidth: 170,
            renderCell: (params) => {
                return <Typography variant="body2">{params.value.name}</Typography>;
            },
        },
        {
            field: "container_number",
            headerName: "# Contenedor",
            flex: 1,
            width: 180,
            minWidth: 180,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        {params.value ? params.value : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "plate_number",
            headerName: "# Placa",
            flex: 1,
            width: 130,
            minWidth: 130,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        {params.value ? params.value : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "invoice_number",
            headerName: "No. Factura",
            flex: 1,
            width: 130,
            minWidth: 130,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        {params.value ? params.value : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "transfer_number",
            headerName: "Traslado 5001",
            flex: 1,
            width: 130,
            minWidth: 130,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        {params.value ? params.value : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "user_name",
            headerName: "Usuario",
            flex: 1,
            width: 200,
            minWidth: 200,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        {params.value ? params.value : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "time_invested",
            headerName: "TAT (Tiempo Invertido)",
            flex: 1,
            width: 180,
            minWidth: 180,
            renderCell: (params: GridCellParams<Tracker>) => {
                const tiempoSalida = params.row.output_date;
                const tiempoEntrada = params.row.input_date;
                return (
                    <Typography variant="body2">
                        {tiempoSalida && tiempoEntrada
                            ? formatDistance(new Date(tiempoSalida), new Date(tiempoEntrada), {
                                locale: es,
                            })
                            : "--:--:--"}
                    </Typography>
                );
            },
        },
        {
            field: "observation",
            headerName: "Observaciones",
            flex: 1,
            width: 300,
            minWidth: 300,
            renderCell: (params) => {
                return (
                    <Typography variant="body2">
                        {params.value ? params.value : "--"}
                    </Typography>
                );
            },
        },
        // {
        //     field: "archivo_name",
        //     headerName: "Documentos Adjuntos",
        //     flex: 1,
        //     width: 170,
        //     minWidth: 170,
        //     renderCell: (params) => {
        //        return <ChipFile tracker={params.row} />;
        //     },
        // },

        {
            field: "ver",
            headerName: "Acciones",
            flex: 0,
            width: 80,
            renderCell: (params) => {
                return (
                    <>
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate("/tracker/detail/" + params.row.id)}
                        >
                            <ArrowForwardIcon />
                        </IconButton>
                        {params.row.status === "PENDING" &&
                            user != null &&
                            params.row.user === +user.id && (
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleEditState(params.row.id)}
                                >
                                    <EditNoteOutlined />
                                </IconButton>
                            )}
                    </>
                );
            },
        },
    ];

    const dispatch = useAppDispatch();

    const handleEditState = (id: number) => {
        dispatch(
            chanceStatusTracking("EDITED", id, () =>
                navigate("/tracker/check/?id=" + id)
            )
        );
    };

    const [paginationModel, setPaginationModel] = useState<{
        pageSize: number;
        page: number;
    }>({
        pageSize: query.limit,
        page: query.offset,
    });

    useEffect(() => {
        setquery({
            ...query,
            limit: paginationModel.pageSize,
            offset: paginationModel.page * paginationModel.pageSize,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationModel]);



    return (
        <>
            <Grid item xs={12}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="Locales" {...a11yProps(0)} icon={<LocalShippingOutlined />} iconPosition="start" />
                        <Tab label="Importados" {...a11yProps(1)} icon={<PublicTwoToneIcon />} iconPosition="start" />
                    </Tabs>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <DataGrid
                    {...tableBase}
                    columns={ value === 0 ? columns : columnsimport}
                    rows={data}
                    paginationMode="server"
                    rowCount={count}
                    pagination
                    getRowHeight={() => 'auto'}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    loading={loading}
                    onRowDoubleClick={(params) =>
                        navigate(`/tracker/detail/${params.id}`)
                    }
                />
            </Grid>
        </>
    )
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


// const ChipFile: FC<{ tracker: Tracker }> = ({ tracker }) => {
//     const dispatch = useAppDispatch();
//     const [loading, setloading] = useState(false)
//     const handleClickDescargar = () => {
//         setloading(true)
//         dispatch(downloadFile(tracker.id, () => {
//             setloading(false)
//         }))
//     };

//     if (tracker.is_archivo_up == false) {
//         return (
//             <>--</>
//         );
//     }
//     return (
//         <Chip
//             onClick={handleClickDescargar}
//             label={loading ? "Descargando..." : "Descargar"}
//             variant='outlined'
//             color="secondary"
//             icon={
//                 loading ? <CircularProgress size={20} /> :
//                     <CloudDownloadTwoToneIcon color="secondary" />}
//             size="medium"
//             sx={{ mt: 1 }}
//         />
//     );
// }