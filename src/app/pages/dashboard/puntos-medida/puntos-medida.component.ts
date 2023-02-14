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



@Component({
  selector: 'app-puntos-medida',
  templateUrl: './puntos-medida.component.html'
})
export class PuntosMedidaComponent {
  rootOrganizations: OrganizationDto;
  statusMonitor: StatusMonitor;
  fechaHora: Date;

  horaUltimaDatos: string;
  // currentTime: string;

  selectedOption: string;
  options = ['Option 1', 'Option 2', 'Option 3'];
  filterForm: FormGroup;
  dataSource: MatTableDataSource<any>

  departamento: string = 'Colombia';

  organizaciones: OrganizationDto[] = [];

  stateBlue: boolean;
  stateRed: boolean;
  stateGreen: boolean;

  desviacionPorcentaje: number = 0.1;
  varianzaMinima: number = 80.0;
  varianzaMaxima: number = 90.0;

  areasFilter: string[] = [];
  municipioFilter: string[] = [];

  isFilterMap: boolean = false;

  isFilterDate: boolean = false;
  isFilterHour: boolean = false;

  pageSize = 2;
  pageCount = 0;
  maxPageNumber = 0;

  //filtros
  area: string = '';
  municipio: string = '';
  localId: string = '';
  fecha: Date;
  hora: string;
  dirLocal: string = '';

  fullData: any[] = []


  time = '';

  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  @ViewChild('table', { static: true }) table: MatTable<any>;
  @ViewChild('selectHora') mySelect: ElementRef;

  displayedColumns: string[] = ['ID', 'area', 'municipio', 'direccion', 'consumo', 'acciones']

