import { Divider, Grid, Typography } from "@mui/material"
import { FC, useEffect, useState } from "react"
import { useGetRouteQuery } from "../../../store/maintenance/maintenanceApi"
import { RouteQuerySearch } from '../../../interfaces/maintenance';
import EastTwoToneIcon from '@mui/icons-material/EastTwoTone';

interface ShowRouteProps {
    distributorCenterId: number
    locationId: number
}
export const ShowRoute: FC<ShowRouteProps> = ({ distributorCenterId, locationId }) => {
    const [query, setquery] = useState<RouteQuerySearch>({
        limit: 1,
        offset: 0,
        distributor_center: distributorCenterId

    })
    const {
        data, isFetching, isLoading, isError, error, isSuccess, refetch
    } = useGetRouteQuery(query, {
        skip: !distributorCenterId || !locationId
    });

    useEffect(() => {
        setquery((query) => ({
            ...query,
            distributorCenter: distributorCenterId,
            location: locationId
        }))
    }, [distributorCenterId, locationId])

    useEffect(() => {
        if (query.distributor_center && query.location) {
            refetch()
        }
    }, [refetch, query.distributor_center, query.location])


    if (data?.count === 0 || locationId === null || distributorCenterId === null || isFetching || isLoading || isError || error || !isSuccess) {
        return <>
        </>
    }
    return (
        <>
            <Grid container>
                <Grid item xs={12}>
                    <Divider>
                        <Typography variant="body2" align="center" alignContent="center">
                            Ruta: {data?.results[0].code}
                        </Typography>
                    </Divider>
                </Grid>
                <Grid item xs={5}>
                    <Typography variant="body2">
                        {data?.results[0].distributor_center_name}
                    </Typography>
                </Grid>
                <Grid item xs={2}>
                    <EastTwoToneIcon />
                </Grid>
                <Grid item xs={5}>
                    <Typography variant="body2">
                        {data?.results[0].location_name}
                    </Typography>
                </Grid>
            </Grid>
        </>
    )
}
