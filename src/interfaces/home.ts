export interface DashboardCds {
    distributor_center: string;
    total_trackers:     number;
    edit_trackers:      number;
    tat:                number;
    edited_trackers:    EditedTrackerCDs[];
}

export interface EditedTrackerCDs {
    id:                number;
    input_date:        Date | null;
    output_date:       null;
    trailer__code:     string;
    transporter__code: string;
    created_at:        Date;
    products:          ProductCDs[];
}

export interface ProductCDs {
    sap_code:         string;
    name:             string;
    quantity:         number;
    expiration_dates: ExpirationDateCDs[];
}

export interface ExpirationDateCDs {
    expiration_date: Date;
    quantity:        number;
}

export enum FilterDateDashboard {
    TODAY = 'today',
    WEEK = 'this_week',
    MONTH = 'this_month',
    YEAR = 'this_year',
}

export interface DashboardCdQuery {
    date_range : FilterDateDashboard;
}