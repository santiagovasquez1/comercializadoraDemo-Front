import { InformationDetalle } from './../../models/informationDetalle';
import { SetChartOptionsService } from './../../services/set-chart-options.service';
import { MedidorModel } from './../../models/MedidorModel';
import { InformationModel } from './../../models/InformationModel';
import { OrganizationModel } from './../../models/OrganizationModel';
import { ToastrService } from 'ngx-toastr';
import { KillerAppService } from 'src/app/services/killer-app.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ETypesOrganizations, GetGeneralDataRequest } from 'src/app/models/GetGeneralDataRequest';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  title: string = '';
  request: GetGeneralDataRequest;
  organizationConsumoTimeStamp: OrganizationModel;
  organizationConsumoHistorico: OrganizationModel;
  consumoDia: OrganizationModel;
  pronosticoDia: OrganizationModel;
  columnsTableConsumo: string[] = ['tipo', 'coste', 'energiaActiva', 'energiaReactiva', 'costoActiva', 'costoReactiva', 'valorTotal'];
  columnsTableInfo: string[] = ['referencia', 'tipo', 'marca', 'icon'];
  dataTableConsumo: MatTableDataSource<InformationDetalle>;
  dataTableInformation: MatTableDataSource<MedidorModel>;
  datePicker: string;
  fechaFiltro: Date;

  lineChartOptions: ChartConfiguration['options'];
  consumoMesChartOptions: ChartConfiguration['options'];
  consumoActualChart: ChartType = 'line';
  consumoActualData: ChartData<'line'>;

  energiaReactivaData: ChartData<'line'>;

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
          },
          textAlign: 'left',
        },

      }
    },

  }

  constructor(private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private loadInformationService: KillerAppService,
    private toastr: ToastrService,
    private setChartsOptionsService: SetChartOptionsService) {
    this.dataTableConsumo = new MatTableDataSource();
    this.dataTableInformation = new MatTableDataSource();
    const now = new Date();
    this.fechaFiltro = new Date(2023, 1, 1, now.getHours() - 5, now.getMinutes(), 0);

    this.lineChartOptions = this.setChartsOptionsService.setLineChartOption({
      xAxisTitle: 'Hora',
      yAxisTitle: 'Consumo kWh',
      layoutPosition: 'bottom'
    });

    this.consumoMesChartOptions = this.setChartsOptionsService.setLineChartOption({
      xAxisTitle: 'Dia',
      yAxisTitle: 'kVarh',
      layoutPosition: 'bottom',
      displayLegend: false,
      lineTension: 0.1
    });
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

        switch (this.request.TypeOfOrganization) {
          case ETypesOrganizations.Local:
            this.title = 'Detalle medidor';
            break;
          case ETypesOrganizations.Area:
            this.title = 'Detalle área';
            break;
        }

        this.consumoDia = data[0];
        this.pronosticoDia = data[1];
        this.organizationConsumoHistorico = data[2];
        this.organizationConsumoTimeStamp = data[3];
        this.setConsumoData();

        if (this.organizationConsumoTimeStamp.medidorModel) {
          this.dataTableInformation.data = [this.organizationConsumoTimeStamp.medidorModel];
        }

        this.setChartData([this.consumoDia, this.pronosticoDia])
        this.setPotenciaReactivaData([this.consumoDia, this.pronosticoDia]);
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

  private setConsumoData() {
    const informationDia = this.organizationConsumoTimeStamp.information.map(i => {
      const { fecha, precioActiva, energiaActivaAcumuladaDia, energiaReactivaAcumuladaDia, costoActivaAcumuladoDia, costoReactivaAcumuladoDia } = i;
      const information: InformationDetalle = {
        tipo: 'Día',
        fecha,
        precio: precioActiva,
        energiaActiva: energiaActivaAcumuladaDia,
        energiaReactiva: energiaReactivaAcumuladaDia,
        costoActiva: costoActivaAcumuladoDia,
        costoReactiva: costoReactivaAcumuladoDia,
        costoTotal: costoActivaAcumuladoDia + costoReactivaAcumuladoDia
      };
      return information;
    })[0];

    const informationMes = this.organizationConsumoTimeStamp.information.map(i => {
      const { fecha, precioActiva, energiaActivaAcumuladoMes, costoActivaAcumuladoMes, energiaReactivaAcumuladoMes, costoReactivaAcumuladoMes } = i;
      const information: InformationDetalle = {
        tipo: 'Mes',
        fecha,
        precio:precioActiva,
        energiaActiva: energiaActivaAcumuladoMes,
        energiaReactiva: energiaReactivaAcumuladoMes,
        costoActiva: costoActivaAcumuladoMes,
        costoReactiva: costoReactivaAcumuladoMes,
        costoTotal: costoActivaAcumuladoMes + costoReactivaAcumuladoMes
      };
      return information;
    })[0];

    this.dataTableConsumo.data = [informationDia, informationMes];
  }

  private setChartData(data: OrganizationModel[]) {
    const consumoActualData: number[] = data[0].information.map(i => i.potenciaActiva);
    const consumoPromedioData: number[] = data[1].information.map(i => i.potenciaActiva);
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
          label: 'Tiempo real',
          pointStyle: false,
          backgroundColor: '#FF0909'
        }, {
          data: consumoPromedioData,
          fill: false,
          borderColor: '#0C00FF',
          label: 'Pronóstico',
          pointStyle: false,
          backgroundColor: '#0C00FF'
        }
      ],
      labels: labels
    }
  }

  private setPotenciaReactivaData(data: OrganizationModel[]) {
    const consumoActualData: number[] = data[0].information.map(i => i.potenciaReactiva);
    const labels = data[0].information.map(i => {
      const tempDate = moment(i.fecha).format('HH:mm')
      return tempDate;
    });

    this.energiaReactivaData = {
      datasets: [
        {
          data: consumoActualData,
          fill: false,
          borderColor: '#00FF87',
          label: 'Tiempo real',
          pointStyle: false,
          pointBackgroundColor: '#00FF87',
          backgroundColor: '#00FF87'
        }
      ],
      labels: labels
    }
  }

  onDatePickerChange() {
    const now = new Date();
    this.fechaFiltro = new Date(this.datePicker);
    this.fechaFiltro.setHours(now.getHours() - 5, now.getMinutes(), 0);
    this.fechaFiltro.setDate(this.fechaFiltro.getDate() - 1)

    const tempInformation = this.organizationConsumoHistorico.information.filter(x => {
      const tempFecha = moment(x.fecha);
      const fechaFiltro = moment(this.fechaFiltro);
      if (tempFecha.isSameOrAfter(fechaFiltro)) {
        return true;
      }
      return false
    });

    const tempOrganization: OrganizationModel = {
      name: this.organizationConsumoHistorico.name,
      information: tempInformation,
      departamento: this.organizationConsumoHistorico.departamento,
      direccion: this.organizationConsumoHistorico.direccion,
      medidorModel: this.organizationConsumoHistorico.medidorModel,
      municipio: this.organizationConsumoHistorico.municipio,
      nodes: this.organizationConsumoHistorico.nodes,
      parent: this.organizationConsumoHistorico.parent
    }

    if (tempInformation.length > 0) {
      this.setConsumoMesChartData(tempOrganization);
    } else {
      this.setConsumoMesChartData(this.organizationConsumoHistorico)
    }
  }

  private setConsumoMesChartData(data: OrganizationModel) {
    const consumoMesData: number[] = data.information.map(i => i.potenciaActiva);
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
          backgroundColor: 'rgba(114, 107, 255, 0.5)',
          pointBackgroundColor: '#726BFF'
        }
      ],
      labels: labels
    }
  }

  private setPorcentajesData(organizacionActual: OrganizationModel, Cluster: OrganizationModel) {
    const consumoResto = Cluster.information[0].energiaActivaAcumuladaDia - organizacionActual.information[0].energiaActivaAcumuladaDia;
    this.porcentajeConsumoData = {
      datasets: [{
        data: [organizacionActual.information[0].energiaActivaAcumuladaDia, consumoResto],
        backgroundColor: ["#0C00FF", "#FF0909"]
      }],
      labels: [['Medidor', 'actual'], ['Resto de los', 'medidores']]
    }
  }

  onVolver() {
    this.router.navigate(['/main/puntos-medida']);
  }
}
