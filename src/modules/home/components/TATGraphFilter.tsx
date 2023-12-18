import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MultipleSelectChip from "../../inventory/components/MultipleSelectChip";
import { FormControl, Grid, InputLabel, Select } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../store";
import { setGraphQueryParams } from "../../../store/ui/uiSlice";

export default function TATGraphFilter() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const dispatch = useAppDispatch()
  const {year, actualYear, distributor_center, encountered} = useAppSelector(state => state.ui.graphQueryParams)
  const {disctributionCenters} = useAppSelector(state => state.maintenance)
  const {graphQueryParams} = useAppSelector(state => state.ui)
  const {user} = useAppSelector(state => state.auth)
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const setyear = (year: number) => {
    dispatch(setGraphQueryParams({...graphQueryParams, year: year}))
  }

  const setDistributorCenter = (data: number[])=>{
      dispatch(setGraphQueryParams({...graphQueryParams, distributor_center: data.map(dc=>dc.toString())}))
  }

  React.useEffect(()=>{
    if(!encountered) {
        const cd = user?.centro_distribucion
        if (cd) {
            setDistributorCenter([cd])
        } else {
            setDistributorCenter(disctributionCenters.map(dc=>dc.id))
        }
    } 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disctributionCenters, user?.centro_distribucion,])



  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        Filtrar
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {
            !user?.centro_distribucion &&
            <MenuItem sx={{width: "100%"}}>
                <Grid container>
                    <Grid item xs={12}>
                        <MultipleSelectChip
                            options={disctributionCenters.map(dc => ({text: dc.name, value: dc.id.toString()}))}
                            label="DC"
                            value={distributor_center||[]}
                            changeEventAction={(dc:string[])=>setDistributorCenter(dc.map(dc=>parseInt(dc)))}
                        />
                    </Grid>
                </Grid>
            </MenuItem>
        }
        <MenuItem>
          <FormControl margin="dense" size="small" variant="outlined">
            <InputLabel
              id="role-label"
              component="legend"
              style={{ marginBottom: 5 }}
            >
              Año
            </InputLabel>
            <Select
              labelId="role-label"
              id="year"
              label="Año"
              value={year}
              onChange={(e) => setyear(parseInt(e.target.value.toString()))}
            >
              {
                // año desde 2022 asta el año actual
                Array.from(
                  { length: actualYear - 2021 },
                  (_, i) => i + 2022
                ).map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </MenuItem>
      </Menu>
    </div>
  );
}
