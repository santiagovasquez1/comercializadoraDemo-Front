import { OrganizationDto } from './../../models/OrganizationDto';
import { ToastrService } from 'ngx-toastr';
import { KillerAppService } from 'src/app/services/killer-app.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { GetGeneralDataRequest } from 'src/app/models/GetGeneralDataRequest';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-detalle-organizacion',
  templateUrl: './detalle-organizacion.component.html',
  styles: [
  ]
})
export class DetalleOrganizacionComponent implements OnInit {
  request: GetGeneralDataRequest;
  organizationConsumo: OrganizationDto;
  organizationPromedio: OrganizationDto;

  constructor(private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private loadInformationService: KillerAppService,
    private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.spinner.show();
    this.route.params.pipe(
      switchMap(params => {
        const generalData = atob(params.GeneralData);
        this.request = JSON.parse(generalData) as GetGeneralDataRequest;
        let obs: Observable<OrganizationDto[]>[] = [];
        obs.push(this.loadInformationService.GetConsumoByTimeStamp(this.request));
        obs.push(this.loadInformationService.GetPromedioConsumoByTimeStamp(this.request));
        return forkJoin(obs);
      })
    ).subscribe({
      next: data => {
        this.organizationConsumo = data[0][0];
        this.organizationPromedio = data[1][0];
        console.log(this.organizationConsumo);
        console.log(this.organizationPromedio);
        this.spinner.hide();
      },
      error: err => {
        console.log(err);
        this.toastr.error(err, 'Error');
      }
    })
  }
}
