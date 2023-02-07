import { ETypesOrganizations, GetGeneralDataRequest } from './../../models/GetGeneralDataRequest';
import { Observable, forkJoin } from 'rxjs';
import { OrganizationModel } from './../../models/OrganizationModel';
import { NgxSpinnerService } from 'ngx-spinner';
import { KillerAppService } from './../../services/killer-app.service';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  rootOrganizations: OrganizationModel[];
  consumoDia: OrganizationModel;
  pronosticoDia: OrganizationModel;

  constructor(private infoService: KillerAppService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData() {
    this.spinner.show();
    const request: GetGeneralDataRequest = {
      empresaName: 'Empresa1',
      areaName: 'Area1',
      localName: 'Local1',
      TypeOfOrganization: ETypesOrganizations.Empresa,
      fechaConsulta: new Date()
    }

    let obs: Observable<OrganizationModel>[] = [];
    obs.push(this.infoService.getConsumoDia(request));
    obs.push(this.infoService.getPronosticoDia(request));

    forkJoin(obs).subscribe({
      next: response => {
        console.log(response);
        this.spinner.hide();
      },
      error: err => {
        console.log(err);
        this.spinner.hide();
        this.toastr.error(err);
      }
    });
  }

}
