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

  rootOrganizations: OrganizationModel[];
  consumoDia: OrganizationModel;
  pronosticoDia: OrganizationModel;
  consumoActualChart: ChartType = 'line';
  consumoActualData: ChartData<'line'>;
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
        }
      },
      y: {
        beginAtZero: true,
        position: 'left',
        title: {
          display: true,
          text: 'Consumo kWh'
        },
        ticks: {
          stepSize: 60
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

}
