import { StatusMonitor } from "./StatusMonitor";

export interface TablaMedidores {
    nameArea: string,
    localId: string,
    dirLocal: string,
    nameMunicipio: string,
    nameDpto: string,
    consumo: number,
    potenciaActiva: number,
    potenciaReactiva: number,
    statusMonitor: StatusMonitor
}