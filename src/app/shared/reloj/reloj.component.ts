import { Component } from '@angular/core';

@Component({
  selector: 'app-reloj',
  templateUrl: './reloj.component.html',
})
export class RelojComponent {

  currentTime: string;

  ngOnInit() {

    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
    
  }


  updateTime() {
    const Time = new Date();
    this.currentTime = Time.toLocaleString();
  }

}
