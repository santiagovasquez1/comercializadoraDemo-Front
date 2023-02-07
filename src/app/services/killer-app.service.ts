import { OrganizationModel } from './../models/OrganizationModel';
import { GetGeneralDataRequest } from './../models/GetGeneralDataRequest';
import { GetGeneralDataResponse } from './../models/GetGeneralDataResponse';
import { Observable, map } from 'rxjs';
import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KillerAppService {
  killerAppUrl = environment.killerapp_url;

  constructor(private http: HttpClient) { }

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
}
