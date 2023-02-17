import { InformationModel } from "./InformationModel";
import { MedidorModel } from "./MedidorModel";

export interface InformationDetalle {
    tipo: 'Día' | 'Mes';
    fecha: Date;
    precio:number;
    energiaActiva: number;
    energiaReactiva: number;
    costoActiva: number;
    costoReactiva: number;
    costoTotal: number;
}