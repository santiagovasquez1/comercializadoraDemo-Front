

export interface PagosModel {

    nameArea?: string;
    nameLocal?: string;
    valorTotal?: number;

    fecha: Date;
    

    energiaActivaAcumuladoMes: number;
    costoActivaAcumuladoMes: number;    
    energiaReactivaAcumuladoMes: number;
    costoReactivaAcumuladoMes: number;

}