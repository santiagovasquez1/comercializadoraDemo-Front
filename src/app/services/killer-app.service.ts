import { StatusMonitorResponse } from './../models/StatusMonitorResponse';
import { StatusMonitor } from './../models/StatusMonitor';
import { OrganizationDto } from './../models/OrganizationDto';
import { OrganizationModel } from './../models/OrganizationModel';
import { GetGeneralDataRequest } from './../models/GetGeneralDataRequest';
import { GetGeneralDataResponse } from './../models/GetGeneralDataResponse';
import { Observable, map } from 'rxjs';
import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { GetOrganizationsResponse } from '../models/GetOrganizationsResponse';

@Injectable({
  providedIn: 'root'
})
export class KillerAppService {
  killerAppUrl = environment.killerapp_url;

  constructor(private http: HttpClient) { }

  public getOrganizations(): Observable<OrganizationDto[]> {
    const url = `${this.killerAppUrl}/GetOrganizations`;
    return this.http.get(url).pipe(
      map((response: GetOrganizationsResponse) => {
        return response.organizations
      })
    );
  }

  public getConsumoDia(request: GetGeneralDataRequest): Observable<OrganizationModel> {
    const url = `${this.killerAppUrl}/GetConsumoDia`;
    return this.http.post(url, request).pipe(
      map((response: GetGeneralDataResponse) => {
        return response.organization
      })
    );
  }

  public getPronosticoDia(request: GetGeneralDataRequest): Observable<OrganizationModel> {
    const url = `${this.killerAppUrl}/GetPronosticoDia`;
    return this.http.post(url, request).pipe(
      map((response: GetGeneralDataResponse) => {
        return response.organization
      })
    );
  }

  public getloadInfo(): Observable<any> {
    const url = `${this.killerAppUrl}/LoadInfo`;
    return this.http.get(url);
  }

  public monitoreoByTimeStamp(request: GetGeneralDataRequest): Observable<StatusMonitor> {
    const url = `${this.killerAppUrl}/MonitoreoByTimeStamp`;
    return this.http.post<StatusMonitorResponse>(url, request).pipe(
      map(response => {
        return response.statusMonitor
      })
    );
  }
}
