import { OrganizationDto } from './../../models/OrganizationDto';
import { ETypesOrganizations, GetGeneralDataRequest } from './../../models/GetGeneralDataRequest';
import { Observable, forkJoin } from 'rxjs';
import { OrganizationModel } from './../../models/OrganizationModel';
import { NgxSpinnerService } from 'ngx-spinner';
import { KillerAppService } from './../../services/killer-app.service';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import * as moment from 'moment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  rootOrganizations: OrganizationDto;
  localOrganizations: OrganizationDto[];

  selectedArea: string = '---';
  selectedLocal: string = '---';

  consumoDia: OrganizationModel;
  pronosticoDia: OrganizationModel;
  consumoActualChart: ChartType = 'line';
  consumoActualData: ChartData<'line'>;

  request: GetGeneralDataRequest;

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    elements: {
      line: {
        tension: 0.5
      },
      point: {
        pointStyle: false
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Hora'
        },
        ticks: {
          autoSkip: true,
          align: 'start',
          autoSkipPadding: 15
        }
      },
      y: {
        beginAtZero: true,
        position: 'left',
        title: {
          display: true,
          text: 'Consumo kWh'
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 16,
            family: 'Poppins'
          }
        }
      }
    }
  }

  constructor(private infoService: KillerAppService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadOrganizations();
  }

  private loadOrganizations() {
    this.spinner.show();
    this.infoService.getOrganizations().subscribe({
      next: response => {
        this.rootOrganizations = response[0];
        this.spinner.hide();
        this.loadData();
      },
      error: err => {
        console.log(err);
        this.spinner.hide();
        this.toastr.error(err);
      }
    })
  }

  private loadData() {
    
    if (this.rootOrganizations !== null) {
      this.spinner.show();
      let request: GetGeneralDataRequest = {
        empresaName: this.rootOrganizations.name,
        areaName: this.selectedArea != '---' && this.selectedArea !== null && this.selectedArea !== '' ? this.selectedArea : null,
        localName: this.selectedLocal != '---' && this.selectedLocal !== null && this.selectedLocal !== '' ? this.selectedLocal : null,
        fechaConsulta: new Date()
      }
      request.TypeOfOrganization = this.setTypeOrganizationForQuery(request);

      let obs: Observable<OrganizationModel>[] = [];
      obs.push(this.infoService.getConsumoDia(request));
      obs.push(this.infoService.getPronosticoDia(request));

      forkJoin(obs).subscribe({
        next: response => {
          console.log(response);
          this.setChartData(response);
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

  onAreaChange() {
    if (this.selectedArea !== '---') {
      this.localOrganizations = this.rootOrganizations.nodes.find(n => n.name == this.selectedArea).nodes;
      this.selectedLocal = '---';
    } else {
      this.localOrganizations = null
    }
    this.loadData();
  }

  onLocalChange() {    
    this.loadData();
  }

  private setChartData(data: OrganizationModel[]) {
    const consumoActualData: number[] = data[0].information.map(i => i.potencia);
    const consumoPromedioData: number[] = data[1].information.map(i => i.potencia);
    const labels = data[0].information.map(i => {
      const tempDate = moment(i.fecha).format('HH:mm')
      return tempDate;
    });

    this.consumoActualData = {
      datasets: [
        {
          data: consumoActualData,
          fill: false,
          borderColor: '#FF0909',
          label: 'Tiempo real'
        }, {
          data: consumoPromedioData,
          fill: false,
          borderColor: '#0C00FF',
          label: 'Pronóstico'
        }
      ],
      labels: labels
    }
  }

  private setTypeOrganizationForQuery(request: GetGeneralDataRequest): ETypesOrganizations {
    if (request.empresaName !== null && request.areaName !== null && request.localName !== null) {
      return ETypesOrganizations.Local;
    } else if (request.empresaName !== null && request.areaName !== null) {
      return ETypesOrganizations.Area;
    } else {
      return ETypesOrganizations.Empresa;
    }
  }
}
