import { InformationModel } from './../../models/InformationModel';
import { OrganizationModel } from './../../models/OrganizationModel';
import { ToastrService } from 'ngx-toastr';
import { KillerAppService } from 'src/app/services/killer-app.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ETypesOrganizations, GetGeneralDataRequest } from 'src/app/models/GetGeneralDataRequest';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, Observable, forkJoin } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import moment from 'moment';

@Component({
  selector: 'app-detalle-organizacion',
  templateUrl: './detalle-organizacion.component.html',
  styles: [
  ]
})
export class DetalleOrganizacionComponent implements OnInit {
  request: GetGeneralDataRequest;
  organizationConsumoTimeStamp: OrganizationModel;
  organizationConsumoHistorico: OrganizationModel;
  consumoDia: OrganizationModel;
  pronosticoDia: OrganizationModel;
  columnsTableConsumo: string[] = ['coste', 'consumoEnergia', 'valorDia', 'valorMes'];
  columnsTableInfo: string[] = ['referencia', 'tipo', 'marca', 'icon'];
  dataTableConsumo: MatTableDataSource<InformationModel>;
  dataTableInformation: MatTableDataSource<OrganizationModel>;

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0.1
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

  consumoMesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0.5
      },
      point: {
        pointStyle: 'circle',
        backgroundColor: '#726BFF',
        borderColor: 'red',
        hoverBackgroundColor: 'black',

      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Dia'
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
        display: false
      }
    },

  }

  consumoActualChart: ChartType = 'line';
  consumoActualData: ChartData<'line'>;

  consumoMesChart: ChartType = 'line'
  consumoMesData: ChartData<'line'>;

  porcentajeConsumoChart: ChartType = 'doughnut';
  porcentajeConsumoData: ChartData<'doughnut'>;

  porcentajeConsumoOptions: ChartConfiguration['options'] = {
    maintainAspectRatio: false,
    responsive: true,
    elements: {
      arc: {
        offset: 15,
      }
    },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 16,
            family: 'Poppins'
          }
        }
      }
    }
  }

  constructor(private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private loadInformationService: KillerAppService,
    private toastr: ToastrService) {
    this.dataTableConsumo = new MatTableDataSource();
    this.dataTableConsumo = new MatTableDataSource();
  }

  ngOnInit(): void {
    this.spinner.show();
    this.route.params.pipe(
      switchMap(params => {
        const generalData = atob(params.GeneralData);
        this.request = JSON.parse(generalData) as GetGeneralDataRequest;
        let obs: Observable<OrganizationModel>[] = [];
        obs.push(this.loadInformationService.getConsumoDia(this.request));
        obs.push(this.loadInformationService.getPronosticoDia(this.request));
        obs.push(this.loadInformationService.getTotalHistorico(this.request));
        obs.push(this.loadInformationService.GetConsumoByTimeStamp(this.request));

        //Energia consumida total de la empresa
        obs.push(this.loadInformationService.GetConsumoByTimeStamp({
          empresaName: this.request.empresaName,
          fechaConsulta: this.request.fechaConsulta,
          TypeOfOrganization: ETypesOrganizations.Empresa
        }));
        return forkJoin(obs);
      })
    ).subscribe({
      next: data => {
        this.consumoDia = data[0];
        this.pronosticoDia = data[1];
        this.organizationConsumoHistorico = data[2];
        this.organizationConsumoTimeStamp = data[3];
        this.dataTableConsumo.data = [this.organizationConsumoTimeStamp.information[0]];
        this.setChartData([this.consumoDia, this.pronosticoDia])
        this.setConsumoMesChartData(this.organizationConsumoHistorico);
        this.setPorcentajesData(this.organizationConsumoTimeStamp, data[4]);
        this.spinner.hide();
      },
      error: err => {
        console.log(err);
        this.toastr.error(err, 'Error');
        this.spinner.hide();
      }
    })
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

  private setConsumoMesChartData(data: OrganizationModel) {
    const consumoMesData: number[] = data.information.map(i => i.potencia);
    const labels = data.information.map(i => {
      const tempData = moment(i.fecha).format('MM/DD')
      return tempData
    });

    this.consumoMesData = {
      datasets: [
        {
          data: consumoMesData,
          fill: true,
          borderColor: '#726BFF',
          backgroundColor: '#726BFF',
          pointBackgroundColor: '#726BFF'
        }
      ],
      labels: labels
    }
  }

  private setPorcentajesData(organizacionActual: OrganizationModel, Cluster: OrganizationModel) {
    const consumoResto = Cluster.information[0].energiaAcumuladaDia - organizacionActual.information[0].energiaAcumuladaDia;
    this.porcentajeConsumoData = {
      datasets: [{
        data: [organizacionActual.information[0].energiaAcumuladaDia, consumoResto],
        backgroundColor: ["#0C00FF", "#FF0909"]
      }],
      labels: ['Medidor actual', 'Resto de los medidores']
    }
  }
}
