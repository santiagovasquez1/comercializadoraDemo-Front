import { InformationModel } from "./InformationModel";

export interface OrganizationDto{
    name: string;
    nodes: Array<OrganizationDto>;
    departamento: string;
    municipio: string;
    direccion: string;
    information?: Array<InformationModel>
}