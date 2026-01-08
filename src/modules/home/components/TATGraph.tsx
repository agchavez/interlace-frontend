import {
  Container,
  Grid,
  IconButton, LinearProgress, Typography, Box,
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
  maintainAspectRatio: true,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart' as const,
  },
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12,
          family: 'Roboto, sans-serif',
          weight: '500' as const,
        },
        color: '#2C3E50',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      padding: 14,
      borderRadius: 8,
      titleFont: {
        size: 14,
        weight: 'bold' as const,
      },
      bodyFont: {
        size: 13,
      },
      displayColors: true,
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            const hours = Math.floor(context.parsed.y / 3600);
            const minutes = Math.floor((context.parsed.y % 3600) / 60);
            label += `${hours}h ${minutes}m`;
          }
          return label;
        }
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false,
      },
      ticks: {
        font: {
          size: 11,
        },
        color: '#7F8C8D',
        callback: function(value: any) {
          const hours = Math.floor(value / 3600);
          return `${hours}h`;
        },
      },
      title: {
        display: true,
        text: 'Tiempo Promedio (horas)',
        font: {
          size: 12,
          weight: 'bold' as const,
        },
        color: '#2C3E50',
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        },
        color: '#7F8C8D',
      },
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

// Paleta de colores moderna alineada con el tema
const colors = [
  "#DCBB20",  // Primary (Gold)
  "#34A2DB",  // Info (Blue)
  "#27AE60",  // Success (Green)
  "#F39C12",  // Warning (Orange)
  "#E74C3C",  // Danger (Red)
  "#9B59B6",  // Purple
  "#34495E",  // Secondary Dark
  "#16A085",  // Teal
  "#E67E22",  // Carrot
  "#95A5A6",  // Gray
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
          const dato = itemsForCenter.find((avg) => avg.month === index + 1);
          return dato?.avg_time_invested || 0;
        }),
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '33', // 20% opacity for bars
        borderWidth: 3,
        tension: 0.4, // Smooth lines
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: colors[index % colors.length],
        pointBorderWidth: 2,
        pointHoverBackgroundColor: colors[index % colors.length],
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 2,
        fill: true,
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

    const datasets = useMemo(() => {
    const datosAgrupados = groupByDistributorCenter(averages);
    
    // Verificar que user y distributions_centers existan y sea un array
    const userDistributionCenters = user?.distributions_centers || [];
    
    // Asegurarnos de que es un array antes de usar filter
    const filteredCenters = Array.isArray(disctributionCenters) 
      ? disctributionCenters.filter(dc => Array.isArray(userDistributionCenters) && userDistributionCenters.includes(dc.id))
      : [];
      
    return obtenerDatasets(datosAgrupados, filteredCenters);
  }, [averages, disctributionCenters, user]);

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
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          component="h2"
          color="primary"
          fontWeight={500}
          textAlign="center"
        >
          Tiempo Promedio TAT por Centro de Distribución
        </Typography>
      </Box>

      <Container maxWidth="xl" className="mt-5">
        <div className="row">
          <div className="col-sm-6">
            <>
              <div className="d-flex justify-content-between align-items-between">
                {loading && <LinearProgress color="primary" sx={{width: '100%'}}/>}
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