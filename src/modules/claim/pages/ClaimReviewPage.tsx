import {
  Button,
  Container,
  Divider,
  Grid,
  Typography,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import FilterListTwoToneIcon from "@mui/icons-material/FilterListTwoTone";
import {
  ClaimQueryParams,
  useGetClaimsQuery,
  useGetClaimTypesQuery,
} from "../../../store/claim/claimApi";
import { useAppSelector } from "../../../store";
import { setClaimQueryParams } from "../../../store/ui/uiSlice";
import { useAppDispatch } from "../../../store/store";
import ChipFilterCategory from "../../ui/components/ChipFilter";
import { ClaimsFilter } from "../components/ClaimsFilter";
import { format } from "date-fns";
import { LocalShippingOutlined } from "@mui/icons-material";
import PublicTwoToneIcon from "@mui/icons-material/PublicTwoTone";
import ClaimsDataGrid from "../components/ClaimsDataGrid";
import { Navigate } from "react-router-dom";

function a11yProps(index: number) {
  return {
    id: `claim-tab-${index}`,
    "aria-controls": `claim-tabpanel-${index}`,
  };
}

export function ClaimReviewPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { claimQueryParams } = useAppSelector((state) => state.ui);
  const { disctributionCenters } = useAppSelector((state) => state.maintenance);

  const {canViewPage, enableImport, enableLocal} = useMemo(() => {
    const resp = {canViewPage: false, enableImport: false, enableLocal: false};
    if (!user) return resp;
    const canViewClaimsPermission = user?.list_permissions.includes("imported.view_claimmodel");
    if (!canViewClaimsPermission) return resp;
    const canChangeStatusClaimImport = user.list_permissions.includes("imported.change_status_claimmodel");
    const canChangeStatusClaimLocal = user.list_permissions.includes("imported.change_status_claimmodelLocal");
    if (!(canChangeStatusClaimImport || canChangeStatusClaimLocal)) return resp;
    return {canViewPage: true, enableImport: canChangeStatusClaimImport, enableLocal: canChangeStatusClaimLocal};
  }, [user]);

  const [tabValue, setTabValue] = useState(()=>{
    if (enableImport && !enableLocal) {
      return 1;
    } else if (enableLocal && !enableImport) {
      return 0;
    }
    return 0;
  });
  const { data, isLoading, isFetching, refetch } =
    useGetClaimsQuery(claimQueryParams);

  useEffect(() => {
    refetch();
  }, [claimQueryParams, refetch]);

  const handleFilter = (filterData: ClaimQueryParams) => {
    const queryProcess: ClaimQueryParams = {
      ...claimQueryParams,
      search: filterData.search || "",
      tipo: filterData.tipo,
      status: filterData.status,
      distributor_center: filterData.distributor_center
        ? filterData.distributor_center
        : [],
      date_after: filterData.date_after || "",
      date_before: filterData.date_before || "",
      id: filterData.id || undefined,
      claim_type: tabValue === 0 ? "LOCAL" : "IMPORT",
    };
    dispatch(setClaimQueryParams(queryProcess));
  };

  const [openFilter, setOpenFilter] = useState(false);

  const {data: claimTypes} = useGetClaimTypesQuery({});

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    dispatch(
      setClaimQueryParams({
        ...claimQueryParams,
        claim_type: newValue === 0 ? "LOCAL" : "IMPORT",
      })
    );
  };

  const dateFilterItems = useMemo(() => {
    const dateFilterItems = [];
    if (claimQueryParams.date_after) {
      dateFilterItems.push({
        label: `Mayor que: ${
          claimQueryParams.date_after &&
          format(new Date(claimQueryParams.date_after), "dd/MM/yyyy")
        }`,
        id: "date_after",
        deleteAction: () =>
          dispatch(
            setClaimQueryParams({ ...claimQueryParams, date_after: "" })
          ),
      });
    }
    if (claimQueryParams.date_before) {
      dateFilterItems.push({
        label: `Menor que: ${
          claimQueryParams.date_before &&
          format(new Date(claimQueryParams.date_before), "dd/MM/yyyy")
        }`,
        id: "date_before",
        deleteAction: () =>
          dispatch(
            setClaimQueryParams({ ...claimQueryParams, date_before: "" })
          ),
      });
    }
    return dateFilterItems;
  }, [claimQueryParams, dispatch]);

  if (!user) return null;
  if (!canViewPage) return (<Navigate to="/" />);

  return (
    <>
      <ClaimsFilter
        open={openFilter}
        handleClose={() => setOpenFilter(false)}
        handleFilter={handleFilter}
        canEditStatus={true}
      />
      <Container maxWidth="xl" sx={{ marginTop: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" component="h1" fontWeight={400}>
              Seguimiento de Reclamos
            </Typography>
            <Divider sx={{ marginBottom: 0, marginTop: 1 }} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" component="h2" fontWeight={400}>
              A continuación se muestra el listado de los reclamos registrados
              en el sistema. Para ver el detalle de cada uno, haga click en el
              botón ver o presione doble click sobre el registro.
            </Typography>
          </Grid>
          <Grid item xs={12} display="flex" justifyContent="flex-end">
            <Button
              variant="outlined"
              color="secondary"
              sx={{ marginRight: 1 }}
              endIcon={<FilterListTwoToneIcon />}
              onClick={() => setOpenFilter(true)}
            >
              Filtrar
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={1}>
              {claimQueryParams.search &&
                claimQueryParams.search.length > 0 && (
                  <ChipFilterCategory
                    label="Buscar: "
                    items={[
                      {
                        label: claimQueryParams.search,
                        id: "",
                        deleteAction: () => {
                          dispatch(
                            setClaimQueryParams({
                              ...claimQueryParams,
                              search: "",
                            })
                          );
                        },
                      },
                    ]}
                  />
                )}
              {claimQueryParams.id && (
                <ChipFilterCategory
                  label="ID Reclamo: "
                  items={[
                    {
                      label: `${claimQueryParams.id}`,
                      id: "",
                      deleteAction: () =>
                        dispatch(
                          setClaimQueryParams({
                            ...claimQueryParams,
                            id: undefined,
                          })
                        ),
                    },
                  ]}
                />
              )}
              {claimQueryParams.tipo && (
                <ChipFilterCategory
                  label="Tipo: "
                  items={[
                    {
                      label: claimTypes?.results?.find((item) => item.id === claimQueryParams.tipo)?.name ||"",
                      id: "",
                      deleteAction: () =>
                        dispatch(
                          setClaimQueryParams({
                            ...claimQueryParams,
                            tipo: undefined,
                          })
                        ),
                    },
                  ]}
                />
              )}
              {claimQueryParams.distributor_center &&
                claimQueryParams.distributor_center.length > 0 && (
                  <ChipFilterCategory
                    label="Centro de Distribución: "
                    items={[
                      {
                        label:
                          disctributionCenters.find(
                            (dc) =>
                              Number(dc.id) ===
                              Number(claimQueryParams.distributor_center![0])
                          )?.name || "",
                        id: "dc",
                        deleteAction: !user?.centro_distribucion
                          ? () =>
                              dispatch(
                                setClaimQueryParams({
                                  ...claimQueryParams,
                                  distributor_center: [],
                                })
                              )
                          : undefined,
                      },
                    ]}
                  />
                )}
              {(claimQueryParams.date_after ||
                claimQueryParams.date_before) && (
                <ChipFilterCategory
                  label="Fecha de Registro: "
                  items={dateFilterItems}
                />
              )}
              {claimQueryParams.status && (
                <ChipFilterCategory
                  label="Estado: "
                  items={[
                    {
                      label:
                        claimQueryParams.status === "PENDIENTE"
                          ? "Pendiente"
                          : claimQueryParams.status === "EN_REVISION"
                          ? "En Revisión"
                          : claimQueryParams.status === "RECHAZADO"
                          ? "Rechazado"
                          : "Aprobado",
                      id: "",
                      deleteAction: () =>
                        dispatch(
                          setClaimQueryParams({
                            ...claimQueryParams,
                            status: undefined,
                          })
                        ),
                    },
                  ]}
                />
              )}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="claim tabs"
              >
                <Tab
                  label="Reclamos Locales"
                  {...a11yProps(0)}
                  icon={<LocalShippingOutlined />}
                  iconPosition="start"
                  disabled={!enableLocal}
                />
                <Tab
                  label="Reclamos Importados"
                  {...a11yProps(1)}
                  icon={<PublicTwoToneIcon />}
                  iconPosition="start"
                  disabled={!enableImport}
                />
              </Tabs>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <ClaimsDataGrid
              claims={
                data?.results.map((claim) => ({
                  id: claim.id,
                  created_at: claim.created_at,
                  distributor_center: claim.tracking?.distributor_center,
                  status: claim.status,
                  tipo: claim.claim_type_data?.name,
                  reference_number: claim.tracking?.id?.toString(),
                  user_name: claim.tracking?.user_name,
                })) || []
              }
              loading={isLoading || isFetching}
              claimType={tabValue === 0 ? "LOCAL" : "IMPORT"}
              pagination={{
                page: claimQueryParams.offset || 0,
                pageSize: claimQueryParams.limit || 15,
                setPage: (page, pageSize) =>
                  dispatch(
                    setClaimQueryParams({
                      ...claimQueryParams,
                      offset: page,
                      limit: pageSize,
                    })
                  ),
              }}
              totalCount={data?.results?.length || 0}
              path="review"
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
