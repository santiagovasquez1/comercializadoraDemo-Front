export interface InformationModel {
    fecha: Date;
    potenciaActiva: number;
    potenciaReactiva:number;
    precioActiva: number;
    precioDistribucion:number;
    
    energiaActivaAcumuladaDia: number;
    costoActivaAcumuladoDia: number;
    energiaReactivaAcumuladaDia: number;
    costoReactivaAcumuladoDia: number;

    energiaActivaAcumuladoMes: number;
    costoActivaAcumuladoMes: number;    
    energiaReactivaAcumuladoMes: number;
    costoReactivaAcumuladoMes: number;

}