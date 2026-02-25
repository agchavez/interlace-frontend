import { Box, Card, CardActionArea, CardContent, CardHeader, Chip, CircularProgress, Container, Divider, Grid, LinearProgress, MenuItem, Typography } from "@mui/material"
import TableDashboard from "../components/TableDashboard"
import { useEffect, useState } from "react"
import { StyledMenu } from "../../ui/components/StyledMenu"
import { GridFilterListIcon } from "@mui/x-data-grid"
import { DashboardCdQuery, DashboardCds, FilterDateDashboard } from "../../../interfaces/home"
import { useAppSelector } from "../../../store"
import { useGetDashboardCDQuery } from "../../../store/auth/authApi"
import { formatDuration } from "date-fns"
import { es } from "date-fns/locale"
import AccessTimeIcon from '@mui/icons-material/AccessTime';



const CardContentStyled = ({ row, isFetching, isLoading }: { row: DashboardCds, isLoading: boolean, isFetching: boolean }) => {
  const [open, setopen] = useState(false);
  return (
    <>
      <Card variant="elevation" elevation={3}>
        <CardActionArea onClick={() => setopen(!open)}>
          <CardHeader

            title={<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" component="h2" fontWeight={400} color="secondary ">
                {row.distributor_center}
              </Typography>
              <Typography variant="body1" component="h2" fontWeight={200} color="secondary">
                {row.user ? row.user : "--"}
              </Typography>
            </Box>}
            subheader={<Grid container spacing={3}>
              {/* T1 y TAT deshabilitados temporalmente */}
              {/* <Grid item xs={12} md={4}>
                <Typography variant="body1" component="h2" fontWeight={400} color="primary">
                  Unidades T1 atendidas
                </Typography>
                <Divider sx={{ backgroundColor: 'white' }} />
                <Typography variant="body1" component="h2" fontWeight={200} color="secondary">
                  {row.total_trackers}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body1" component="h2" fontWeight={400} color="primary">
                  En atención
                </Typography>
                <Divider sx={{ backgroundColor: 'secondary' }} />
                <Typography variant="body1" component="h2" fontWeight={200} color="secondary">
                  {row.edit_trackers}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body1" component="h2" fontWeight={400} color="primary">
                  TAT Promedio
                </Typography>
                <Divider sx={{ backgroundColor: 'secondary' }} />
                <Chip
                  label={
                    row.tat === 0 ? "--" : formatDuration(
                      {
                        hours: Math.floor(row?.tat / 3600),
                        minutes: Math.floor((row?.tat % 3600) / 60),
                      },
                      { locale: es, format: ['hours', 'minutes'], delimiter: ' y ' }
                    )
                  }
                  sx={{ marginTop: 1 }}
                  variant='outlined'
                  color="success"
                  size="small"
                  icon={
                    isLoading || isFetching ? <CircularProgress size={20} /> : <AccessTimeIcon />
                  }
                />
              </Grid> */}
            </Grid>}

          />
        </CardActionArea>
        <Box sx={{ display: open ? 'block' : 'none', transition: 'display 0.5s' }}>
          <CardContent>
            <TableDashboard
              data={row.edited_trackers}
            />
          </CardContent>
        </Box>
      </Card>
    </>
  )
}

const DashboardCdPage = () => {
  const { dashboardCDsQueryParams } = useAppSelector(state => state.ui)

  const [query, setQuery] = useState<DashboardCdQuery>(dashboardCDsQueryParams);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openFilter = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFilter = (date_range: FilterDateDashboard) => {
    setQuery({ ...query, date_range });
    setAnchorEl(null);
  };

  const { data, isLoading, isFetching, refetch } = useGetDashboardCDQuery(query);

  useEffect(() => {
    refetch()
  }, [query, refetch])
  return (
    <>
      <Container maxWidth="lg" sx={{ marginTop: 2 }}>
        
        <Grid container spacing={1}>

          <Grid item xs={12} justifyContent={"flex-end"} display={"flex"}>
            <Chip
              label={query.date_range === FilterDateDashboard.TODAY ? "Hoy" : query.date_range === FilterDateDashboard.WEEK ? "Esta semana" : query.date_range === FilterDateDashboard.MONTH ? "Este mes" : query.date_range === FilterDateDashboard.YEAR ? "Este año" : "Hoy"}
              variant='outlined'
              color="secondary"
              clickable
              onClick={handleClick}
              icon={
                isLoading || isFetching ? <CircularProgress size={20} /> : <GridFilterListIcon />
              }
            />
            <StyledMenu
              id="demo-customized-menu"
              MenuListProps={{
                'aria-labelledby': 'demo-customized-button',
              }}
              anchorEl={anchorEl}
              open={openFilter}
              onClose={handleClose}
            >
              <MenuItem onClick={() => handleFilter(FilterDateDashboard.TODAY)} >
                Hoy
              </MenuItem>
              <MenuItem onClick={() => handleFilter(FilterDateDashboard.WEEK)} >
                Esta semana
              </MenuItem>
              <MenuItem onClick={() => handleFilter(FilterDateDashboard.MONTH)} >
                Este mes
              </MenuItem>
              <MenuItem onClick={() => handleFilter(FilterDateDashboard.YEAR)} >
                Este año
              </MenuItem>

            </StyledMenu>
          </Grid>
          <Grid item xs={12} sx={ isLoading || isFetching ? { display: 'block' } : { display: 'none' }}>
          {
            
            <LinearProgress
            value={100}
          />}
          </Grid>

          {data?.map((row) => (
            <Grid item xs={12} sx={{ marginTop: 2 }} key={row.distributor_center}>
              <CardContentStyled row={row} isLoading={isLoading} isFetching={isFetching} />
            </Grid>

          ))}
        </Grid>
      </Container>


    </>
  )
}


export default DashboardCdPage
