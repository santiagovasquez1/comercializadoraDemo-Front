import { Time } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { KillerAppService } from 'src/app/services/killer-app.service';
import { TableService } from 'src/app/services/shared/table-service.service';

@Component({
  selector: 'app-puntos-medida',
  templateUrl: './puntos-medida.component.html'
})
export class PuntosMedidaComponent {
  selectedOption: string;
  options = [ 'Option 1', 'Option 2', 'Option 3' ];
  filterForm: FormGroup;
  dataSource: MatTableDataSource<any>

  departamento: string = 'Colombia';

  stateBlue: boolean;
  stateRed: boolean;
  stateGreen: boolean;

  varianzaMinima: number = 20.0;
  varianzaMaxima: number = 28.0;

  areasFilter: string[] = [];
  municipioFilter: string[] = [];

  isFilterMap: boolean =false;

  //filtros
  area: string = '';
  municipio: string = '';
  localId: string = '';
  fecha: Date;
  hora: Time;
  dirLocal: string = '';

  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  @ViewChild('table', { static: true }) table: MatTable<any>;

  displayedColumns: string[] = ['ID', 'area', 'municipio', 'direccion', 'consumo', 'acciones']

  constructor(private fb: FormBuilder,
              private killerAppService: KillerAppService,
              private tableService: TableService,){
    this.dataSource = new MatTableDataSource();
  }


  ngOnInit() {
    this.tableService.setPaginatorTable(this.paginator);
    this.initFilterForm();
    this.getloadInfo();
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

    this.killerAppService.getloadInfo().subscribe({
      next: (data) => {
        let dataArray = [];
        let arrayMap = [];
  
        dataArray = data.empresas[0].nodes;

        dataArray.map(obj => {
          obj.nodes.map(nodo => {
            arrayMap.push({nameArea: obj.name, localId: nodo.name, dirLocal:nodo.direccion, nameMunicipio: nodo.municipio,nameDpto:nodo.departamento, consumo:nodo.information[nodo.information.length-1].potencia});
          });
        });

        this.area = this.filterForm.get('Area').value;
        this.municipio = this.filterForm.get('Municipio').value;
        this.localId = this.filterForm.get('ID').value;
        this.fecha = this.filterForm.get('Fecha').value;
        this.hora = this.filterForm.get('Hora').value;
        this.dirLocal = this.filterForm.get('Direccion').value;
    
        let resultArray = arrayMap;
        
        if(this.isFilterMap){
          resultArray = this.filterTable('nameDpto',this.departamento,resultArray,true);
          this.filterForm.reset();
          this.initFilterForm()
          
        }
        else{

          let result = resultArray.filter(item => item.nameMunicipio === this.municipio);
          this.departamento = result[0]?.nameDpto
          this.departamento = this.departamento !== undefined||null||'' ? this.departamento = result[0].nameDpto: 'Colombia';
          
          resultArray = this.filterTable('nameArea',this.area,resultArray,false);
          resultArray = this.filterTable('nameMunicipio',this.municipio,resultArray,false);
          resultArray = this.filterTable('dirLocal',this.dirLocal,resultArray,false);
          resultArray = this.filterTable('localId',this.localId,resultArray,false);
        }

        this.dataSource.data = resultArray;
        this.dataSource.paginator = this.paginator;
        this.table.renderRows();

        this.getInfoFiltros();

        
  
      }, error: (error) => {
        console.log("Error! ",error.message)
      }
    })



  }

  onFilter(){
    this.isFilterMap = false;
    this.getloadInfo();
  }


  filterTable(columFilter: string, valueFilter: any, array: any[], useLowerCase: boolean){
    let arrayFiltered = [];
    
    if(useLowerCase){
      arrayFiltered = valueFilter !== ''&& valueFilter !== 'todos'&& valueFilter !== 'todas' ? array.filter(item => item[columFilter].toLowerCase() == valueFilter.toLowerCase()) : array;
    }
    else{
      arrayFiltered = valueFilter !== ''&& valueFilter !== 'todos'&& valueFilter !== 'todas' ? array.filter(item => item[columFilter].toLowerCase() == valueFilter.toLowerCase()) : array;
      
    }

    return arrayFiltered;
  }

  getInfoFiltros(){

    this.dataSource.data.map(obj => {
      if(!this.areasFilter.includes(obj.nameArea) ){
        this.areasFilter.push(obj.nameArea);
      }
    });

    this.dataSource.data.map(obj => {
      if(!this.municipioFilter.includes(obj.nameMunicipio)){
        this.municipioFilter.push(obj.nameMunicipio);
      }
    });

  }

  changeDpto(newItem: string){
    this.departamento = newItem;
    this.isFilterMap = true;
    this.getloadInfo();

    
  }


}
