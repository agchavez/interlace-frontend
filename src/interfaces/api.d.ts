export interface BaseApiResponse<T> {
    count: number;
    results: T[];

}

export interface BaseApiParams {
    limit?: number;
    offset?: number;
}

export interface ErrorApiResponse {
    mensage?: string;
    error_code?: string;
    status_code: number;
    detail: ErrorApiResponseDetail;
}

export interface ErrorApiResponseDetail {  
    mensage?: ErrorApiResponseDetailMessage;
    non_field_errors?: NonFieldError[]
}

export interface ErrorApiResponseDetailMessage {
    message: string;
    code: string;
}

export interface NonFieldError {
    message: string;
    code: string;
}