import { OrganizationModel } from './../../../models/OrganizationModel';
import { Router } from '@angular/router';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { KillerAppService } from 'src/app/services/killer-app.service';
import { OrganizationDto } from 'src/app/models/OrganizationDto';
import { NgxSpinnerService } from 'ngx-spinner';
import { ETypesOrganizations, GetGeneralDataRequest } from 'src/app/models/GetGeneralDataRequest';
import { ToastrService } from 'ngx-toastr';
import { TablaMedidores } from 'src/app/models/TablaMedidores';
import { forkJoin, map, Observable } from 'rxjs';
import moment from 'moment';
import { StatusMonitor } from 'src/app/models/StatusMonitor';
import { TableService } from 'src/app/services/shared/table-service.service';
import { selectCustom } from 'src/app/models/select-custom';



@Component({
  selector: 'app-puntos-medida',
  templateUrl: './puntos-medida.component.html'
})
export class PuntosMedidaComponent {
  rootOrganizations: OrganizationDto;
  statusMonitor: StatusMonitor;
  fechaHora: Date;

  horaUltimaDatos: string;
  fechaUltimaDatos: string;
  // currentTime: string;

  selectedOption: string;
  options = ['Option 1', 'Option 2', 'Option 3'];
  filterForm: FormGroup;
  dataSource: MatTableDataSource<any>

  departamento: string = 'Todos';

  organizaciones: OrganizationDto[] = [];

  stateBlue: boolean;
  stateRed: boolean;
  stateGreen: boolean;

  desviacionPorcentaje: number = 0.1;

  areasFilter: string[] = [];
  municipioFilter: string[] = [];
  departamentoFilter: string[] = [];


  isFilterDate: boolean = false;
  isFilterHour: boolean = false;

  pageSize = 5;
  pageCount = 0;
  maxPageNumber = 0;

  //filtros
  area: string = '';
  municipio: string = '';
  localId: string = '';
  fecha: Date;
  hora: string;
  dirLocal: string = '';

  fullData: any[] = [];

  dataMunicipiosSelect: selectCustom = {};
  dataAreaSelect: selectCustom = {};
  dataDepartamentosSelect: selectCustom = {};

  ubicacionMedidores: string = '';

  time = '';

  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  @ViewChild('table', { static: true }) table: MatTable<any>;
  @ViewChild('selectHora') mySelect: ElementRef;

  displayedColumns: string[] = ['ID', 'area', 'municipio', 'direccion', 'potenciaActiva', 'potenciaReactiva', 'acciones']

  constructor(private fb: FormBuilder,
    private killerAppService: KillerAppService,
    private tableService: TableService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private router: Router) {
    this.dataSource = new MatTableDataSource();
    const now = new Date();
    // this.fechaHora = new Date(2023, 1, 24, now.getHours() - 5, now.getMinutes(), 0);
    this.fechaHora = new Date();
    this.fechaHora.setHours(this.fechaHora .getHours() - 5)
  }

  ngOnInit() {
    this.loadOrganizations();
    this.initFilterForm();
  }

  private loadOrganizations() {
    this.spinner.show();
    this.killerAppService.getOrganizations().subscribe({
      next: response => {
        this.rootOrganizations = response[0];
        this.getloadInfo();
        this.spinner.hide();

      },
      error: err => {
        console.log(err);
        this.spinner.hide();
        this.toastr.error(err);
      }
    })
  }