  constructor(private fb: FormBuilder,
    private killerAppService: KillerAppService,
    private tableService: TableService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private router: Router) {
    this.dataSource = new MatTableDataSource();
    const now = new Date();
    this.fechaHora = new Date(2023, 1, 24, now.getHours() - 5, now.getMinutes(), 0);
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

  getloadInfo(){

    this.spinner.show();

    this.area = this.filterForm.get('Area').value;
    this.municipio = this.filterForm.get('Municipio').value;
    this.localId = this.filterForm.get('ID').value;
    this.fecha = new Date(this.filterForm.get('Fecha').value);
    this.dirLocal = this.filterForm.get('Direccion').value;

    this.hora = this.filterForm.get('Hora').value;
    const hours = parseInt(this.hora.split(":")[0]);
    const minutes = parseInt(this.hora.split(":")[1]);

    if (!this.isFilterMap) {
      this.isFilterDate = this.fecha.toString() == 'Invalid Date' ? false : true;
      this.isFilterHour = this.hora.toString() == '' ? false : true;
    }
    else {
      this.isFilterDate = false;
      this.isFilterHour = false;
    }

    this.fechaHora = this.isFilterDate == true ? this.fecha : this.fechaHora;

    if (this.isFilterHour) {

      this.fechaHora.setHours(hours + 19, minutes);
    }

    console.log("this.fechaHora: ",this.fechaHora)

    let request: GetGeneralDataRequest = {
      empresaName: this.rootOrganizations.name,
      areaName: null,
      localName: null,
      fechaConsulta: this.fechaHora
    }
    request.TypeOfOrganization = this.setTypeOrganizationForQuery(request);

    let obs: Observable<any>[] = [];
    obs.push(this.killerAppService.GetConsumoByTimeStamp(request).pipe(map(response => <OrganizationDto[]>response)));
    obs.push(this.killerAppService.GetPromedioConsumoByTimeStamp(request).pipe(map(response => <OrganizationDto[]>response)));
    obs.push(this.killerAppService.monitoreoByTimeStamp(request).pipe(map(response => <StatusMonitor>response)));
    
    
    

    forkJoin(obs).subscribe({
      next: response => {

        const iteratorConsumos = response[0];
        const iteratoPromedios = response[1];
        const monitoreoTime = response[2];

        const format = 'h:mm a';
        const dateString = iteratorConsumos[0].nodes[0].information[0].fecha.toLocaleString();

        this.horaUltimaDatos = moment(dateString).format(format);


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
                consumo: nodo.information[0].potencia,
                statusMonitor: {
                  altoConsumo: nodo2.information[0].potencia + nodo2.information[0].potencia * (monitoreoTime.altoConsumo/100),
                  consumoNormal: nodo2.information[0].potencia,
                  bajoConsumo: nodo2.information[0].potencia - nodo2.information[0].potencia * (monitoreoTime.bajoConsumo/100)
                }
              });
            }
          });
        });
        
        let resultArray = arrayMap;

        if (this.isFilterMap) {
          resultArray = this.filterTable('nameDpto', this.departamento, resultArray, true);

          this.filterForm.reset();
          this.initFilterForm()

        }
        else {

          let result = resultArray.filter(item => item.nameMunicipio === this.municipio);
          this.departamento = result[0]?.nameDpto
          this.departamento = this.departamento !== undefined || null || '' ? this.departamento = result[0].nameDpto : 'Colombia';

          resultArray = this.filterTable('nameArea', this.area, resultArray, false);
          resultArray = this.filterTable('nameMunicipio', this.municipio, resultArray, false);
          resultArray = this.filterTable('dirLocal', this.dirLocal, resultArray, false);
          resultArray = this.filterTable('localId', this.localId, resultArray, false);

        }

        this.setDataTable(resultArray);
        // this.dataSource.data = resultArray;


        this.fullData = resultArray;
        this.maxPageNumber = Math.ceil(this.fullData.length / this.pageSize);
        this.pageCount = 0;
        this.setDataTable(this.fullData);

        // this.dataSource.paginator = this.paginator;
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
    this.isFilterMap = false;
    this.getloadInfo();
  }


  filterTable(columFilter: string, valueFilter: any, array: any[], useLowerCase: boolean) {
    let arrayFiltered = [];

    if (useLowerCase) {
      arrayFiltered = valueFilter !== '' && valueFilter !== 'todos' && valueFilter !== 'todas' ? array.filter(item => item[columFilter].toLowerCase() == valueFilter.toLowerCase()) : array;
    }
    else {
      arrayFiltered = valueFilter !== '' && valueFilter !== 'todos' && valueFilter !== 'todas' ? array.filter(item => item[columFilter].toLowerCase() == valueFilter.toLowerCase()) : array;

    }

    return arrayFiltered;
  }

  getInfoFiltros() {

    this.dataSource.data.map(obj => {
      if (!this.areasFilter.includes(obj.nameArea)) {
        this.areasFilter.push(obj.nameArea);
      }
    });

    this.dataSource.data.map(obj => {
      if (!this.municipioFilter.includes(obj.nameMunicipio)) {
        this.municipioFilter.push(obj.nameMunicipio);
      }
    });

  }

  changeDpto(newItem: string) {
    this.departamento = newItem;
    this.isFilterMap = true;

    this.pageCount = 0;
    this.setDataTable(this.fullData);

    this.getloadInfo();
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

  OnVerDetalle(element: TablaMedidores) {
    console.log(element);
    const req: GetGeneralDataRequest = {
      empresaName: this.rootOrganizations.name,
      areaName: element.nameArea,
      localName: element.localId,
      TypeOfOrganization: ETypesOrganizations.Local,
      fechaConsulta: isNaN(this.fecha.getTime()) ? this.fechaHora : this.fecha
    };
    const generalData = btoa(JSON.stringify(req));
    this.router.navigate(['/main/puntos-medida/detalle-organizacion', generalData])
  }

  previousPage(){
    this.maxPageNumber = Math.ceil(this.fullData.length / this.pageSize);

    if(this.pageCount > 0 ){
      this.pageCount -= 1;
      this.setDataTable(this.fullData);
    }
  }

  nextPage(){
    this.maxPageNumber = Math.ceil(this.fullData.length / this.pageSize);

    if(this.pageCount < this.maxPageNumber-1 ){
      this.pageCount += 1;
      this.setDataTable(this.fullData);
    }
  }

  setPageSize(event: any){
    
    this.pageSize = parseInt(event.target.value, 10);
    this.maxPageNumber = Math.ceil(this.fullData.length / this.pageSize);
    this.pageCount = 0;

    this.setDataTable(this.fullData);
    

  }


  setDataTable(data: any[]){
    
    const result = data.slice(this.pageCount*this.pageSize, this.pageSize+(this.pageCount*this.pageSize));

    this.dataSource.data = result;

    this.table.renderRows();

  }

  getPages(): number[] {
    return Array(this.maxPageNumber).fill(0).map((_, i) => i + 1);

  }

  firstPage(){
    this.pageCount = 0;
    this.setDataTable(this.fullData);
  }

  endPage(){
    this.pageCount = this.maxPageNumber-1;
    this.setDataTable(this.fullData);
  }

}
