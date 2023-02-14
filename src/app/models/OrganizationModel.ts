import { MedidorModel } from './MedidorModel';
import { InformationModel } from "./InformationModel";

export interface OrganizationModel {
    name: string;
    nodes: Array<OrganizationModel>;
    parent: OrganizationModel;
    departamento: string;
    municipio: string;
    direccion: string;
    information: Array<InformationModel>
    medidorModel: MedidorModel;
}