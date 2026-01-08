import { Avatar, Box, Card, CardActionArea, CardHeader, Chip, CircularProgress, Container, Divider, Grid, IconButton, InputBase, Paper, Typography, useMediaQuery, useTheme, Badge, Button } from "@mui/material"
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import CleaningServicesTwoToneIcon from '@mui/icons-material/CleaningServicesTwoTone';
import NotificationsNoneTwoToneIcon from "@mui/icons-material/NotificationsNoneTwoTone";
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

import { useAppDispatch, useAppSelector } from "../../../store/store";
import masterApi from "../../../config/apiConfig";
import { NotificationDetail } from "../components/NotificationDetail";
import { iconsActionsNotifi } from "../../../utils/notificationsUtils";
import { updateMarckViewNoti } from "../../../store/auth";
import { Notificacion, NotificacionQuery } from "../../../interfaces/auth";
import { useGetNotificacionesQuery, useGetNotificacionQuery } from "../../../store/auth/authApi";

const validationSchema = Yup.object().shape({
  search: Yup.string().required('Campo requerido').min(3, 'Mínimo 3 caracteres'),
});
export const NotificationPage = () => {
  const theme = useTheme();
  const media = useMediaQuery('(max-width: 900px)');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  const [showDetailOnMobile, setShowDetailOnMobile] = useState(false);
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
    const resp = await masterApi.post<Notificacion>(`notification/${id}/mark_read/`, {}, {
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
      <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3 }, mb: 4, px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={0}>
          {/* Header */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <NotificationsActiveIcon
                fontSize="large"
                color="secondary"
                sx={{ fontSize: { xs: 32, sm: 40 } }}
              />
              <Typography
                variant={isMobile ? 'h6' : 'h4'}
                component="h1"
                fontWeight={400}
                color="secondary"
              >
                Notificaciones
              </Typography>
            </Box>
          </Grid>

          {/* Filter Chips */}
          <Grid item xs={12}>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 1,
                mb: 2,
                flexWrap: 'wrap',
              }}
            >
              <Chip
                label="Todas"
                color="primary"
                clickable
                variant={query.read === undefined ? 'filled' : 'outlined'}
                onClick={() => {
                  setquery({
                    ...query,
                    read: undefined,
                    offset: 0,
                  })
                  setlocalData([]);
                }}
                sx={{
                  minHeight: 36,
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  '&:hover': {
                    bgcolor: query.read === undefined ? 'primary.dark' : 'rgba(220, 187, 32, 0.08)',
                  },
                }}
              />
              <Chip
                label="Pendientes"
                color="primary"
                clickable
                variant={query.read === false ? 'filled' : 'outlined'}
                onClick={() => {
                  setquery({
                    ...query,
                    read: false,
                    offset: 0,
                  })
                  setlocalData([]);
                }}
                sx={{
                  minHeight: 36,
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  '&:hover': {
                    bgcolor: query.read === false ? 'primary.dark' : 'rgba(220, 187, 32, 0.08)',
                  },
                }}
              />
            </Box>
          </Grid>
          {/* Main Content Area */}
          <Grid
            item
            xs={12}
            sx={{
              backgroundColor: 'background.default',
              borderRadius: { xs: 0, sm: 2 },
              maxHeight: '74vh',
            }}
            paddingBottom={1}
            paddingX={{ xs: 0, sm: 2 }}
          >
            <Grid container spacing={{ xs: 0, sm: 2 }}>
              {/* Left Sidebar - Notifications List */}
              {!media || (media && !showDetailOnMobile) ? (
                <Grid item xs={12} md={4}>
                  <Box sx={{ pt: { xs: 1, sm: 1.5 } }}>
                    <Card elevation={2} sx={{ borderRadius: 2 }}>
                      {/* Search Box */}
                      <Box
                        sx={{
                          p: 2,
                          position: 'sticky',
                          top: 0,
                          zIndex: 1,
                          bgcolor: 'background.paper',
                          borderBottom: 1,
                          borderColor: 'divider',
                        }}
                      >
                        <form
                          onSubmit={handleSubmit((data) => {
                            setquery({
                              ...query,
                              search: data.search,
                              offset: 0,
                            })
                            setlocalData([]);
                          })}
                          noValidate
                          autoComplete="off"
                        >
                          <Paper
                            component="div"
                            elevation={0}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              border: 1,
                              borderColor: errors.search ? 'error.main' : 'divider',
                              borderRadius: 2,
                              transition: 'border-color 0.3s',
                              '&:hover': {
                                borderColor: errors.search ? 'error.main' : 'primary.main',
                              },
                            }}
                          >
                            <InputBase
                              sx={{
                                ml: 2,
                                flex: 1,
                                fontSize: '0.8125rem',
                              }}
                              placeholder="Buscar notificaciones..."
                              inputProps={{ 'aria-label': 'buscar notificaciones' }}
                              {...register('search')}
                              autoComplete="off"
                              onKeyUp={(e) => {
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
                                }
                              }}
                            />
                            <IconButton
                              type="submit"
                              sx={{ p: '10px' }}
                              aria-label="buscar"
                              onClick={handleSubmit((data) => {
                                setquery({
                                  ...query,
                                  search: data.search,
                                  offset: 0,
                                })
                                setlocalData([]);
                              })}
                              title="Buscar"
                            >
                              <SearchIcon />
                            </IconButton>
                            <Divider sx={{ height: 28 }} orientation="vertical" />
                            <IconButton
                              color="primary"
                              sx={{ p: '10px' }}
                              aria-label="limpiar"
                              onClick={() => {
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
                              <CleaningServicesTwoToneIcon sx={{ color: 'grey.700' }} />
                            </IconButton>
                          </Paper>
                          {errors.search?.message && (
                            <Typography
                              variant="caption"
                              color="error"
                              fontWeight={500}
                              sx={{ mt: 0.5, display: 'block', fontSize: '0.75rem' }}
                            >
                              {errors.search?.message}
                            </Typography>
                          )}
                        </form>
                      </Box>

                      {/* Notifications List */}
                      <Box
                        sx={{
                          overflowY: 'auto',
                          height: 'calc(74vh - 120px)',
                          scrollbarWidth: 'thin',
                        }}
                        onScroll={handleScroll}
                        component="div"
                      >
                        {localData.map((noti, index) => (
                          <Box key={noti.id}>
                            <Card
                              elevation={0}
                              sx={{
                                borderRadius: 0,
                                bgcolor: !noti.read
                                  ? 'rgba(220, 187, 32, 0.06)'
                                  : 'transparent',
                              }}
                            >
                              <CardActionArea
                                sx={{
                                  bgcolor:
                                    select?.id === noti.id
                                      ? 'rgba(220, 187, 32, 0.15)'
                                      : 'transparent',
                                  minHeight: 52,
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    bgcolor: 'rgba(220, 187, 32, 0.12)',
                                  },
                                }}
                                onClick={() => {
                                  setselect(noti);
                                  if (!noti.read) handleLeida(noti.id);
                                  if (media) setShowDetailOnMobile(true);
                                }}
                              >
                                <CardHeader
                                  avatar={
                                    <Badge
                                      variant="dot"
                                      color="primary"
                                      invisible={noti.read}
                                      sx={{
                                        '& .MuiBadge-badge': {
                                          width: 10,
                                          height: 10,
                                          borderRadius: '50%',
                                        },
                                      }}
                                    >
                                      <Avatar
                                        aria-label="notification"
                                        sx={{
                                          bgcolor: !noti.read ? 'primary.main' : 'grey.400',
                                          width: 40,
                                          height: 40,
                                        }}
                                      >
                                        {iconsActionsNotifi[noti.module]?.[noti.type] || (
                                          <NotificationsIcon />
                                        )}
                                      </Avatar>
                                    </Badge>
                                  }
                                  title={
                                    <Typography
                                      variant="body2"
                                      color="secondary"
                                      fontWeight={!noti.read ? 600 : 500}
                                      sx={{
                                        fontSize: '0.8125rem',
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      {noti.title}
                                    </Typography>
                                  }
                                  subheader={
                                    <Box>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        fontWeight={300}
                                        sx={{
                                          fontSize: '0.8125rem',
                                          lineHeight: 1.3,
                                          mb: 0.5,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          display: '-webkit-box',
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: 'vertical',
                                        }}
                                      >
                                        {noti.subtitle}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ fontSize: '0.75rem' }}
                                      >
                                        {formatDistanceToNow(new Date(noti?.created_at), {
                                          addSuffix: true,
                                          locale: es,
                                          includeSeconds: false,
                                        })}
                                      </Typography>
                                    </Box>
                                  }
                                  sx={{ py: 1.5 }}
                                />
                              </CardActionArea>
                            </Card>
                            {index < localData.length - 1 && <Divider />}
                          </Box>
                        ))}

                        {/* Empty State */}
                        {localData.length === 0 && !isLoading && !isFetching && (
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              height: '100%',
                              py: 8,
                              px: 3,
                            }}
                          >
                            <NotificationsNoneTwoToneIcon
                              sx={{
                                fontSize: 80,
                                color: 'text.disabled',
                                mb: 2,
                                opacity: 0.5,
                              }}
                            />
                            <Typography
                              variant="h6"
                              component="h2"
                              fontWeight={500}
                              color="text.secondary"
                              align="center"
                              sx={{ mb: 1 }}
                            >
                              No hay notificaciones
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              align="center"
                              sx={{ fontSize: '0.8125rem' }}
                            >
                              {query.search
                                ? 'No se encontraron resultados'
                                : 'Te mantendremos informado cuando algo importante suceda'}
                            </Typography>
                          </Box>
                        )}

                        {/* Loading Indicator */}
                        {(isLoading || isFetching) && (
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              py: 3,
                            }}
                          >
                            <CircularProgress color="primary" size={30} />
                          </Box>
                        )}
                      </Box>
                    </Card>
                  </Box>
                </Grid>
              ) : null}
              {/* Right Panel - Notification Detail */}
              {(!media || (media && showDetailOnMobile)) && (
                <Grid item xs={12} md={8}>
                  <Box sx={{ pt: { xs: 1, sm: 1.5 } }}>
                    <Card
                      elevation={2}
                      sx={{
                        height: { xs: 'auto', md: '71vh' },
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      {/* Botón volver en móvil */}
                      {media && showDetailOnMobile && (
                        <Box
                          sx={{
                            p: 2,
                            borderBottom: 1,
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                          }}
                        >
                          <Button
                            startIcon={<NavigateBeforeIcon />}
                            onClick={() => setShowDetailOnMobile(false)}
                            sx={{
                              minHeight: 48,
                              fontSize: '0.8125rem',
                              fontWeight: 600,
                            }}
                          >
                            Volver a la lista
                          </Button>
                        </Box>
                      )}
                      <Box
                        sx={{
                          height: { xs: 'auto', md: '70vh' },
                          overflowY: 'auto',
                          scrollbarWidth: 'thin',
                        }}
                      >
                        {select ? (
                          <NotificationDetail select={select} />
                        ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            minHeight: { xs: 300, md: '70vh' },
                            py: 8,
                            px: 3,
                          }}
                        >
                          <NotificationsIcon
                            sx={{
                              fontSize: 100,
                              color: 'text.disabled',
                              mb: 3,
                              opacity: 0.3,
                            }}
                          />
                          <Typography
                            variant="h5"
                            component="h2"
                            fontWeight={500}
                            color="text.secondary"
                            align="center"
                            sx={{ mb: 1.5 }}
                          >
                            Selecciona una notificación
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            align="center"
                            sx={{
                              fontSize: '0.8125rem',
                              maxWidth: 400,
                            }}
                          >
                            Haz clic en cualquier notificación de la lista para ver sus detalles completos aquí
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Card>
                </Box>
              </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default NotificationPage