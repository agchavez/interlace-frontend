/**
 * Interfaces para el módulo de Tokens
 */

// ============ ENUMS ============

export enum TokenType {
  PERMIT_HOUR = 'PERMIT_HOUR',
  PERMIT_DAY = 'PERMIT_DAY',
  EXIT_PASS = 'EXIT_PASS',
  SUBSTITUTION = 'SUBSTITUTION',
  RATE_CHANGE = 'RATE_CHANGE',
  OVERTIME = 'OVERTIME',
  SHIFT_CHANGE = 'SHIFT_CHANGE',
  UNIFORM_DELIVERY = 'UNIFORM_DELIVERY',
}

export enum TokenStatus {
  DRAFT = 'DRAFT',
  PENDING_L1 = 'PENDING_L1',
  PENDING_L2 = 'PENDING_L2',
  PENDING_L3 = 'PENDING_L3',
  APPROVED = 'APPROVED',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export enum PermitHourReason {
  MEDICAL = 'MEDICAL',
  PERSONAL = 'PERSONAL',
  BANK = 'BANK',
  GOVERNMENT = 'GOVERNMENT',
  FAMILY = 'FAMILY',
  EDUCATION = 'EDUCATION',
  OTHER = 'OTHER',
}

export enum PermitDayReason {
  MEDICAL = 'MEDICAL',
  FAMILY = 'FAMILY',
  PERSONAL = 'PERSONAL',
  LEGAL = 'LEGAL',
  EDUCATION = 'EDUCATION',
  BEREAVEMENT = 'BEREAVEMENT',
  WEDDING = 'WEDDING',
  PATERNITY = 'PATERNITY',
  MATERNITY = 'MATERNITY',
  VACATION = 'VACATION',
  OTHER = 'OTHER',
}

export enum DateSelectionType {
  SINGLE = 'SINGLE',
  RANGE = 'RANGE',
  MULTIPLE = 'MULTIPLE',
}

export enum SubstitutionReason {
  ABSENCE = 'ABSENCE',
  VACATION = 'VACATION',
  MEDICAL_LEAVE = 'MEDICAL_LEAVE',
  TRAINING = 'TRAINING',
  PROMOTION = 'PROMOTION',
  EMERGENCY = 'EMERGENCY',
  OTHER = 'OTHER',
}

export enum RateChangeReason {
  TEMPORARY_ASSIGNMENT = 'TEMPORARY_ASSIGNMENT',
  SPECIAL_PROJECT = 'SPECIAL_PROJECT',
  ADDITIONAL_RESPONSIBILITY = 'ADDITIONAL_RESPONSIBILITY',
  COVERAGE = 'COVERAGE',
  INCENTIVE = 'INCENTIVE',
  OTHER = 'OTHER',
}

export enum OvertimeType {
  REGULAR = 'REGULAR',
  HOLIDAY = 'HOLIDAY',
  WEEKEND = 'WEEKEND',
  NIGHT = 'NIGHT',
  DOUBLE = 'DOUBLE',
}

export enum OvertimeReason {
  PRODUCTION = 'PRODUCTION',
  DEADLINE = 'DEADLINE',
  COVERAGE = 'COVERAGE',
  EMERGENCY = 'EMERGENCY',
  SPECIAL_PROJECT = 'SPECIAL_PROJECT',
  INVENTORY = 'INVENTORY',
  MAINTENANCE = 'MAINTENANCE',
  OTHER = 'OTHER',
}

export enum ShiftChangeReason {
  PERSONAL = 'PERSONAL',
  MEDICAL = 'MEDICAL',
  EDUCATION = 'EDUCATION',
  FAMILY = 'FAMILY',
  TRANSPORT = 'TRANSPORT',
  MUTUAL_AGREEMENT = 'MUTUAL_AGREEMENT',
  OPERATIONAL = 'OPERATIONAL',
  OTHER = 'OTHER',
}

export enum UniformItemType {
  SHIRT = 'SHIRT',
  PANTS = 'PANTS',
  JACKET = 'JACKET',
  SHOES = 'SHOES',
  BOOTS = 'BOOTS',
  HAT = 'HAT',
  HELMET = 'HELMET',
  VEST = 'VEST',
  GLOVES = 'GLOVES',
  BELT = 'BELT',
  BADGE = 'BADGE',
  OVERALL = 'OVERALL',
  OTHER = 'OTHER',
}

export enum UniformSize {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
  XXXL = 'XXXL',
  SIZE_35 = '35',
  SIZE_36 = '36',
  SIZE_37 = '37',
  SIZE_38 = '38',
  SIZE_39 = '39',
  SIZE_40 = '40',
  SIZE_41 = '41',
  SIZE_42 = '42',
  SIZE_43 = '43',
  SIZE_44 = '44',
  SIZE_45 = '45',
  NA = 'NA',
}

// ============ DISPLAY LABELS ============

export const TokenTypeLabels: Record<TokenType, string> = {
  [TokenType.PERMIT_HOUR]: 'Permiso por Hora',
  [TokenType.PERMIT_DAY]: 'Permiso por Día',
  [TokenType.EXIT_PASS]: 'Pase de Salida',
  [TokenType.SUBSTITUTION]: 'Sustitución',
  [TokenType.RATE_CHANGE]: 'Cambio de Tasa',
  [TokenType.OVERTIME]: 'Horas Extra',
  [TokenType.SHIFT_CHANGE]: 'Cambio de Turno',
  [TokenType.UNIFORM_DELIVERY]: 'Entrega de Uniforme',
};

export const TokenStatusLabels: Record<TokenStatus, string> = {
  [TokenStatus.DRAFT]: 'Borrador',
  [TokenStatus.PENDING_L1]: 'Pendiente Nivel 1',
  [TokenStatus.PENDING_L2]: 'Pendiente Nivel 2',
  [TokenStatus.PENDING_L3]: 'Pendiente Nivel 3',
  [TokenStatus.APPROVED]: 'Aprobado',
  [TokenStatus.USED]: 'Utilizado',
  [TokenStatus.EXPIRED]: 'Expirado',
  [TokenStatus.CANCELLED]: 'Cancelado',
  [TokenStatus.REJECTED]: 'Rechazado',
};

export const PermitHourReasonLabels: Record<PermitHourReason, string> = {
  [PermitHourReason.MEDICAL]: 'Cita Médica',
  [PermitHourReason.PERSONAL]: 'Asunto Personal',
  [PermitHourReason.BANK]: 'Trámite Bancario',
  [PermitHourReason.GOVERNMENT]: 'Trámite Gubernamental',
  [PermitHourReason.FAMILY]: 'Asunto Familiar',
  [PermitHourReason.EDUCATION]: 'Asunto Educativo',
  [PermitHourReason.OTHER]: 'Otro',
};

export const PermitDayReasonLabels: Record<PermitDayReason, string> = {
  [PermitDayReason.MEDICAL]: 'Cita Médica',
  [PermitDayReason.FAMILY]: 'Asunto Familiar',
  [PermitDayReason.PERSONAL]: 'Asunto Personal',
  [PermitDayReason.LEGAL]: 'Asunto Legal/Trámite',
  [PermitDayReason.EDUCATION]: 'Educación/Capacitación',
  [PermitDayReason.BEREAVEMENT]: 'Duelo',
  [PermitDayReason.WEDDING]: 'Matrimonio',
  [PermitDayReason.PATERNITY]: 'Paternidad',
  [PermitDayReason.MATERNITY]: 'Maternidad',
  [PermitDayReason.VACATION]: 'Vacaciones',
  [PermitDayReason.OTHER]: 'Otro',
};

export const DateSelectionTypeLabels: Record<DateSelectionType, string> = {
  [DateSelectionType.SINGLE]: 'Día Único',
  [DateSelectionType.RANGE]: 'Rango de Días',
  [DateSelectionType.MULTIPLE]: 'Días Múltiples',
};

export const SubstitutionReasonLabels: Record<SubstitutionReason, string> = {
  [SubstitutionReason.ABSENCE]: 'Ausencia',
  [SubstitutionReason.VACATION]: 'Vacaciones',
  [SubstitutionReason.MEDICAL_LEAVE]: 'Licencia Médica',
  [SubstitutionReason.TRAINING]: 'Capacitación',
  [SubstitutionReason.PROMOTION]: 'Promoción Temporal',
  [SubstitutionReason.EMERGENCY]: 'Emergencia',
  [SubstitutionReason.OTHER]: 'Otro',
};

export const RateChangeReasonLabels: Record<RateChangeReason, string> = {
  [RateChangeReason.TEMPORARY_ASSIGNMENT]: 'Asignación Temporal',
  [RateChangeReason.SPECIAL_PROJECT]: 'Proyecto Especial',
  [RateChangeReason.ADDITIONAL_RESPONSIBILITY]: 'Responsabilidad Adicional',
  [RateChangeReason.COVERAGE]: 'Cobertura de Puesto',
  [RateChangeReason.INCENTIVE]: 'Incentivo',
  [RateChangeReason.OTHER]: 'Otro',
};

export const OvertimeTypeLabels: Record<OvertimeType, string> = {
  [OvertimeType.REGULAR]: 'Horas Extra Regulares',
  [OvertimeType.HOLIDAY]: 'Horas en Feriado',
  [OvertimeType.WEEKEND]: 'Horas en Fin de Semana',
  [OvertimeType.NIGHT]: 'Horas Nocturnas',
  [OvertimeType.DOUBLE]: 'Doble Turno',
};

export const OvertimeReasonLabels: Record<OvertimeReason, string> = {
  [OvertimeReason.PRODUCTION]: 'Demanda de Producción',
  [OvertimeReason.DEADLINE]: 'Cumplimiento de Plazo',
  [OvertimeReason.COVERAGE]: 'Cobertura de Personal',
  [OvertimeReason.EMERGENCY]: 'Emergencia',
  [OvertimeReason.SPECIAL_PROJECT]: 'Proyecto Especial',
  [OvertimeReason.INVENTORY]: 'Inventario',
  [OvertimeReason.MAINTENANCE]: 'Mantenimiento',
  [OvertimeReason.OTHER]: 'Otro',
};

export const ShiftChangeReasonLabels: Record<ShiftChangeReason, string> = {
  [ShiftChangeReason.PERSONAL]: 'Motivo Personal',
  [ShiftChangeReason.MEDICAL]: 'Cita Médica',
  [ShiftChangeReason.EDUCATION]: 'Estudios',
  [ShiftChangeReason.FAMILY]: 'Asunto Familiar',
  [ShiftChangeReason.TRANSPORT]: 'Transporte',
  [ShiftChangeReason.MUTUAL_AGREEMENT]: 'Acuerdo Mutuo',
  [ShiftChangeReason.OPERATIONAL]: 'Necesidad Operativa',
  [ShiftChangeReason.OTHER]: 'Otro',
};

export const UniformItemTypeLabels: Record<UniformItemType, string> = {
  [UniformItemType.SHIRT]: 'Camisa',
  [UniformItemType.PANTS]: 'Pantalón',
  [UniformItemType.JACKET]: 'Chaqueta',
  [UniformItemType.SHOES]: 'Zapatos',
  [UniformItemType.BOOTS]: 'Botas',
  [UniformItemType.HAT]: 'Gorra',
  [UniformItemType.HELMET]: 'Casco',
  [UniformItemType.VEST]: 'Chaleco',
  [UniformItemType.GLOVES]: 'Guantes',
  [UniformItemType.BELT]: 'Cinturón',
  [UniformItemType.BADGE]: 'Credencial',
  [UniformItemType.OVERALL]: 'Overol',
  [UniformItemType.OTHER]: 'Otro',
};

export const UniformSizeLabels: Record<UniformSize, string> = {
  [UniformSize.XS]: 'Extra Pequeño',
  [UniformSize.S]: 'Pequeño',
  [UniformSize.M]: 'Mediano',
  [UniformSize.L]: 'Grande',
  [UniformSize.XL]: 'Extra Grande',
  [UniformSize.XXL]: 'Doble Extra Grande',
  [UniformSize.XXXL]: 'Triple Extra Grande',
  [UniformSize.SIZE_35]: 'Talla 35',
  [UniformSize.SIZE_36]: 'Talla 36',
  [UniformSize.SIZE_37]: 'Talla 37',
  [UniformSize.SIZE_38]: 'Talla 38',
  [UniformSize.SIZE_39]: 'Talla 39',
  [UniformSize.SIZE_40]: 'Talla 40',
  [UniformSize.SIZE_41]: 'Talla 41',
  [UniformSize.SIZE_42]: 'Talla 42',
  [UniformSize.SIZE_43]: 'Talla 43',
  [UniformSize.SIZE_44]: 'Talla 44',
  [UniformSize.SIZE_45]: 'Talla 45',
  [UniformSize.NA]: 'No Aplica',
};

// ============ BASIC TYPES ============

export interface PersonnelBasic {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  area_name: string;
  position_type: string;
  position_display: string;
  hierarchy_level: string;
}

export interface UserBasic {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

export interface DistributorCenterBasic {
  id: number;
  name: string;
}

// ============ TOKEN TYPE DETAILS ============

// Permit Hour Detail
export interface PermitHourDetail {
  id: number;
  reason_type: PermitHourReason;
  reason_type_display: string;
  reason_detail: string;
  hours_requested: number;
  exit_time: string;
  expected_return_time: string;
  with_pay: boolean;
  destination?: string;
}

// Permit Day Detail
export interface PermitDayDate {
  id: number;
  date: string;
  notes: string;
}

export interface PermitDayDetail {
  id: number;
  date_selection_type: DateSelectionType;
  date_selection_type_display: string;
  reason: PermitDayReason;
  reason_display: string;
  reason_detail: string;
  with_pay: boolean;
  start_date: string | null;
  end_date: string | null;
  selected_dates: PermitDayDate[];
  total_days: number;
}

// Exit Pass Detail
export interface ExitPassItem {
  id: number;
  material: number | null;
  material_name: string | null;
  product: number | null;
  product_name: string | null;
  custom_description: string;
  quantity: number;
  unit_value: number;
  total_value: number;
  requires_return: boolean;
  return_date: string | null;
  returned: boolean;
  returned_at: string | null;
  returned_quantity: number | null;
  return_notes: string;
  is_overdue: boolean;
}

export interface ExitPassDetail {
  id: number;
  destination: string;
  purpose: string;
  vehicle_plate: string;
  driver_name: string;
  expected_return_date: string | null;
  items: ExitPassItem[];
  total_value: number;
  requires_level_3_approval: boolean;
}

// Uniform Delivery Detail
export interface UniformItem {
  id: number;
  item_type: UniformItemType;
  item_type_display: string;
  custom_description: string;
  size: UniformSize;
  size_display: string;
  color: string;
  quantity: number;
  requires_return: boolean;
  return_date: string | null;
  returned: boolean;
  returned_at: string | null;
  is_overdue: boolean;
}

export interface UniformDeliveryDetail {
  id: number;
  is_delivered: boolean;
  delivered_at: string | null;
  delivered_by: number | null;
  delivered_by_name: string | null;
  delivery_photo_1: string | null;
  delivery_photo_2: string | null;
  signature_image: string | null;
  delivery_location: string;
  delivery_notes: string;
  items: UniformItem[];
}

// Substitution Detail
export interface SubstitutionDetail {
  id: number;
  substituted_personnel: number;
  substituted_personnel_name: string;
  substituted_personnel_code: string;
  reason: SubstitutionReason;
  reason_display: string;
  reason_detail: string;
  assumed_functions: string;
  start_date: string;
  end_date: string;
  specific_schedule: string;
  additional_compensation: boolean;
  compensation_notes: string;
  total_days: number;
}

// Rate Change Detail
export interface RateChangeDetail {
  id: number;
  reason: RateChangeReason;
  reason_display: string;
  reason_detail: string;
  current_rate: number;
  new_rate: number;
  rate_type: string;
  start_date: string;
  end_date: string;
  additional_functions: string;
  rate_difference: number;
  rate_percentage_change: number;
}

// Overtime Detail
export interface OvertimeDetail {
  id: number;
  overtime_type: OvertimeType;
  overtime_type_display: string;
  reason: OvertimeReason;
  reason_display: string;
  reason_detail: string;
  overtime_date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  pay_multiplier: number;
  assigned_task: string;
  was_completed: boolean | null;
  actual_start_time: string | null;
  actual_end_time: string | null;
  actual_hours: number | null;
  completion_notes: string;
  estimated_pay: number;
}

// Shift Change Detail
export interface ShiftChangeDetail {
  id: number;
  reason: ShiftChangeReason;
  reason_display: string;
  reason_detail: string;
  current_shift_name: string;
  current_shift_start: string;
  current_shift_end: string;
  new_shift_name: string;
  new_shift_start: string;
  new_shift_end: string;
  change_date: string;
  is_permanent: boolean;
  end_date: string | null;
  exchange_with: number | null;
  exchange_with_name: string | null;
  exchange_confirmed: boolean;
  is_exchange: boolean;
}

// ============ TOKEN RESPONSE TYPES ============

// Token List Item
export interface TokenListItem {
  id: number;
  token_code: string;
  display_number: string;
  token_type: TokenType;
  token_type_display: string;
  status: TokenStatus;
  status_display: string;
  personnel: number;
  personnel_name: string;
  personnel_code: string;
  requested_by: number;
  requested_by_name: string;
  distributor_center: number;
  distributor_center_name: string;
  valid_from: string;
  valid_until: string;
  approval_progress: number;
  current_approval_level: number | null;
  created_at: string;
}

// Token Detail
export interface TokenDetail {
  id: number;
  token_code: string;
  display_number: string;
  token_type: TokenType;
  token_type_display: string;
  status: TokenStatus;
  status_display: string;
  personnel: PersonnelBasic;
  requested_by: UserBasic;
  requested_by_name: string | null;
  distributor_center: DistributorCenterBasic;
  qr_code_url: string | null;
  requires_level_1: boolean;
  requires_level_2: boolean;
  requires_level_3: boolean;
  approved_level_1_by: PersonnelBasic | null;
  approved_level_1_at: string | null;
  approved_level_1_notes: string;
  approved_level_1_signature: string | null;
  approved_level_1_photo: string | null;
  approved_level_2_by: PersonnelBasic | null;
  approved_level_2_at: string | null;
  approved_level_2_notes: string;
  approved_level_2_signature: string | null;
  approved_level_2_photo: string | null;
  approved_level_3_by: PersonnelBasic | null;
  approved_level_3_at: string | null;
  approved_level_3_notes: string;
  approved_level_3_signature: string | null;
  approved_level_3_photo: string | null;
  rejected_by: PersonnelBasic | null;
  rejected_at: string | null;
  rejection_reason: string;
  validated_by: PersonnelBasic | null;
  validated_at: string | null;
  validation_signature: string | null;
  validation_photo: string | null;
  validation_notes: string;
  valid_from: string;
  valid_until: string;
  requester_notes: string;
  internal_notes: string;
  approval_progress: number;
  current_approval_level: number | null;
  is_valid: boolean;
  can_be_used: boolean;
  can_user_approve: boolean;
  can_user_complete_delivery: boolean;
  created_at: string;
  // Type-specific details
  permit_hour_detail: PermitHourDetail | null;
  permit_day_detail: PermitDayDetail | null;
  exit_pass_detail: ExitPassDetail | null;
  uniform_delivery_detail: UniformDeliveryDetail | null;
  substitution_detail: SubstitutionDetail | null;
  rate_change_detail: RateChangeDetail | null;
  overtime_detail: OvertimeDetail | null;
  shift_change_detail: ShiftChangeDetail | null;
}

// Public Token View
export interface PublicTokenView {
  id: number;
  display_number: string;
  token_code: string;
  token_type: TokenType;
  token_type_display: string;
  status: TokenStatus;
  status_display: string;
  personnel_name: string;
  personnel_code: string;
  personnel_area: string;
  distributor_center_name: string;
  valid_from: string;
  valid_until: string;
  validated_at: string | null;
  qr_code_url: string | null;
  detail_summary: Record<string, unknown> | null;
}

// ============ CREATE PAYLOADS ============

export interface PermitHourCreatePayload {
  reason_type: PermitHourReason;
  reason_detail?: string;
  hours_requested: number;
  exit_time: string;
  expected_return_time: string;
  with_pay: boolean;
  destination?: string;
}

export interface PermitDayCreatePayload {
  date_selection_type: DateSelectionType;
  reason: PermitDayReason;
  reason_detail?: string;
  with_pay: boolean;
  start_date?: string;
  end_date?: string;
  selected_dates?: string[];
}

export interface ExitPassItemCreatePayload {
  material?: number;
  product?: number;
  custom_description?: string;
  quantity: number;
  unit_value: number;
  requires_return: boolean;
  return_date?: string;
}

export interface ExitPassCreatePayload {
  destination: string;
  purpose: string;
  vehicle_plate?: string;
  driver_name?: string;
  expected_return_date?: string;
  items: ExitPassItemCreatePayload[];
}

export interface UniformItemCreatePayload {
  item_type: UniformItemType;
  custom_description?: string;
  size: UniformSize;
  color?: string;
  quantity: number;
  requires_return: boolean;
  return_date?: string;
}

export interface UniformDeliveryCreatePayload {
  delivery_location?: string;
  delivery_notes?: string;
  items: UniformItemCreatePayload[];
}

export interface SubstitutionCreatePayload {
  substituted_personnel: number;
  reason: SubstitutionReason;
  reason_detail?: string;
  assumed_functions: string;
  start_date: string;
  end_date: string;
  specific_schedule?: string;
  additional_compensation: boolean;
  compensation_notes?: string;
}

export interface RateChangeCreatePayload {
  reason: RateChangeReason;
  reason_detail?: string;
  current_rate: number;
  new_rate: number;
  rate_type?: string;
  start_date: string;
  end_date: string;
  additional_functions?: string;
}

export interface OvertimeCreatePayload {
  overtime_type: OvertimeType;
  reason: OvertimeReason;
  reason_detail?: string;
  overtime_date: string;
  start_time: string;
  end_time: string;
  pay_multiplier?: number;
  assigned_task?: string;
}

export interface ShiftChangeCreatePayload {
  reason: ShiftChangeReason;
  reason_detail?: string;
  current_shift_name: string;
  current_shift_start: string;
  current_shift_end: string;
  new_shift_name: string;
  new_shift_start: string;
  new_shift_end: string;
  change_date: string;
  is_permanent: boolean;
  end_date?: string;
  exchange_with?: number;
}

export interface TokenCreatePayload {
  token_type: TokenType;
  personnel: number;
  distributor_center: number;
  valid_from: string;
  valid_until: string;
  requires_level_1?: boolean;
  requires_level_2?: boolean;
  requires_level_3?: boolean;
  requester_notes?: string;
  // Type-specific details
  permit_hour_detail?: PermitHourCreatePayload;
  permit_day_detail?: PermitDayCreatePayload;
  exit_pass_detail?: ExitPassCreatePayload;
  uniform_delivery_detail?: UniformDeliveryCreatePayload;
  substitution_detail?: SubstitutionCreatePayload;
  rate_change_detail?: RateChangeCreatePayload;
  overtime_detail?: OvertimeCreatePayload;
  shift_change_detail?: ShiftChangeCreatePayload;
}

// ============ API RESPONSE TYPES ============

export interface TokenListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TokenListItem[];
}

// ============ FILTER PARAMS ============

export interface TokenFilterParams {
  limit?: number;
  offset?: number;
  search?: string;
  token_type?: TokenType | TokenType[];
  status?: TokenStatus | TokenStatus[];
  personnel?: number;
  requested_by?: number;
  distributor_center?: number;
  created_after?: string;
  created_before?: string;
  valid_from_after?: string;
  valid_from_before?: string;
  ordering?: string;
}

// ============ ACTION PAYLOADS ============

export interface ApprovalPayload {
  notes?: string;
}

export interface RejectPayload {
  reason: string;
}

export interface ValidatePayload {
  token_code: string;
  notes?: string;
  signature?: Blob;
  photo?: File;
}

// ============ CATALOG TYPES ============

export interface UnitOfMeasure {
  id: number;
  code: string;
  name: string;
  abbreviation: string;
}

export interface Material {
  id: number;
  code: string;
  name: string;
  description: string;
  unit_of_measure: number;
  unit_of_measure_name: string;
  unit_value: number;
  requires_return: boolean;
  category: string;
}