  initFilterForm() {
    this.filterForm = this.fb.group({
      ID: [''],
      Fecha: [''],
      Hora: [''],
      Area: ['todas'],
      Municipio: ['todos'],
      Direccion: ['']
    });
  }
  getloadInfo() {

    this.spinner.show();

    this.localId = this.filterForm.get('ID').value;
    this.fecha = new Date(this.filterForm.get('Fecha').value);
    this.dirLocal = this.filterForm.get('Direccion').value;

    this.hora = this.filterForm.get('Hora').value;
    const hours = parseInt(this.hora.split(":")[0]);
    const minutes = parseInt(this.hora.split(":")[1]);

    this.isFilterDate = this.fecha.toString() == 'Invalid Date' ? false : true;
    this.isFilterHour = this.hora.toString() == '' ? false : true;

    this.fechaHora = this.isFilterDate == true ? this.fecha : this.fechaHora;

    if (this.isFilterHour) {
      this.fechaHora.setHours(hours + 19, minutes);
      this.fechaHora.setDate(this.fechaHora.getDate()-1)
    }

    let request: GetGeneralDataRequest = {
      empresaName: this.rootOrganizations.name,
      areaName: null,
      localName: null,
      fechaConsulta: this.fechaHora
    }
    request.TypeOfOrganization = this.setTypeOrganizationForQuery(request);

    let obs: Observable<any>[] = [];
    obs.push(this.killerAppService.GetConsumoByTimeStamp(request));
    obs.push(this.killerAppService.GetPromedioConsumoByTimeStamp(request));
    obs.push(this.killerAppService.monitoreoByTimeStamp(request).pipe(map(response => <StatusMonitor>response)));

    forkJoin(obs).subscribe({
      next: response => {
        const iteratorConsumos = (response[0] as OrganizationModel).nodes;
        const iteratoPromedios = (response[1] as OrganizationModel).nodes;
        const monitoreoTime = response[2] as StatusMonitor;

        console.log(response[0].nodes[0].nodes[0].information[0].fecha)

        const formatHora = 'h:mm a';
        const dateString = iteratorConsumos[0].nodes[0].information[0].fecha.toLocaleString();

        this.horaUltimaDatos = moment(dateString).format(formatHora);

        const formatDate = 'D/M/YYYY'
        this.fechaUltimaDatos = moment(dateString).format(formatDate);

        let arrayMap: TablaMedidores[] = [];

        iteratorConsumos.forEach(obj => {
          obj.nodes.forEach(nodo => {

            const nodo2 = iteratoPromedios.find(obj2 => obj2.name === obj.name && obj2.nodes.some(n => n.name === nodo.name))?.nodes.find(n => n.name === nodo.name)
            const existingObj = arrayMap.find(
              item => item.nameArea === obj.name && item.localId === nodo.name
            );
            if (!existingObj && nodo2) {
              arrayMap.push({
                nameArea: obj.name,
                localId: nodo.name,
                dirLocal: nodo.direccion,
                nameMunicipio: nodo.municipio,
                nameDpto: nodo.departamento,
                consumo: nodo.information[0].potenciaActiva,
                potenciaActiva: nodo.information[0].potenciaActiva,
                potenciaReactiva: nodo.information[0].potenciaReactiva, 
                statusMonitor: {
                  altoConsumo: nodo2.information[0].potenciaActiva + nodo2.information[0].potenciaActiva * (monitoreoTime.altoConsumo / 100),
                  consumoNormal: nodo2.information[0].potenciaActiva,
                  bajoConsumo: nodo2.information[0].potenciaActiva - nodo2.information[0].potenciaActiva * (monitoreoTime.bajoConsumo / 100)
                }
              });
            }
          });
        });

        let resultArray = arrayMap;
        this.ubicacionMedidores = this.departamento == 'Todos' ? 'Colombia' : this.departamento;

        resultArray = this.filterTable('nameDpto', this.departamento, resultArray, true);
        resultArray = this.filterTable('nameArea', this.area, resultArray, false);
        resultArray = this.filterTable('nameMunicipio', this.municipio, resultArray, false);
        resultArray = this.filterTable('dirLocal', this.dirLocal, resultArray, false);
        resultArray = this.filterTable('localId', this.localId, resultArray, false);

        this.setDataTable(resultArray);
        this.fullData = resultArray;
        
        this.maxPageNumber = Math.ceil(this.fullData.length / this.pageSize);
        this.pageCount = 0;
        this.setDataTable(this.fullData);
        this.table.renderRows();

        this.getInfoFiltros();

        this.spinner.hide();
      },
      error: err => {
        console.log(err);
        this.spinner.hide();
        this.toastr.error(err);
      }
    });
  }

  onFilter() {
    this.getloadInfo();
  }

  filterTable(columFilter: string, valueFilter: any, array: any[], useLowerCase: boolean) {
    let arrayFiltered = [];

    if (useLowerCase) {
      arrayFiltered = valueFilter !== '' && valueFilter !== 'Todos' && valueFilter !== 'Todas' ? array.filter(item => item[columFilter].toLowerCase() == valueFilter.toLowerCase()) : array;
    }
    else {
      arrayFiltered = valueFilter !== '' && valueFilter !== 'Todos' && valueFilter !== 'Todas' ? array.filter(item => item[columFilter].toLowerCase() == valueFilter.toLowerCase()) : array;
    }

    return arrayFiltered;
  }

