export interface GetGeneralDataRequest {
    empresaName: string;
    areaName?: string;
    localName?: string;
    fechaConsulta: Date;
    TypeOfOrganization: ETypesOrganizations
}

export enum ETypesOrganizations {
    Empresa,
    Area,
    Local
}