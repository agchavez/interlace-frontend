import { FC, useEffect, useState } from "react";
import { DriverQuerySearch } from "../../../interfaces/maintenance";
import { useGetDriverQuery } from "../../../store/maintenance/maintenanceApi";
import { Typography } from "@mui/material";

interface ShowCodeDriverProps {
    driverId: number | undefined;
}

export const ShowCodeDriver:FC<ShowCodeDriverProps> = ({driverId}) => {
    const [query, setQuery] = useState<DriverQuerySearch>({
        limit: 10,
        offset: 0,
        search: "",
        id: driverId
      });
      
      const {
        data,
        refetch
      } = useGetDriverQuery(query);
    
      useEffect(() => {
        if (driverId){
            setQuery({
                ...query,
                id: driverId
              });
          refetch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [driverId]);
    
    
  return (
    <>
        <Typography variant="h6" component="h6" sx={{color:"text.secondary"}}>{data?.results[0]?.sap_code}</Typography>
    </>
  )
}
