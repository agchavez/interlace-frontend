export interface Rastra {
    id: number;
    transportista: string;
    placa: string;
    tractor: string;
    cabezal: string;
}

interface Producto {
    codigo: number;
    descripcion: string;
    sku: number;
    precioVenta: number;
    costo: number;
    margen: number;
    existencia: number;
    stockMinimo: number;
    stockMaximo: number;
    marca: string;
    idMarca: number;
    categoria: string;
    subcategoria: string;
    presentacion: string;
    envase: string;
    peso: number;
    unidadMedida: string;
    factorConversion: number;
    unidadesPorCaja: number;
  }
  