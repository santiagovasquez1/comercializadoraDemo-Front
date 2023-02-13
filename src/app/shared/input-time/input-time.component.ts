import { Component } from '@angular/core';

@Component({
  selector: 'app-input-time',
  templateUrl: './input-time.component.html'
})
export class InputTimeComponent {

  Minutos = ['00', '15', '30', '45'];
  Horas = ['1','2','3','4','6','7','8','9','10','11','12'];
  Franjas = ['Am','Pm'];

}
