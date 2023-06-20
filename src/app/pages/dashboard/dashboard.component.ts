import { StatusMonitor } from './../../models/StatusMonitor';
import { OrganizationDto } from './../../models/OrganizationDto';
import { ETypesOrganizations, GetGeneralDataRequest } from './../../models/GetGeneralDataRequest';
import { Observable, Subscription, forkJoin, timer } from 'rxjs';
import { OrganizationModel } from './../../models/OrganizationModel';
import { NgxSpinnerService } from 'ngx-spinner';
import { KillerAppService } from './../../services/killer-app.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import moment from 'moment';
import { selectCustom } from 'src/app/models/select-custom';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {

  rootOrganizations: OrganizationDto;
  statusMonitor: StatusMonitor;
  localOrganizations: OrganizationDto[];
  fechaConsulta: Date;

  selectedArea: string = '---';
  selectedLocal: string = '---';

  consumoDia: OrganizationModel;
  pronosticoDia: OrganizationModel;
  consumoActualChart: ChartType = 'line';
  consumoActualData: ChartData<'line'>;

  timer$: Observable<any>;
  timerSubscription: Subscription;

  dataAreaSelect: selectCustom = {};
  dataMedidorSelect: selectCustom = {};

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
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
  ) {
    const now = new Date();
    this.fechaConsulta = new Date(2023, 1, 24, now.getHours() - 5, now.getMinutes(), 0);
    this.timer$ = timer(0, 900000)
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.loadOrganizations();
  }

  private loadOrganizations() {
    this.spinner.show();
    this.infoService.getOrganizations().subscribe({
      next: response => {
        this.rootOrganizations = response[0];

        this.setSelectAreas('---', this.rootOrganizations.nodes.map(node => node.name), this.selectedArea, false);

        if(this.localOrganizations){

          this.setSelectMedidores('---',this.localOrganizations.map(node => node.name),this.selectedLocal,false);

        }
        else{

          this.setSelectMedidores('---',null,this.selectedLocal,true)

        }


        this.spinner.hide();
        this.loadData();
        this.monitoreoByTimeStamp();
        this.timerSubscription = this.timer$.subscribe(() => this.monitoreoByTimeStamp());
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
        fechaConsulta: this.fechaConsulta
      }
      request.TypeOfOrganization = this.setTypeOrganizationForQuery(request);

      let obs: Observable<OrganizationModel>[] = [];
      obs.push(this.infoService.getConsumoDia(request));
      obs.push(this.infoService.getPronosticoDia(request));

      forkJoin(obs).subscribe({
        next: response => {
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

  private monitoreoByTimeStamp() {
    if (this.rootOrganizations) {
      this.spinner.show();
      const request: GetGeneralDataRequest = {
        empresaName: this.rootOrganizations.name,
        TypeOfOrganization: ETypesOrganizations.Empresa,
        fechaConsulta: this.fechaConsulta
      }
      this.infoService.monitoreoByTimeStamp(request).subscribe({
        next: data => {
          this.statusMonitor = data;
          this.spinner.hide();
          console.log(this.statusMonitor);
        },
        error: err => {
          console.log(err);
          this.spinner.hide();
          this.toastr.error(err);
        }
      })
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

  onAreaSelected(data: string){
    this.selectedArea = data;

    if (this.selectedArea !== '---') {
      this.localOrganizations = this.rootOrganizations.nodes.find(n => n.name == this.selectedArea).nodes;
      this.selectedLocal = '---';

      this.setSelectMedidores('---',this.localOrganizations.map(node => node.name),this.selectedLocal,false);

    } else {

      this.setSelectMedidores('---',null,'---',true)

      this.localOrganizations = null
    }

    this.setSelectAreas('---', this.rootOrganizations.nodes.map(node => node.name), this.selectedArea, false);

    

    this.loadData();
  }

  onMedidorSelected(data: string){
    this.selectedLocal = data;

    this.setSelectMedidores('---',this.localOrganizations.map(node => node.name),this.selectedLocal,false)

    this.loadData();
    
  }

  setSelectMedidores(_defaultValue: string, _stringOptions: any[], _currentValue: string, _disabled){

    let medidores: selectCustom = {
      title: 'Medidores',
      defaultValue: _defaultValue,
      stringOptions: _stringOptions,
      currentValue: _currentValue,
      disabled: _disabled
    }

    this.dataMedidorSelect = medidores;

  }

  setSelectAreas(_defaultValue: string, _stringOptions: any[], _currentValue: string, _disabled){

    let areas: selectCustom = {
      title: 'Area',
      defaultValue: _defaultValue,
      stringOptions: _stringOptions,
      currentValue: _currentValue,
      disabled: _disabled
    }
    this.dataAreaSelect = areas;
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
