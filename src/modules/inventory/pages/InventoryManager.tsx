import { Button, Chip, Container, Divider, Grid, Typography } from "@mui/material"
import FilterListTwoToneIcon from '@mui/icons-material/FilterListTwoTone';
import PostAddTwoToneIcon from '@mui/icons-material/PostAddTwoTone';
import BookmarkAddTwoToneIcon from '@mui/icons-material/BookmarkAddTwoTone';
import BookmarkRemoveTwoToneIcon from '@mui/icons-material/BookmarkRemoveTwoTone';
import CachedTwoToneIcon from '@mui/icons-material/CachedTwoTone';
import { useGetInventoryQuery } from "../../../store/inventory/api";
import { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { InventarioMoviment, InventarioMovimentQueryParams, Product } from '../../../interfaces/tracking';
import { tableBase } from '../../ui/index';
import { format } from "date-fns";
import { NewAdjustmentModal } from "../components/NewAdjustmentModal";
import { FilterInventory, FormFilterInventory, ModuleSelectOptions } from "../components/FilterInventory";

import { useAppDispatch, useAppSelector } from "../../../store";
import { setInventoryQueryParams } from "../../../store/ui/uiSlice";
import { DistributionCenter } from "../../../interfaces/maintenance";
import { Link } from "react-router-dom";
import ChipFilterCategory from "../../ui/components/ChipFilter";

const getTypoMov = (value: string) => {
    switch (value) {
        case 'IN':
            return <Chip 
                label="Ingreso" 
                icon={<BookmarkAddTwoToneIcon />}
                color="success" 
                variant="outlined"
                size="small" />
        case 'OUT':
            return <Chip
                label="Salida"
                variant="outlined"
                icon={<BookmarkRemoveTwoToneIcon />}
                color="error"
                size="small" />
        default:
            return <Chip
                label="Reajuste"
                variant="outlined"
                icon={<CachedTwoToneIcon />}
                color="secondary"
                size="small" />

    }
}
const InventoryManager = () => {
    const [openFilter, setOpenFilter] = useState(false)

    const { inventoryQueryParams } = useAppSelector(state => state.ui)
    
    const [query, setquery] = useState<InventarioMovimentQueryParams>({
        limit: 15,
        offset: 0,
        productos: [],
        distributor_center: [],
        module: [],
    });
    const [paginationModel, setPaginationModel] = useState<{
        pageSize: number;
        page: number;
    }>({
        pageSize: 15,
        page: 0,
    });

    useEffect(() => {
        setquery(() => ({
            ...inventoryQueryParams,
            limit: paginationModel.pageSize,
            offset: paginationModel.page * paginationModel.pageSize,
        }));
    }, [inventoryQueryParams, paginationModel]);
    

    const { data, isLoading, isFetching, refetch, } = useGetInventoryQuery(query);

    const columns: GridColDef<InventarioMoviment>[] = [
        { field: 'Tracking', headerName: 'Tracking', width: 100, renderCell: (params) => (
            <Link to={`/tracker/detail/${params.row.tracker}`} style={{ textDecoration: 'none' }}>
                <Typography variant="body2" component="h2" fontWeight={400} color="secondary">
                    TRK-{params.row.tracker.toString().padStart(5, '0')}
                </Typography>
            </Link>
        ) },
        { field: 'distributor_center_name', headerName: 'Centro de distribución', width: 170, minWidth: 170 },
        { field: 'product_name', headerName: 'Producto', width: 300, minWidth: 300 },
        { field: 'product_sap_code', headerName: 'Código', width: 100 },
        {
            field: 'movement_type', headerName: 'Tipo de movimiento', width: 200, renderCell: (params) => getTypoMov(params.value)
        },
        {
            field: 'initial_quantity', headerName: 'Cantidad inicial', width: 140, renderCell: (params) => (
                <Typography variant="body2" component="h2" fontWeight={400}>
                    {params.row.is_applied ? params.value : '--'}
                </Typography>
            )
        },
        { field: 'quantity', headerName: 'Movimiento', width: 100 },
        {
            field: 'final_quantity', headerName: 'Cantidad final', width: 140, renderCell: (params) => (
                <Typography variant="body2" component="h2" fontWeight={400}>
                    {params.row.is_applied ? params.value : '--'}
                </Typography>
            )
        },

        {
            field: 'module', headerName: 'Modulo', width: 200, renderCell: (params) => (
                <Typography variant="body2" component="h2" fontWeight={400}>
                    {params.value === 'ADMIN' ? 'ADMINISTRACIÓN' : params.value}
                </Typography>
            )
        },
        {
            field: 'origin_id', headerName: 'Registro', width: 200, renderCell: (params) => (
                <Typography variant="body2" component="h2" fontWeight={400}>
                    {params.row.module === 'T1' ? `TRK-${params.value.toString().padStart(5, '0')}` : params.value}
                </Typography>
            )
        },

        {
            field: 'created_at', headerName: 'Creado', width: 200, renderCell: (params) => (
                <Typography variant="body2" component="h2" fontWeight={400}>
                    {format(new Date(params.value as string), 'dd/MM/yyyy HH:mm')}
                </Typography>
            )
        },
        {
            field: 'applied_date', headerName: 'Aplicado el', width: 200
            , renderCell: (params) => (
                <Typography variant="body2" component="h2" fontWeight={400}>
                    {params.value ? format(new Date(params.value as string), 'dd/MM/yyyy HH:mm') : ''}
                </Typography>
            )
        },

        { field: 'user_name', headerName: 'Usuario', width: 200 },

    ];

    useEffect(() => {
        refetch();
    }, [refetch, query]);
    const [openAdd, setopenAdd] = useState(false)

    const dispatch = useAppDispatch()

    const handleFilter = (data: FormFilterInventory) => {
        const queryProcess: InventarioMovimentQueryParams = {
          ...query,
          tracker: data.tracker,
          productos: data.productos,
          distributor_center: data.distributor_center,
          date_before: data.date_before,
          date_after: data.date_after,
          module: data.module,
        };
        setquery(queryProcess);
        dispatch(setInventoryQueryParams(queryProcess));
      };

    const handleClickDeleteProductFilter = (product: Product)=>{
        const productos = query.productos
        const result = productos.filter(producto => producto.sap_code !== product.sap_code)
        const queryProcess: InventarioMovimentQueryParams = {
        ...inventoryQueryParams,
        productos: result,
        };
        setquery(queryProcess);
        dispatch(setInventoryQueryParams(queryProcess));
    }

    const handleClickDeleteDistributorCenterFilter = (distributorCenter: DistributionCenter)=>{
        const cds = query.distributor_center
        const result = cds.filter(centroDistribucion => centroDistribucion.id !== distributorCenter.id)
        const queryProcess: InventarioMovimentQueryParams = {
        ...inventoryQueryParams,
        distributor_center: result,
        };
        setquery(queryProcess);
        dispatch(setInventoryQueryParams(queryProcess));
    }

    const handleClickDeleteModuleFilter = (module: string)=>{
        const modules = query.module
        const result = modules.filter(modulo => modulo !== module)
        const queryProcess: InventarioMovimentQueryParams = {
        ...inventoryQueryParams,
        module: result,
        };
        setquery(queryProcess);
        dispatch(setInventoryQueryParams(queryProcess));
    }

    const handleClickDeleteTrackerFilter = ()=>{
        const queryProcess: InventarioMovimentQueryParams = {
        ...inventoryQueryParams,
        tracker: undefined,
        };
        setquery(queryProcess);
        dispatch(setInventoryQueryParams(queryProcess));
    }

    const handleClickDeleteDateAfterFilter = ()=>{
        const queryProcess: InventarioMovimentQueryParams = {
        ...inventoryQueryParams,
        date_after: undefined,
        };
        setquery(queryProcess);
        dispatch(setInventoryQueryParams(queryProcess));
    }

    const handleClickDeleteDateBeforeFilter = ()=>{
        const queryProcess: InventarioMovimentQueryParams = {
        ...inventoryQueryParams,
        date_before: undefined,
        };
        setquery(queryProcess);
        dispatch(setInventoryQueryParams(queryProcess));
    }

    return (
        <>
        {openFilter && <FilterInventory open={openFilter} handleFilter={handleFilter} handleClose={()=>setOpenFilter(false)}/>}
        <NewAdjustmentModal isOpen={openAdd} onClose={() => setopenAdd(false)} refetch={refetch} />
            <Container maxWidth="xl" sx={{ marginTop: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h5" component="h1" fontWeight={400}>
                            Movimientos de inventario
                        </Typography>
                        <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2" component="h2" fontWeight={400}>
                            A continuación se muestra el listado de los movimientos de inventario registrados en el sistema, por centro de distribución.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} display="flex" justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            color="secondary"
                            sx={{ marginRight: 1 }}
                            endIcon={<FilterListTwoToneIcon />}
                            onClick={() => setOpenFilter(true)}
                        >
                            Filtrar
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            sx={{ marginRight: 1 }}
                            endIcon={<PostAddTwoToneIcon />}
                            onClick={() => setopenAdd(true)}
                        >
                            Nuevo reajuste
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={1}>
                            {
                                inventoryQueryParams.productos.length > 0 &&
                                <ChipFilterCategory 
                                    label="Producto: "
                                    items={inventoryQueryParams.productos.map(product =>{
                                        return {
                                            label: product.sap_code,
                                            id: product.sap_code,
                                            deleteAction: () => handleClickDeleteProductFilter(product)
                                        }
                                    })}
                                />
                            }
                            {
                                inventoryQueryParams.tracker &&
                                <ChipFilterCategory 
                                    label="Tracking: "
                                    items={[{
                                            label: `TRK-${inventoryQueryParams.tracker?.toString().padStart(5, '0')}`,
                                            id: "",
                                            deleteAction: handleClickDeleteTrackerFilter
                                        }]}
                                />
                            }
                            {
                                inventoryQueryParams.distributor_center.length > 0 &&
                                <ChipFilterCategory 
                                    label="Centro de Distribución: "
                                    items={inventoryQueryParams.distributor_center.map(distributor_center =>{
                                        return {
                                            label: distributor_center.name,
                                            id: distributor_center.id.toString(),
                                            deleteAction: () => handleClickDeleteDistributorCenterFilter(distributor_center)
                                        }
                                    })}
                                />
                            }
                            {
                                inventoryQueryParams.module.length > 0 &&
                                <ChipFilterCategory 
                                    label="Módulo: "
                                    items={inventoryQueryParams.module.map(module =>{
                                        const modulefind = ModuleSelectOptions.find(mod=>mod.value === module)
                                        return {
                                            label: modulefind?.text || "",
                                            id: modulefind?.value || "",
                                            deleteAction: () => handleClickDeleteModuleFilter(modulefind?.value.toString()||"")
                                        }
                                    })}
                                />
                            }
                            {
                                (inventoryQueryParams.date_after || inventoryQueryParams.date_before) &&
                                <ChipFilterCategory 
                                    label="Fecha de Registro: "
                                    items={(()=>{
                                        const date_after ={
                                            label: `Mayor que: ${inventoryQueryParams.date_after && format(new Date(inventoryQueryParams.date_after), 'dd/MM/yyyy')}`,
                                            id: "date_after",
                                            deleteAction: handleClickDeleteDateAfterFilter
                                        }
                                        const date_before ={
                                            label: `Menor que: ${inventoryQueryParams.date_before && format(new Date(inventoryQueryParams.date_before), 'dd/MM/yyyy')}`,
                                            id: "date_before",
                                            deleteAction: handleClickDeleteDateBeforeFilter
                                        }
                                        const items = []
                                        inventoryQueryParams.date_after && items.push(date_after)
                                        inventoryQueryParams.date_before && items.push(date_before)
                                        return items
                                    })()}
                                />
                            }
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <DataGrid
                            {...tableBase}
                            columns={columns}
                            rows={data?.results || []}
                            paginationMode="server"
                            rowCount={data?.count || 0}
                            pagination
                            getRowHeight={() => 'auto'}
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            loading={isLoading || isFetching}
                        />  
                    </Grid>
                </Grid>
            </Container>
        </>
    )
}

export default InventoryManager