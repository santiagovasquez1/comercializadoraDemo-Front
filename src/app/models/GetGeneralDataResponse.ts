import { OrganizationModel } from './OrganizationModel';
import { ResponseBase } from './ResponseBase';

export interface GetGeneralDataResponse extends ResponseBase {
    organization: OrganizationModel

}