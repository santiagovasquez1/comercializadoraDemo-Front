import { OrganizationModel } from './OrganizationModel';
import { ResponseBase } from './ResponseBase';
export interface GetInformationByTimeStampResponse extends ResponseBase {
    Organizations: Array<OrganizationModel>;
}