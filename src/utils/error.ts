import { toast } from "sonner";
import { AxiosError } from "axios";

interface ErrorResponse {
    status_code: number;
    detail: {
        [key: string]: {
            message: string;
            code: string;
        }[];
    };
}

export function errorApiHandler(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any,
    mensajePersonalizado: string = "Error desconocido"
): void {
    const listErrors: string[] = [];
    try {
        if (error instanceof AxiosError) {
            // TODO: Error de red o no hay internet
            if (error.code && ["ECONNABORTED", "ENOTFOUND", "ECONNREFUSED", "ERR_NETWORK"].includes(error.code)) {
                toast.error("Error de red, verifique su conexión a internet e intente de nuevo");
                return;
            }

            if(error.response?.status === 500){
                toast.error("Error interno del servidor, contacte al administrador");
                return;
            }
            const { detail } = error.response?.data as ErrorResponse;
            console.log(detail, "detail");
            
            // Verificar si el error_code esta en la lista de errores
            if (detail) {
                Object.keys(detail).forEach((key) => {
                    detail[key].forEach((error) => {
                        listErrors.push(error.message);
                    });
                });
            }
            if (listErrors.length === 0) {
                toast.error(mensajePersonalizado);
                return;
            }
            listErrors.forEach((error) => {
                toast.error(error);
            });

            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        else if (error?.data && error?.status) {
            const { detail } = error.data as ErrorResponse;
            
            // Verificar si el error_code esta en la lista de errores
            if (detail) {
                Object.keys(detail).forEach((key) => {
                    detail[key].forEach((error) => {
                        listErrors.push(error.message);
                    });
                });
            }
            if (listErrors.length === 0) {
                toast.error(mensajePersonalizado);
                return;
            }
            listErrors.forEach((error) => {
                toast.error(error);
            });

            return;
        }


    } catch (error) {
        console.log(error, "error");
        toast.error(mensajePersonalizado || "Ocurrio un error inesperado, contacte al administrador");
    }
}
