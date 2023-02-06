import { Component } from '@angular/core';

@Component({
  selector: 'app-puntos-medida',
  templateUrl: './puntos-medida.component.html'
})
export class PuntosMedidaComponent {

  displayedColumns: string[] = ['ID', 'area', 'municipio', 'direccion', 'consumo', 'acciones']

}
