import {
  Container,
  Grid,
  IconButton, LinearProgress,
} from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import { useEffect, useMemo, useState } from "react";
import backendApi from "../../../config/apiConfig";
import { TATGraphItem } from "../../../interfaces/tracking";
import { AxiosResponse } from "axios";
import { useAppDispatch, useAppSelector } from "../../../store";
import { DistributionCenter } from "../../../interfaces/maintenance";
import TATGraphFilter from "./TATGraphFilter";
import { setGraphQueryParams } from "../../../store/ui/uiSlice";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export enum TypeChart {
  LINE = "LINE",
  BAR = "BAR",
}

const labels = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// eslint-disable-next-line react-refresh/only-export-components
export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
};

type GroupedData = Record<number, TATGraphItem[]>;
const groupByDistributorCenter = (data: TATGraphItem[]) => {

  const groupedData: GroupedData = data.reduce((acc, currentItem) => {
    const { distributor_center } = currentItem;

    // Si aún no hay una entrada para este distribuidor, crear una nueva con un array vacío
    if (!acc[distributor_center]) {
      acc[distributor_center] = [];
    }

    // Agregar el objeto actual al array correspondiente
    acc[distributor_center].push(currentItem);

    return acc;
  }, {}as GroupedData);

  return groupedData
};

const colors = [
  "#66b2ff",
  "#ffcc99",
  "#99ff99",
  "#ffb3e6",
  "#ffff99",
  "#c2a2ff",
  "#66ffc2",
  "#ff9999",
  "#c2c2c2",
  "#fff5e1",
]

const obtenerDatasets = (data: GroupedData, dcs: DistributionCenter[])=>{
  const result = []
  let index = 0
  for (const distributorCenter in data) {
    // eslint-disable-next-line no-prototype-builtins
    if (data.hasOwnProperty(distributorCenter)) {
      const itemsForCenter: TATGraphItem[] = data[distributorCenter];
      const label = dcs.find(dc => dc.id.toString() === distributorCenter)?.name || "0"
      result.push({
        label: label,
        data: labels.map((_mes, index) => {
          //TODO: implementar bien
          const dato = itemsForCenter.find((avg) => avg.month === index + 1);
          return dato?.avg_time_invested || 0;
        }),
        borderColor: colors[index%colors.length],
        backgroundColor: colors[index%colors.length],
        id: Math.random(),
      })
    }
    index+=1
  }
  return result
}

const TATGraph = () => {
  const { graphQueryParams: {year, distributor_center, typeChart}, graphQueryParams } = useAppSelector(state => state.ui)
  const [averages, setAverages] = useState<TATGraphItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAppSelector(state => state.auth)
  const {disctributionCenters} = useAppSelector(state => state.maintenance)
  const dispatch = useAppDispatch()
  // TODO implementar bien el loading

  const datasets = useMemo(()=>{
    const datosAgrupados = groupByDistributorCenter(averages);
    return obtenerDatasets(datosAgrupados, disctributionCenters.filter(dc => user?.distributions_centers.includes(dc.id)))
  }, [averages, disctributionCenters, user])

  const data = {
    labels,
    datasets: datasets,
  };

  const setTypeChart = (type: TypeChart) => {
    dispatch(setGraphQueryParams({...graphQueryParams, typeChart: type}))
  }

  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
      const response = await backendApi.get<
        TATGraphItem[],
        AxiosResponse<TATGraphItem[]>
      >(`graph/tat/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          year: year,
          distributor_center: distributor_center?.join(",") || undefined 
        },
      });

      if (response.status === 200) {
        setAverages(response.data);
      }
      setLoading(false)
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, distributor_center]);

  return (
    <>
      <Container maxWidth="xl" className="mt-5">
        <div className="row">
          <div className="col-sm-6">

              <>
                <div className="d-flex justify-content-between align-items-between">
                  {loading &&<LinearProgress color="primary" sx={{width: '100%'}}/>}
                  <Grid container justifyContent="space-between">
                    <Grid item>

                      <div>
                        <IconButton
                          onClick={() => setTypeChart(TypeChart.LINE)}
                          color={
                            typeChart === TypeChart.LINE ? "primary" : "default"
                          }
                        >
                          <TimelineOutlinedIcon style={{ fontSize: "35px" }} />
                        </IconButton>
                        <IconButton
                          onClick={() => setTypeChart(TypeChart.BAR)}
                          color={
                            typeChart === TypeChart.BAR ? "primary" : "default"
                          }
                        >
                          <BarChartOutlinedIcon style={{ fontSize: "35px" }} />
                        </IconButton>
                      </div>
                    </Grid>

                    <Grid item>
                      <TATGraphFilter/>
                    </Grid>
                  </Grid>
                </div>
                {typeChart === TypeChart.BAR && (
                  <Bar options={options} data={data} height={80} />
                )}
                {typeChart === TypeChart.LINE && (
                  <Line options={options} data={data} height={80} />
                )}
              </>
          </div>
        </div>
      </Container>
    </>
  );
};

export default TATGraph;

export interface GraphParamsLS {
  year: number,
  distributor_center?: number[],
  graphtype: TypeChart,
}