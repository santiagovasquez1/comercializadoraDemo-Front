import { Component, EventEmitter, HostListener, Input, OnChanges, Output } from '@angular/core';
import { selectCustom } from 'src/app/models/select-custom';

@Component({
  selector: 'app-select-custom',
  templateUrl: './select-custom.component.html'
})
export class SelectCustomComponent implements OnChanges {

  @Input() options: selectCustom;

  @Output() selected = new EventEmitter<string>();

  hideOptions: boolean = true;
  defaultValue: string;

  ngOnChanges(){
    if(!this.options.disabled){
      this.defaultValue = this.options.defaultValue;
    }
    else{
      this.hideOptions = true;
    }
    
  }

  toggleOptions(){
    if(!this.options.disabled){
      this.hideOptions = !this.hideOptions;
    }
    
  }

  selectOption(event: MouseEvent){

    if(!this.options.disabled){
      const selectedOption = (event.target as HTMLDivElement).textContent;
      this.options.currentValue = selectedOption;
      this.selected.emit(selectedOption );
      this.toggleOptions();
    }
  

  }



}
