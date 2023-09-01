import { Container, Typography, Grid, Divider, Box, Tabs, Tab, Button } from '@mui/material';
import { useState } from 'react';
import { CheckForm } from '../components/CheckForm';
import CreateCheckModal from '../components/CrearSeguimientoModal';
import PostAddTwoToneIcon from '@mui/icons-material/PostAddTwoTone';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setSeguimientoActual } from '../../../store/seguimiento/seguimientoSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}


function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export const CheckPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [value, setValue] = useState(0);
  const { seguimientos } = useAppSelector(state => state.seguimiento)
  const dispatch = useAppDispatch()
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
  }

  return (
    <>
      <CreateCheckModal open={showCreateModal} handleClose={handleCloseCreateModal} />
      <Container maxWidth="xl">
        <Grid container spacing={1} sx={{ marginTop: 2 }}>
          <Grid item xs={12}>
            <Typography variant="h5" component="h1" fontWeight={400}>
              Seguimiento
            </Typography>
            <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
          </Grid>
          <Grid item xs={12} md={8} lg={9} xl={10}>
          </Grid>
          <Grid item xs={12} md={4} lg={3} xl={2}
            style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              fullWidth
              startIcon={<PostAddTwoToneIcon color="inherit" fontSize="small" />}
              onClick={() => setShowCreateModal(true)}
            >
              <Typography variant="body2" component="span" fontWeight={400} color={'gray.700'}>
                Nueva rastra
              </Typography>
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                  {
                    seguimientos.map((seguimiento) => {
                      return (
                        <Tab label={seguimiento.rastra.placa} {...a11yProps(seguimiento.id)} onClick={()=>dispatch(setSeguimientoActual(seguimiento.id))}/>
                      )
                    })
                  }
                </Tabs>
              </Box>
              {
                seguimientos.map((seguimiento, index) => {
                  return (
                    <CustomTabPanel value={value} index={index}>
                      <CheckForm seguimiento={seguimiento}/>
                    </CustomTabPanel>
                  )
                })
              }
            </Box>
          </Grid>
        </Grid>
      </Container>

    </>
  )
}
