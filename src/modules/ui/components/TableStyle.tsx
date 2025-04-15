
import { styled } from '@mui/material/styles';

import TableCell, { tableCellClasses } from '@mui/material/TableCell';

import TableRow from '@mui/material/TableRow';


export const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        color: theme.palette.common.black,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

export const StyledTableRow = styled(TableRow)(() => ({
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export const StyledTableCellDetail = styled(TableCell)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    width: '50%',
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));
