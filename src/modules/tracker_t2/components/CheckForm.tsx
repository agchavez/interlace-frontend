import React, { FC, useRef, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
    Grid,
    Paper,
    IconButton,
    InputBase,
    Box
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { useAppSelector } from '../../../store/store';
import { OutputDetailT2, OutputDetailT2Detail, DatesT2Tracking } from '../../../interfaces/trackingT2';
import { useGetDatesT2TrackingQuery } from "../../../store/seguimiento/trackerApi";
import { format } from "date-fns";
import { CircularProgress } from '@mui/material';
import { useForm } from "react-hook-form";

// Función para manejar el cambio de expansión del acordeón
const handleChange = (panel: number, expanded: number | false, setExpanded: React.Dispatch<React.SetStateAction<number | false>>) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
};

interface renderCheckFormProps {
    data: OutputDetailT2;
    expanded: number | false
    setExpanded: React.Dispatch<React.SetStateAction<number | false>>

}

const quantity = (data: OutputDetailT2Detail[]): number => {
    let total = 0;
    data.forEach((element) => {
        total += element.quantity;
    });
    return total;
};

// Función para renderizar el contenido del acordeón
const RenderAccordion: FC<renderCheckFormProps> = ({ data, expanded, setExpanded }) => {
    const { data: datesData, isLoading, isFetching } = useGetDatesT2TrackingQuery(data.product.toString(), { refetchOnMountOrArgChange: true });

    return (
        <Accordion expanded={expanded === data.id} onChange={handleChange(data.id, expanded, setExpanded)} sx={{ marginBottom: '10px', marginTop: '10px' }}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${data.id}bh-content`}
                id={`${data.id}bh-header`}
            >
                <Typography sx={{ width: '90%', flexShrink: 0 }}>
                    {data.product_sap_code + ' - ' + data.product_name}
                </Typography>
                <Typography sx={{ color: quantity(data.details) === +data.quantity ? 'green' : 'red' }}>
                    {quantity(data.details)} de {data.quantity}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={2}>
                    {
                        isLoading || isFetching ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                            <CircularProgress />
                        </Box> : null
                    }
                    {
                        datesData?.results.map((date) => {
                            return (
                                <RenderDateContent data={date} selected={data.details} />
                            );
                        })
                    }
                </Grid>
            </AccordionDetails>
        </Accordion>
    );
};

interface RenderCheckProps {
    data: DatesT2Tracking;
    selected: OutputDetailT2Detail[];
}
// Función para renderizar el contenido de la fecha
const RenderDateContent: FC<RenderCheckProps> = ({ data, selected }) => {
    const isSelected = selected.filter((element) => element.expiration_date === data.expiration_date);
    const { register, setFocus, setValue } = useForm<{ quantity: number | null }>({
        defaultValues: {
            quantity: isSelected.length > 0 ? isSelected[0].quantity : null
        }
    });

    const [check, setCheck] = useState<boolean>(isSelected.length > 0 ? true : false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handlClick = () => {
        setCheck(!check);
        if (!check) {
            setFocus('quantity');
            setValue('quantity', data.total);
            inputRef.current?.select();
        } else {
            setValue('quantity', null);
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
                        format(new Date(data.expiration_date), 'dd/MM/yyyy')
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
                    <InputBase
                        disabled={!check}
                        sx={{ ml: 1, flex: 1 }}
                        placeholder={data.total.toString()}
                        inputProps={{ 'aria-label': 'search google maps' }}
                        type="number"
                        autoComplete="off"
                        onFocus={(e) => e.target.select()}
                        {...register("quantity", { required: true, min: 0, max: data.total })}
                        inputRef={(el) => (inputRef.current = el)}

                    />
                    <Typography>
                        de {data.total}
                    </Typography>
                    <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions">
                        <ExpandMoreIcon />
                    </IconButton>
                </Box>
            </Paper>
        </Grid>
    );
};

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
                            <RenderAccordion data={data} expanded={expanded} setExpanded={setExpanded} />
                        </div>
                    );
                })
            }
        </div>
    );
};

