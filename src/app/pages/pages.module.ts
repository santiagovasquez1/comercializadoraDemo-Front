import { AngularMaterialModule } from './../angular-material.module';
import { SharedModule } from './../shared/shared.module';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesComponent } from './pages.component';
import { AppRoutingModule } from '../app-routing.module';
import { PuntosMedidaComponent } from './dashboard/puntos-medida/puntos-medida.component';

@NgModule({
  declarations: [
    DashboardComponent,
    LoginComponent,
    PagesComponent,
    PuntosMedidaComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AngularMaterialModule,
    AppRoutingModule
  ],
  exports:[
    DashboardComponent,
    LoginComponent,
    PagesComponent
  ]
})
export class PagesModule { }
