import React, { FC, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
    Grid,
    Paper,
    IconButton,
    InputBase,
    Box,
    Alert
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import ThumbDownOffAltTwoToneIcon from '@mui/icons-material/ThumbDownOffAltTwoTone';
import ThumbUpAltTwoToneIcon from '@mui/icons-material/ThumbUpAltTwoTone';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { useAppSelector, useAppDispatch } from '../../../store/store';
import { OutputDetailT2, OutputDetailT2Detail, DatesT2Tracking, T2TrackingDetailBody, DetailDatesT2Tracking, ListT2TrackingDetail, Status } from '../../../interfaces/trackingT2';
import { useGetDatesT2TrackingQuery } from "../../../store/seguimiento/trackerApi";
import { format, parseISO } from "date-fns";
import { CircularProgress } from '@mui/material';
import { useForm } from "react-hook-form";
import { updateT2TrackingDetail, updateStatusT2TrackingDetail } from '../../../store/seguimiento/t2TrackingThunk';
import { toast } from 'sonner';
import { RejectedItemModal } from "./RejectedItemModal";
import { ListOutTrackerDetail } from './ListOutTrackerDetail';
import { LotSelect } from "../../ui/components/LotSelect";
import { LotType } from '../../../interfaces/maintenance';

// Función para manejar el cambio de expansión del acordeón
const handleChange = (panel: number, _expanded: number | false, setExpanded: React.Dispatch<React.SetStateAction<number | false>>) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
};

interface renderCheckFormProps {
    data: OutputDetailT2;
    expanded: number | false
    setExpanded: React.Dispatch<React.SetStateAction<number | false>>
    status: Status;
}

// Función para renderizar el contenido del acordeón
const RenderAccordion: FC<renderCheckFormProps> = ({ data, expanded, setExpanded, status }) => {
    const { data: datesData, isLoading, isFetching } = useGetDatesT2TrackingQuery({
        id: data.product,
        output_id: data.id
    }, { refetchOnMountOrArgChange: true, skip: expanded === data.id ? false : true });

    const dispatch = useAppDispatch();
    const [rejected, setrejected] = useState({
        isOpen: false,
        data
    })
    return (
        <>
            <RejectedItemModal
                isOpen={rejected.isOpen}
                onClose={() => setrejected({ isOpen: false, data })}
                data={rejected.data}
            />

            <Accordion expanded={expanded === data.id} onChange={handleChange(data.id, expanded, setExpanded)} sx={{ marginBottom: '10px', marginTop: '10px' }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`${data.id}bh-content`}
                    id={`${data.id}bh-header`}
                >


                    {
                        status === 'CHECKED' &&
                        <>
                            <IconButton aria-label="check" size="small" onClick={(e) => {
                                e.stopPropagation()
                                dispatch(updateStatusT2TrackingDetail({id: data.id, status: data.status === 'AUTHORIZED' ? 'CHECKED' : 'AUTHORIZED', reason: ""}))
                            }}>
                                {
                                    data.status === 'AUTHORIZED' ? <ThumbUpIcon sx={{ color: 'green' }} /> : <ThumbUpAltTwoToneIcon />
                                }
                            </IconButton>
                            <IconButton aria-label="check" size="small" onClick={(e) => {
                                e.stopPropagation()
                                if (data.status === 'CHECKED') {
                                    setrejected({ isOpen: true, data })
                                } else {
                                    dispatch(updateStatusT2TrackingDetail({id: data.id,status: 'CHECKED', reason: ""}))
                                }
                            }
                            }>
                                {
                                    data.status === 'REJECTED' ? <ThumbDownOffAltTwoToneIcon sx={{ color: 'red' }} /> : <ThumbDownOffAltTwoToneIcon />
                                }
                            </IconButton>

                        </>
                    }
                    <Typography sx={{ width: '90%', flexShrink: 0 }}>
                        {data.product_sap_code + ' - ' + data.product_name}
                        <Typography sx={{ color: 'gray' }}>
                            {data.observations}
                        </Typography>
                    </Typography>
                    <Typography sx={{ color: data.details.total_quantity === +data.quantity ? 'green' : 'red' }}>
                        {data.details.total_quantity} de {data.quantity}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                    {
                                !['CREATED', 'REJECTED'].includes(status) ?

                                    <ListOutTrackerDetail
                                        data={data.details.details}
                                        total_quantity={data.details.total_quantity}
                                    />
                                    :  <Grid item xs={12}>

                            
                                        {
                                            isLoading || isFetching ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                                                <CircularProgress />
                                            </Box> : null
                                        }
                                        {
                                            datesData?.results.length === 0 && !isLoading && !isFetching ?
                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                                                    <Alert severity="warning" sx={{ width: '100%' }}>
                                                        No hay fechas disponibles para este item
                                                    </Alert>
                                                </Box> : null
                                        }
                                        <Grid container spacing={2}>
                                        {
                                            datesData?.results.map((date) => {
                                                return (
                                                    <RenderDateContent
                                                        data={date}
                                                        key={date.details[0] ? date.details[0].id : Math.random()}
                                                        itemId={data.id}
                                                        selected={data.details}
                                                        totalItems={+data.quantity}
                                                    />
                                                );
                                            })
                                        }
                                        </Grid>
                        </Grid>}
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </>
    );
};

