import { OrganizationDto } from './OrganizationDto';
import { ResponseBase } from './ResponseBase';
export interface GetOrganizationsResponse extends ResponseBase {
    organizations: OrganizationDto[]
}