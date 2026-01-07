// ============================
// Personnel Module Interfaces
// ============================

export interface Area {
  id: number;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  area: number;
  area_display?: string;
  is_active: boolean;
}

export interface DistributorCenter {
  id: number;
  name: string;
  code?: string;
}

export interface PersonnelProfile {
  id: number;
  employee_code: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  position_type: string;
  position_type_display: string;
  hierarchy_level: string;
  hierarchy_level_display: string;

  // Foreign key IDs (for forms and updates)
  primary_distributor_center?: number | null;
  distributor_centers?: number[];
  area: Area | number;
  department?: Department | number | null;
  immediate_supervisor?: number | null;

  // Nested object data (from detail serializer)
  primary_distributor_center_data?: DistributorCenter | null;
  distributor_centers_data?: DistributorCenter[];
  area_data?: Area;
  department_data?: Department | null;
  supervisor_data?: PersonnelProfileSummary | null;

  // Other fields
  distributor_centers_names?: string[];
  hire_date: string;
  contract_type: string;
  contract_type_display?: string;
  personal_id: string;
  birth_date: string;
  gender: string;
  gender_display?: string;
  marital_status?: string;
  marital_status_display?: string;
  phone: string;
  personal_email?: string;
  address: string;
  city: string;
  is_active: boolean;
  has_system_access: boolean;
  years_of_service: number;
  age?: number;
  supervised_personnel_count?: number;
  supervised_count?: number;
  has_valid_certifications?: boolean;
  certifications_count?: number;
  certifications_expiring_count?: number;
  medical_records_count?: number;
  termination_date?: string | null;
  photo?: File | string | null;
  photo_url?: string | null;

  // Size fields
  shirt_size?: string;
  pants_size?: string;
  shoe_size?: string;
  glove_size?: string;
  helmet_size?: string;

  // Authentication methods
  authentication_methods?: Array<{
    type: string;
    value: string;
    label: string;
    enabled: boolean;
  }>;
}

export interface PersonnelProfileSummary {
  id: number;
  employee_code: string;
  full_name: string;
  position: string;
  hierarchy_level: string;
}

export interface PersonnelProfileList {
  id: number;
  employee_code: string;
  full_name: string;
  username?: string | null;
  email: string;
  position: string;
  position_type_display: string;
  hierarchy_level: string;
  hierarchy_level_display: string;
  area_name: string;
  center_name: string;
  hire_date: string;
  is_active: boolean;
  has_system_access: boolean;
  years_of_service: number;
  supervised_personnel_count: number;
  photo_url?: string | null;
}

export interface PersonnelProfileCreateUpdate {
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  primary_distributor_center: number;
  distributor_centers?: number[];
  area: number;
  department?: number | null;
  hierarchy_level: string;
  position: string;
  position_type: string;
  hire_date: string;
  contract_type: string;
  personal_id: string;
  birth_date: string;
  gender: string;
  phone: string;
  address: string;
  city: string;
  immediate_supervisor?: number | null;
  emergency_contacts?: EmergencyContact[];
}

export interface MyProfileUpdate {
  email?: string;
  personal_email?: string;
  phone?: string;
  address?: string;
  city?: string;
  marital_status?: string;
  shirt_size?: string;
  pants_size?: string;
  shoe_size?: string;
  glove_size?: string;
  helmet_size?: string;
  photo?: File | string | null;
}

export interface EmergencyContact {
  id?: number;
  full_name: string;
  relationship: string;
  phone: string;
  alternative_phone?: string;
  address?: string;
  is_primary: boolean;
}