interface RenderCheckProps {
    data: DatesT2Tracking;
    selected: {
        total_quantity: number;
        details: OutputDetailT2Detail[]
    };
    itemId: number;
    totalItems: number;
}
// Función para renderizar el contenido de la fecha
const RenderDateContent: FC<RenderCheckProps> = ({ data, selected, itemId, totalItems }) => {
    const isSelected = selected.details.filter((element) => element.expiration_date === data.expiration_date) ? selected.details.filter((element) => element.expiration_date === data.expiration_date)[0] : null;
    const dispatch = useAppDispatch();
    const [check, setCheck] = useState<boolean>(isSelected ? true : false);
    const {control, setValue} = useForm<{lote: number | null}>({
        defaultValues: {
            lote: isSelected?.lote  
    }});
    
    const handleSelect = (value: LotType | null)=>{
        setValue('lote', value?.id || null)
        dispatch(updateStatusT2TrackingDetail({id: itemId, lote: value?.id, listIds: isSelected?.details.map(detail=> detail.id)}))
    }
    const handlClick = () => {

        setCheck(!check);
        if (!check) {

            const dataBody: T2TrackingDetailBody = {
                list: data.details.map((element: DetailDatesT2Tracking) => {
                    return {
                        quantity: element.available_quantity,
                        tracker_detail_product: element.id,
                    };
                }),
                list_delete: [],
            };
            const sum = dataBody.list.reduce((a, b) => a + b.quantity, 0);
            if (sum + selected.total_quantity > totalItems) {
                toast.error('La cantidad seleccionada supera la cantidad total del item, ingrese una cantidad menor');
            } else {
                dispatch(updateT2TrackingDetail(itemId, dataBody));
            }
        } else {
            if (isSelected) {
                const dataBody: T2TrackingDetailBody = {
                    list: [],
                    list_delete: isSelected.details.map((element) => element.id),
                };
                dispatch(updateT2TrackingDetail(itemId, dataBody));
            }

        }
    };
    const handleBlur = (quantity: number | null) => {
        if (check && quantity !== null) {
            let localQuantity = quantity;
            const list: ListT2TrackingDetail[] = [];
            if (quantity + selected.total_quantity - (isSelected ? isSelected.quantity : 0) > totalItems) {
                toast.error('La cantidad seleccionada supera la cantidad total del item, ingrese una cantidad menor');
                return;
            }

            // Ordenar por available_quantity mayor a menor
            const sortedDetails = data.details.slice().sort((a, b) => b.available_quantity - a.available_quantity);

            sortedDetails.forEach((element) => {
                if (localQuantity > 0) {
                    if (localQuantity >= element.available_quantity) {
                        list.push({
                            quantity: element.available_quantity,
                            tracker_detail_product: element.id,
                        });
                        localQuantity -= element.available_quantity;
                    } else {
                        // Si localQuantity es menor que element.available_quantity
                        // Ajustar la última cantidad en la lista para cumplir con watch('quantity')
                        const adjustedQuantity = Math.min(localQuantity, element.available_quantity);
                        list.push({
                            quantity: adjustedQuantity,
                            tracker_detail_product: element.id,
                        });
                        localQuantity = 0;
                    }
                }
            });

            // Realizar operaciones relacionadas con dispatch y actualización del estado aquí
            const dataBody: T2TrackingDetailBody = {
                list: list,
                list_delete: isSelected ? isSelected.details.map((element) => element.id) : [],
            };

            dispatch(updateT2TrackingDetail(itemId, dataBody));
        }
    };



    return (
        // key random
        <Grid item xs={12} md={6} xl={4} lg={3} key={Math.random()}>
            <Paper
                component="form"
                elevation={1}
                sx={{ p: '2px 4px', display: 'row' }}
            >

                <Typography variant="body1" component="h1" fontWeight={400} marginLeft={'10px'}>
                    {
                        format(new Date(parseISO(data.expiration_date.toString())), 'dd/MM/yyyy')
                    }
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        sx={{ p: '10px' }}
                        aria-label="menu"
                        onClick={handlClick}
                    >
                        {
                            check ? <CheckBoxIcon color="primary" /> : <CheckBoxOutlineBlankIcon />
                        }

                    </IconButton>
                    <RenderInput
                        data={data}
                        onBlur={handleBlur}
                        itemId={itemId}
                        isSelected={isSelected}
                    />

                    <Typography>
                        de {data.total}
                    </Typography>
                    <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions">
                        <ExpandMoreIcon />
                    </IconButton>
                </Box>
                {isSelected && <Box sx={{p: '10px'}}>
                    <LotSelect
                        control={control}
                        name="lote"
                        onChange={handleSelect}
                        lotId={isSelected?.lote || undefined}
                        placeholder="Lote"
                        registered={true}
                        />
                </Box>}

            </Paper>
        </Grid>
    );
};