  getInfoFiltros() {

    this.fullData.map(obj => {
      if (!this.areasFilter.includes(obj.nameArea)) {
        this.areasFilter.push(obj.nameArea);
      }
    });

    this.fullData.map(obj => {
      if (!this.municipioFilter.includes(obj.nameMunicipio)) {
        this.municipioFilter.push(obj.nameMunicipio);
      }
    });

    this.fullData.map(obj => {
      if (!this.departamentoFilter.includes(obj.nameDpto)) {
        this.departamentoFilter.push(obj.nameDpto);
      }
    });

    this.setMunicipioSelect('Todos',this.municipioFilter,this.municipio, false);
    this.setDepartamentoSelect('Todos',this.departamentoFilter,this.departamento, false);
    this.setAreaSelect('Todas',this.areasFilter,this.area, false);
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

  OnVerDetalle(element: TablaMedidores, type: ETypesOrganizations) {
    const req: GetGeneralDataRequest = {
      empresaName: this.rootOrganizations.name,
      areaName: element.nameArea,
      localName: element.localId,
      TypeOfOrganization: type,
      fechaConsulta: isNaN(this.fecha.getTime()) ? this.fechaHora : this.fecha
    };
    const generalData = btoa(JSON.stringify(req));
    this.router.navigate(['/main/puntos-medida/detalle-organizacion', generalData])
  }

  previousPage() {
    this.maxPageNumber = Math.ceil(this.fullData.length / this.pageSize);

    if (this.pageCount > 0) {
      this.pageCount -= 1;
      this.setDataTable(this.fullData);
    }
  }

  nextPage() {
    this.maxPageNumber = Math.ceil(this.fullData.length / this.pageSize);

    if (this.pageCount < this.maxPageNumber - 1) {
      this.pageCount += 1;
      this.setDataTable(this.fullData);
    }
  }

  setPageSize(event: any) {

    this.pageSize = parseInt(event.target.value, 10);
    this.maxPageNumber = Math.ceil(this.fullData.length / this.pageSize);
    this.pageCount = 0;

    this.setDataTable(this.fullData);


  }


  setDataTable(data: any[]) {

    const result = data.slice(this.pageCount * this.pageSize, this.pageSize + (this.pageCount * this.pageSize));

    this.dataSource.data = result;

    this.table.renderRows();

  }

  getPages(): number[] {
    return Array(this.maxPageNumber).fill(0).map((_, i) => i + 1);

  }

  firstPage() {
    this.pageCount = 0;
    this.setDataTable(this.fullData);
  }

  endPage() {
    this.pageCount = this.maxPageNumber - 1;
    this.setDataTable(this.fullData);
  }

  onMunicipioSelected(data: string){
    this.municipio = data;
  }

  onDepartamentoSelected(data: string){
    this.departamento = data;
  }

  onAreaSelected(data: string){
    this.area = data;
  }

  setAreaSelect(_defaultValue: string,_stringOptions: any[],_currentValue: string, _disabled: boolean){

    let areas: selectCustom = {
      title: 'Area',
      defaultValue: _defaultValue,
      stringOptions: _stringOptions,
      currentValue: _currentValue,
      disabled: _disabled
    }
    this.dataAreaSelect = areas;
  }

  setMunicipioSelect(_defaultValue: string,_stringOptions: any[],_currentValue: string, _disabled: boolean){

    let municipios: selectCustom = {
      title: 'Municipios',
      defaultValue: _defaultValue,
      stringOptions: _stringOptions,
      currentValue: _currentValue,
      disabled: _disabled
    }
    this.dataMunicipiosSelect = municipios;
  }

  setDepartamentoSelect(_defaultValue: string,_stringOptions: any[],_currentValue: string, _disabled: boolean){

    let departamento: selectCustom = {
      title: 'Departamentos',
      defaultValue: _defaultValue,
      stringOptions: _stringOptions,
      currentValue: _currentValue,
      disabled: _disabled
    }
    this.dataDepartamentosSelect = departamento;
  }

}
