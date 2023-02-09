import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-mapa-colombia',
  templateUrl: './mapa-colombia.component.html',
  styleUrls: ['./mapa-colombia.component.scss']
})
export class MapaColombiaComponent {

  @Output() departamento = new EventEmitter<string>();


  dptoSeleccionado(dpto: string): void{
    this.departamento.emit(dpto);
  }

}
