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
    this.defaultValue = this.options.defaultValue;
  }

  toggleOptions(){
    this.hideOptions = !this.hideOptions;
  }

  selectOption(event: MouseEvent){
    
    const selectedOption = (event.target as HTMLDivElement).textContent;
    this.options.currentValue = selectedOption;
    this.selected.emit(selectedOption );
    this.toggleOptions();

  }



}
