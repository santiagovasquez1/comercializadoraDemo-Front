import { AngularMaterialModule } from './../angular-material.module';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { AsideComponent } from './aside/aside.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AsideComponent,
    ToolbarComponent
  ],
  imports: [
    CommonModule,
    AngularMaterialModule,
    RouterModule
  ],
  exports:[
    AsideComponent,
    ToolbarComponent
  ]
})
export class SharedModule { }
