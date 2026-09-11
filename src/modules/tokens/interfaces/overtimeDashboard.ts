/**
 * Tipos del dashboard de horas extra.
 * Corresponden a la respuesta de GET /api/tokens/overtime_dashboard/
 */

export type OvertimeGranularity = 'day' | 'week' | 'month';

export interface OvertimeDashboardParams {
  date_from: string;
  date_to: string;
  granularity?: OvertimeGranularity | 'auto';
  distributor_center?: number[];
  reason?: number[];
  overtime_type?: number[];
  area?: number[];
  personnel?: number[];
}

export interface OvertimeDashboardPeriod {
  date_from: string;
  date_to: string;
  granularity: OvertimeGranularity;
  previous_date_from: string;
  previous_date_to: string;
}

/** Bloque común de todo agregado: totales de horas y conteos. */
export interface OvertimeBucket {
  hours: number;
  equivalent_hours: number;
  tokens: number;
  people: number;
}

export interface OvertimeTimePoint extends OvertimeBucket {
  date: string;
}

export interface OvertimeGroupItem extends OvertimeBucket {
  id: number | null;
  name: string;
}

export interface OvertimePersonItem extends OvertimeGroupItem {
  employee_code: string;
  area_name: string;
}

export interface OvertimeKpis {
  total_tokens: number;
  total_people: number;
  total_hours: number;
  equivalent_hours: number;
  avg_hours_per_person: number;
  pending_tokens: number;
  previous: {
    total_tokens: number;
    total_people: number;
    total_hours: number;
    equivalent_hours: number;
    avg_hours_per_person: number;
  };
  /** Variación porcentual contra el periodo anterior. null si no es comparable. */
  variation: {
    total_tokens: number | null;
    total_people: number | null;
    total_hours: number | null;
    equivalent_hours: number | null;
  };
}

export interface OvertimeDashboardResponse {
  period: OvertimeDashboardPeriod;
  kpis: OvertimeKpis;
  timeseries: OvertimeTimePoint[];
  by_reason: OvertimeGroupItem[];
  by_type: OvertimeGroupItem[];
  by_area: OvertimeGroupItem[];
  by_center: OvertimeGroupItem[];
  by_person: OvertimePersonItem[];
}
