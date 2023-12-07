import { FC, Fragment, useState } from 'react';
import { Box, Collapse, Grid, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { OutputDetailT2Detail } from '../../../interfaces/trackingT2';
import { StyledTableCell } from '../../tracker/components/CheckForm';
import { ListoutTrackerHistory } from './ListoutTrackerHistory';

interface ListOutTrackerRowProps {
  total_quantity: number;
  detail: OutputDetailT2Detail;
  index: number;
}

export const ListOutTrackerRow: FC<ListOutTrackerRowProps> = ({ total_quantity, detail, index }) => {
  const [open, setOpen] = useState(false);

  const handleToggleRow = () => {
    setOpen(!open);
  };

  return (
    <Fragment key={index}>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={handleToggleRow}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" align="right">
          {detail.expiration_date.toString()}
        </TableCell>
        <TableCell align="right">{detail.quantity}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Tracker
              </Typography>
              <Grid
                item
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 1,
                  marginBottom: 1,
                }}
                xs={12}
              >
                <Typography variant="body1" component="h1" fontWeight={400}>
                  Total de Cajas: {"  "}
                  {detail.quantity} {"  "}
                  de {total_quantity}
                </Typography>
              </Grid>
              <Grid item xs={12} md={5} lg={2} xl={2}></Grid>

              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell align="right">Tracker</TableCell>
                    {<TableCell align="right">Cajas</TableCell>}

                    <TableCell align="right">ID</TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>

                  {
                    detail.details.map((detail, index) => (

                      <ListoutTrackerHistory detail={detail} key={index} />
                    ))
                  }
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
};


interface ListOutTrackerDetailProps {
  total_quantity: number;
  data: OutputDetailT2Detail[];
}

export const ListOutTrackerDetail: FC<ListOutTrackerDetailProps> = ({ total_quantity, data }) => {
  return (
    <Table size="small" aria-label="a dense table">
      <TableHead>
        <TableRow>
          <StyledTableCell>Detalle</StyledTableCell>
          <StyledTableCell align="right">Fecha de vencimiento</StyledTableCell>
          <StyledTableCell align="right">Cant. de cajas</StyledTableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((detail, index) => (
          <ListOutTrackerRow key={index} total_quantity={total_quantity} detail={detail} index={index} />
        ))}
      </TableBody>
    </Table>
  );
};