interface RenderInputProps {
    data: DatesT2Tracking;
    onBlur: (quantity: number | null) => void;
    itemId: number;
    isSelected: OutputDetailT2Detail | null;
}

// Función para renderizar el contenido de la fecha
const RenderInput: FC<RenderInputProps> = ({ data, onBlur, isSelected }) => {

    const { setValue, watch } = useForm<{ quantity: number | null }>({
        defaultValues: {
            quantity: isSelected ? isSelected.quantity : null,
        }
    });

    const handleOnBlur = () => {
        const quantity = watch('quantity');
        if (quantity !== null && quantity !== isSelected?.quantity) {
            onBlur(quantity);
        }
    };

    return <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder={
            isSelected ? isSelected.quantity.toString()
                : data.total.toString()}
        type="number"
        autoComplete="off"
        onChange={(e) => {
            setValue('quantity', +e.target.value);
        }}
        value={watch('quantity')}
        onBlur={handleOnBlur}
        // TODO: desactivar el submit al presionar enter
        onKeyPress={(e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleOnBlur();
            }
        }}

    />
}


// Componente principal CheckForm
export const CheckForm = () => {
    const [expanded, setExpanded] = useState<number | false>(false);
    const { t2TrackingActual } = useAppSelector((state) => state.seguimiento.t2Tracking);
    return (
        <div style={{ marginTop: 20, marginBottom: 20, width: "100%" }}>
            {
                t2TrackingActual?.output_detail_t2.map((data) => {
                    return (
                        <div key={data.id}>
                            <RenderAccordion
                                data={data}
                                status={t2TrackingActual.status}
                                expanded={expanded}
                                setExpanded={setExpanded} />
                        </div>
                    );
                })
            }
        </div>
    );
};

