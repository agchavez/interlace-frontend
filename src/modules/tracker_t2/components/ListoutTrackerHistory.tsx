import { FC } from 'react';
import { DetailDetail } from '../../../interfaces/trackingT2';
import { TableCell, TableRow } from '@mui/material';
interface Props {
  detail: DetailDetail;
}
export const ListoutTrackerHistory: FC<Props> = ({ detail }) => {
  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
       
        <TableCell component="th" scope="row" align="right">
          {/* el codigo tiene que tener 5 digitos se pueden poner 00000 si solo es 1  */}
          TRK-{detail.tracker_detail.toString().padStart(5, "0")}
        </TableCell>
        <TableCell align="right">
          {detail.quantity}
        </TableCell>
        <TableCell align="right">
          {detail.id}
        </TableCell>
        <TableCell align="right"></TableCell>
      </TableRow>
    </>
  )
}
