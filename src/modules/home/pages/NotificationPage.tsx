import { Avatar, Box, Card, CardActionArea, CardHeader, Chip, CircularProgress, Container, Divider, Grid, IconButton, InputBase, Paper, Typography, useMediaQuery } from "@mui/material"
import {useSearchParams } from "react-router-dom";
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import masterApi from "../../../config/apiConfig";
import { NotificationDetail } from "../components/NotificationDetail";
import { useForm } from "react-hook-form";
import SearchIcon from '@mui/icons-material/Search';
import CleaningServicesTwoToneIcon from '@mui/icons-material/CleaningServicesTwoTone';

import * as Yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { iconsActionsNotifi } from "../../../utils/notificationsUtils";
import {updateMarckViewNoti} from "../../../store/auth";
import {Notificacion, NotificacionQuery} from "../../../interfaces/auth";
import {useGetNotificacionesQuery, useGetNotificacionQuery} from "../../../store/auth/authApi.ts";
import NotificationsNoneTwoToneIcon from "@mui/icons-material/NotificationsNoneTwoTone";

const validationSchema = Yup.object().shape({
  search: Yup.string().required('Campo requerido').min(3, 'Mínimo 3 caracteres'),
});
export const NotificationPage = () => {
  const media = useMediaQuery('(max-width: 900px)');
  const [getSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector(state => state.auth);
  const [localData, setlocalData] = useState<Notificacion[]>([]);
  const [atEndOfScroll, setAtEndOfScroll] = useState(false);
  const [idQueryParams, setidQueryParams] = useState(0);
  const {register, handleSubmit,formState: {errors}, setValue } = useForm<{search: string}>({
    resolver: yupResolver(validationSchema),
  });
  const [query, setquery] = useState<NotificacionQuery>({
    limit: 15,
    offset: 0,
    user: user?.id || 0,
    search: '',
    read: false,
  })

  const [select, setselect] = useState<Notificacion | null>(null);
  const { data, isFetching, isLoading } = useGetNotificacionesQuery(query);
  const idNotificacion = getSearchParams.get('id');
  const { data: dataNoti, refetch: refreshGet } = useGetNotificacionQuery(idQueryParams, {
    skip: idQueryParams === 0,
  });

  useEffect(() => {
    if (idNotificacion) {
      setidQueryParams(Number(idNotificacion));
    }
  }, [idNotificacion]);
  
  useEffect(() => {
    if (dataNoti) {
      setselect(dataNoti);
    }
  }, [dataNoti]);

  useEffect(() => {
    if (refreshGet && idQueryParams) {
      refreshGet();
    }
  }, [idQueryParams, refreshGet]);
  // marcar como leida
  const handleLeida = async (id: number) => {
    const resp = await masterApi.post<Notificacion>(`notificacion/${id}/marcar_read/`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    // Actualizar el estado de la notificación de la lista local
    setlocalData(localData.map((noti) => {
      if (noti.id === resp.data.id) {
        return {
          ...noti,
          read: true,
        };
      }
      return noti;
    }));
    dispatch(updateMarckViewNoti(resp.data.id));
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const bottom = target.scrollHeight - target.scrollTop === target.clientHeight;
    
    if (bottom) {
      setAtEndOfScroll(true);
    } else {
      setAtEndOfScroll(false);
    }
  };


  useEffect(() => {
    const limit = query.limit || 15;
    const offset = query.offset || 0;
    if (!data?.count) return;
    if (atEndOfScroll && !isFetching && offset < data?.count) {
      setquery({
        ...query,
        offset: offset + limit,
      })
    }
    // eslint-disable-next-line
  }, [atEndOfScroll]);

  useEffect(() => {
    if (data) {
      // solo concatena los datos con id diferente
      setlocalData((prev) => {
        const ids = prev.map((noti) => noti.id);
        return [
          ...prev,
          ...data.results.filter((noti) => !ids.includes(noti.id))
        ];
      });
    }
  }, [data]);

  return (
    <>
      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        <Grid container spacing={0}>
          <Grid item xs={12} >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <NotificationsNoneTwoToneIcon fontSize="large" style={{ marginRight: '5px' }} color="secondary" className="base__header-title-icon" />
              <Typography
                variant="h4"
                component="h1"
                fontWeight={400}
                color={'secondary'}
              >
                Notificaciones
              </Typography>
            </div>

          </Grid>
          <Grid item xs={12} >
            <Divider />
            <Box mt={3} mb={1} display="flex" justifyContent="flex-start" alignItems="center">
              <Chip
                label="Todas"
                color="primary"
                clickable
                style={{ marginRight: '5px' }}
                variant={query.read === undefined ? 'filled' : 'outlined'}
                onClick={() => {
                  setquery({
                    ...query,
                    read: undefined,
                    offset: 0,
                  })
                  setlocalData([]);
                }}
              />
              <Chip
                label="Pendientes"
                color="primary" 
                clickable
                style={{ marginRight: '5px' }}
                variant={query.read === false ?  'filled' : 'outlined'}
                onClick={() => {
                  setquery({
                    ...query,
                    read: false,
                    offset: 0,
                  })
                  setlocalData([]);
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sx={{
            backgroundColor: '#f4f6f8',
            maxHeight: '74vh',
          }}
                paddingBottom={1}
            paddingX={2}
          >
            <Grid container spacing={2}>
              {
                !media ? (
                  <Grid item xs={12} md={4}>
                    <div
                      style={{
                        paddingTop: '10px',
                        
                      }}
                      onScroll={handleScroll}
                    >
                      
                      <Card elevation={0}>
                        <Box p={1} sx={{
                          position: 'sticky',
                          top: 0,
                          zIndex: 1,
                        }}
                          
                        >
                     
                      <form onSubmit={handleSubmit((data) => {
                        setquery({
                          ...query,
                          search: data.search,
                          offset: 0,
                        })
                        setlocalData([]);
                      })} noValidate autoComplete="off">
                      <Paper
                          component="form"
                          sx={{ display: 'flex', alignItems: 'center', width: '100%'}}
                          style={
                            errors.search ? {border: '1px solid #f44336'} : {}
                          }
                        >
                          <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            placeholder='Buscar...'
                            inputProps={{ 'aria-label': 'search google maps' }}
                            {...register('search')}
                            autoComplete="off"
                            
                            onKeyUp={(e) =>{
                              e.preventDefault();
                              if (e.key === 'Enter') {
                              handleSubmit((data) => {
                              setquery({
                                ...query,
                                search: data.search,
                                offset: 0,
                              })
                              setlocalData([]);
                            })();
                          }}}
                          />
                          <IconButton type="submit" sx={{ p: '10px' }} aria-label="search" onClick={handleSubmit((data) => {
                            setquery({
                              ...query,
                              search: data.search,
                              offset: 0,
                            })
                            setlocalData([]);
                          }
                          )}
                          title="Buscar"
                          >
                            <SearchIcon />
                          </IconButton>
                          <Divider sx={{ height: 28 }} orientation="vertical" />
                          <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions" onClick={() => {
                            setquery({
                              ...query,
                              search: '',
                              offset: 0,
                            })
                            setValue('search', '');
                            setlocalData([]);
                          }}
                          title="Limpiar búsqueda"
                          >
                            <CleaningServicesTwoToneIcon
                              sx={{ color: 'grey.700' }}
                            />
                          </IconButton>
                        </Paper>
                        <Typography variant="caption" color="error" fontWeight={500} mt={0}>
                          {errors.search?.message}
                        </Typography>
                      </form>
                      </Box>
                      <Box p={1} sx={{
                        overflowY: 'auto',
                        height: 'calc(74vh - 90px)',
                        scrollbarWidth: 'none',
                      
                      }}
                      
                      onScroll={handleScroll}
                          component={'div'}>
                        {localData.map((noti) => (
                            <Box mb={'3px'} key={noti.id}>
                            <Card elevation={0}>
                              <CardActionArea
                                sx={{
                                  bgcolor: select?.id === noti.id ? 'grey.300' : 'background.paper',
                                  // animation al seleccionar
                                  transition: 'background-color 0.3s',
                                  animation: 'none',
                                }}
                                onClick={() => {
                                  setselect(noti);
                                  if (!noti.read) handleLeida(noti.id);
                                }}
                              >
                                <CardHeader
                                  avatar={
                                    <Avatar aria-label="recipe">
                                      {iconsActionsNotifi[noti.module]?.[noti.type] || <NotificationsIcon />}
                                    </Avatar>
                                  }
                                  title={<Typography variant="subtitle1" color="secondary" fontWeight={500}>{noti.title}</Typography>}
                                  subheader={
                                    <>
                                    <Typography variant="subtitle1" color="secondary" fontWeight={300}>{noti.subtitle}</Typography>
                                    <Typography variant="subtitle2" color="text.secondary" display={'flex'} justifyContent={'space-between'} fontWeight={300}> 
                                      {formatDistanceToNow(
                                        new Date(noti?.created_at),
                                        { addSuffix: true, locale: es, includeSeconds: false }
                                        )}
                                      {!noti.read && (
                                        <Box
                                        component="span"
                                        sx={{
                                          bgcolor: 'primary.main',
                                          borderRadius: '50%',
                                          width: 10,
                                          height: 10,
                                        }}
                                        ></Box>
                                        )}
                                    </Typography>
                                        </>
                                  }
                                />
                              </CardActionArea>
                            </Card>
                          </Box>
                        ))}
                        {
                          localData.length === 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                              <Typography variant="h6" component="h1" fontWeight={400} color="textSecondary">
                                No hay notificaciones para mostrar
                              </Typography>
                            </Box>
                          )
                         }
                        {(isLoading || isFetching) && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <CircularProgress color="primary" size={30} />
                          </Box>
                        )}
                        </Box>
                        {/* {atEndOfScroll && fetchData()} */}
                      </Card>
                    </div>
                  </Grid>

                ) : null
              }
              <Grid item xs={12} md={8} >
              <Card style={{
                  marginTop: '10px',
                  height: '71vh',
                }}
                  elevation={0}
                >
                <Box sx={{
                height: '70vh',
                overflowY: 'auto',
                scrollbarWidth: 'none',
              }}>
                
                  {select ? 
                  <NotificationDetail select={select} />
                  :
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="h6" component="h1" fontWeight={400} color="textSecondary">
                        Selecciona una notificación
                      </Typography>
                    </Box>
                  
                  }

                </Box>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container >


    </>
  )
}

export default NotificationPage