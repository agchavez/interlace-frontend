import { Container, Divider, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, styled, tableCellClasses } from "@mui/material"

export const ViewTrackerPage = () => {
    return (
        <>
            <Container maxWidth="xl" sx={{ marginTop: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                            <Typography variant="h5" component="h1" fontWeight={400}>
                                Vista de Trackers
                            </Typography>
                            <Typography variant="body1" component="p" fontWeight={200}>
                                DH01 - CD LA GRANJA
                            </Typography>
                        </div>
                        <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Divider>
                            <Typography variant="h6" component="h2" fontWeight={400}>
                                ENTRADAS
                            </Typography>
                        </Divider>
                        <CustomizedTables />

                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Divider>
                            <Typography variant="h6" component="h2" fontWeight={400}>
                                SALIDAS
                            </Typography>
                        </Divider>
                    </Grid>
                </Grid>
            </Container>
        </>
    )
}


const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export function CustomizedTables() {
    return (
        <TableContainer component={Paper}>
            <Table sx={{ }} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell align="left"># Tracking</StyledTableCell>
                        <StyledTableCell align="left">Codigo SAP</StyledTableCell>
                        <StyledTableCell align="left">Producto</StyledTableCell>
                        <StyledTableCell align="left">Pallets</StyledTableCell>
                        <StyledTableCell align="left">Fecha</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {/* {rows.map((row) => ( */}
                    <StyledTableRow >

                        <StyledTableCell align="left">
                            TRK-00062
                        </StyledTableCell>
                        <StyledTableCell align="left">
                            17365
                        </StyledTableCell>
                        <StyledTableCell component="th" scope="row">
                            COCA COLA SABOR ORIGINAL EIN 1.25LT VR
                        </StyledTableCell>
                        <StyledTableCell align="left">
                            10
                        </StyledTableCell>
                        <StyledTableCell align="left">
                            20/10/2024
                        </StyledTableCell>

                    </StyledTableRow>
                    {/* ))} */}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export function CustomizedTablesOut() {
    return (
        <TableContainer component={Paper}>
            <Table sx={{ }} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell align="left"># Tracking</StyledTableCell>
                        <StyledTableCell align="left">Codigo SAP</StyledTableCell>
                        <StyledTableCell align="left">Producto</StyledTableCell>
                        <StyledTableCell align="left">Pallets</StyledTableCell>
                        <StyledTableCell align="left">Fecha</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {/* {rows.map((row) => ( */}
                    <StyledTableRow >

                        <StyledTableCell align="left">
                            TRK-00062
                        </StyledTableCell>
                        <StyledTableCell align="left">
                            17365
                        </StyledTableCell>
                        <StyledTableCell component="th" scope="row">
                            COCA COLA SABOR ORIGINAL EIN 1.25LT VR
                        </StyledTableCell>
                        <StyledTableCell align="left">
                            10
                        </StyledTableCell>
                        <StyledTableCell align="left">
                            20/10/2024
                        </StyledTableCell>

                    </StyledTableRow>
                    {/* ))} */}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default ViewTrackerPage;