import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
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

  stateBlue: boolean;
  stateRed: boolean;
  stateGreen: boolean;

  @ViewChild('paginator', { static: true }) paginator: MatPaginator;

  displayedColumns: string[] = ['ID', 'area', 'municipio', 'direccion', 'consumo', 'acciones']

  constructor(private fb: FormBuilder,
              private killerAppService: KillerAppService,
              private tableService: TableService,){
    this.dataSource = new MatTableDataSource();
    this.filterForm = this.fb.group({
      option:['']
    });
  }


  ngOnInit() {
    this.tableService.setPaginatorTable(this.paginator);
    this.getloadInfo();
    
    
  }


  getloadInfo(){
    this.killerAppService.getloadInfo().subscribe(data => {

      let dataArray = []
      let arrayAuxiliar = []
      dataArray = data.empresas[0].nodes;

      
      dataArray.map(obj => {
        obj.nodes.map(nodo => {
          arrayAuxiliar.push({nameArea: obj.name, nameNodo: nodo.name, dirNodo:nodo.direccion, municipioNodo: nodo.municipio,consumo:nodo.information[nodo.information.length-1].potencia});
        });
      });

      this.dataSource.data = arrayAuxiliar;
      this.dataSource.paginator = this.paginator;

  
      console.log("NUEVO ARRAY: ",this.dataSource.data)
    });


  }

}
