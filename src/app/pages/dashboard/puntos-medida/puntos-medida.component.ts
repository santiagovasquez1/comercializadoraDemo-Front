import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { KillerAppService } from 'src/app/services/killer-app.service';

@Component({
  selector: 'app-puntos-medida',
  templateUrl: './puntos-medida.component.html'
})
export class PuntosMedidaComponent {
  selectedOption: string;
  options = [ 'Option 1', 'Option 2', 'Option 3' ];
  filterForm: FormGroup;
  dataSource: MatTableDataSource<any>

  displayedColumns: string[] = ['ID', 'area', 'municipio', 'direccion', 'consumo', 'acciones']

  constructor(private fb: FormBuilder,
              private killerAppService: KillerAppService){
    this.dataSource = new MatTableDataSource();
    this.filterForm = this.fb.group({
      option:['']
    });
  }


  ngOnInit() {

    this.getloadInfo();
    
  }


  getloadInfo(){
    this.killerAppService.getloadInfo().subscribe(data => {
      console.log(data.empresas[0].nodes);
      this.dataSource.data = data.empresas[0].nodes;
    });
  }

}
