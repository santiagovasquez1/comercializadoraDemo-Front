import { ResponseBase } from './ResponseBase';
export interface GetPorcentajeConsumoResponse extends ResponseBase{
    energiaOrganizacion:number;
    energiaTotalCluster:number;
}