export interface Certification {
  id: number;
  personnel: number;
  personnel_name?: string;
  personnel_code?: string;
  certification_type: CertificationType | number;
  certification_type_name?: string;
  certification_number: string;
  issue_date: string;
  expiration_date: string;
  issuing_organization?: string;
  issuing_authority?: string;
  is_valid: boolean;
  revoked: boolean;
  revocation_date?: string | null;
  revocation_reason?: string | null;
  days_until_expiration?: number | null;
  is_expiring_soon?: boolean;
  is_expired?: boolean;
  status_display?: string;
  certificate_document?: string | null;
  certificate_document_url?: string | null;
  notes?: string;
  created_by_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CertificationType {
  id: number;
  name: string;
  code: string;
  description?: string;
  required_for_positions: string[];
  validity_period_days: number;
  requires_renewal: boolean;
}

export interface MedicalRecord {
  id: number;
  personnel: number;
  record_type: string;
  record_type_display: string;
  record_date: string;
  description: string;
  diagnosis?: string | null;
  treatment?: string | null;
  is_confidential: boolean;
  start_date?: string | null;
  end_date?: string | null;
  doctor_name?: string | null;
  medical_center?: string | null;
  attachment?: string | null;
}

export interface PerformanceMetric {
  id: number;
  personnel: number;
  metric_date: string;
  period: string;
  period_display: string;
  pallets_moved: number;
  hours_worked: number;
  productivity_rate: number;
  errors_count: number;
  accidents_count: number;
  supervisor_rating: number;
  evaluated_by: PersonnelProfileSummary;
  comments?: string | null;
}

// ============================
// API Responses
// ============================

export interface PersonnelProfileListResponse {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: PersonnelProfileList[];
}

export interface CertificationListResponse {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: Certification[];
}

export interface MedicalRecordListResponse {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: MedicalRecord[];
}

export interface PerformanceMetricListResponse {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: PerformanceMetric[];
}

// ============================
// Profile Completion
// ============================

export interface ProfileCheckResponse {
  has_profile: boolean;
  message?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface ProfileCompletionData {
  areas: Area[];
  distributor_centers: DistributorCenter[];
  hierarchy_levels: SelectOption[];
  position_types: SelectOption[];
  contract_types: SelectOption[];
  genders: SelectOption[];
  user_info: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface CompleteProfileResponse {
  message: string;
  profile: PersonnelProfile;
}

// ============================
// Dashboard
// ============================

export interface PersonnelDashboard {
  summary: {
    total_active: number;
    total_inactive: number;
    with_system_access: number;
    without_system_access: number;
    avg_years_of_service: number;
    growth_trend_percentage: number;
    new_hires_7_days: number;
    new_hires_30_days: number;
  };
  by_hierarchy: Array<{
    hierarchy_level: string;
    count: number;
  }>;
  by_position_type: Array<{
    position_type: string;
    count: number;
  }>;
  by_area: Array<{
    area__code: string;
    area__name: string;
    count: number;
  }>;
  certifications: {
    expiring_soon: number;
    expired: number;
  };
  evaluations: {
    pending: number;
  };
}

// ============================
// Filters
// ============================

export interface PersonnelFilterParams {
  search?: string;
  hierarchy_level?: string;
  area?: number;
  primary_distributor_center?: number;
  any_distributor_center?: number;
  position_type?: string;
  is_active?: boolean;
  has_user?: boolean;
  limit?: number;
  offset?: number;
}

export interface CertificationFilterParams {
  search?: string;
  personnel?: number;
  certification_type?: number;
  status?: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'REVOKED';
  is_valid?: boolean;
  expiring_soon?: boolean;
  distributor_center?: number;
  area?: number;
  hierarchy_level?: string;
  position_type?: string;
  limit?: number;
  offset?: number;
}

export interface PerformanceFilterParams {
  search?: string;
  personnel?: number;
  period?: string;
  min_score?: number;
  max_score?: number;
  date_from?: string;
  date_to?: string;
  distributor_center?: number;
  area?: number;
  hierarchy_level?: string;
  position_type?: string;
  limit?: number;
  offset?: number;
}

// Actualizado para coincidir con el backend
export interface CertificationList {
  id: number;
  personnel_code: string;
  personnel_name: string;
  certification_type_name: string;
  certification_number: string;
  issue_date: string;
  expiration_date: string;
  issuing_organization: string;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'REVOKED';
  days_until_expiration?: number | null;
  certificate_document?: string | null;
  certificate_document_url?: string | null;
  document_url?: string | null;
}

export interface PerformanceMetricList {
  id: number;
  personnel_code: string;
  personnel_name: string;
  position?: string;
  evaluation_date: string;
  overall_score: number;
  productivity_score: number;
  quality_score: number;
  teamwork_score: number;
  punctuality_score: number;
}

export interface CertificationListResponse {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: CertificationList[];
}

export interface PerformanceMetricListResponse {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: PerformanceMetricList[];
}

// Statistics interfaces
export interface MetricAverage {
  metric_name: string;
  average_value: number;
}

export interface EvaluationStatistics {
  metric_averages: MetricAverage[];
  total_evaluations: number;
  average_overall_score: number;
  overall_average: number;
  excellent_count: number;
  needs_improvement_count: number;
}
