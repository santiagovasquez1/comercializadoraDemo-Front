import { ValidationInterceptor } from './../interceptors/validation.interceptor';
import { AngularMaterialModule } from './../angular-material.module';
import { SharedModule } from './../shared/shared.module';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesComponent } from './pages.component';
import { AppRoutingModule } from '../app-routing.module';
import { PuntosMedidaComponent } from './dashboard/puntos-medida/puntos-medida.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MapaColombiaComponent } from './dashboard/puntos-medida/mapa-colombia/mapa-colombia.component';
import { DetalleOrganizacionComponent } from './detalle-organizacion/detalle-organizacion.component';
import { PagosComponent } from './pagos/pagos.component';
import { DatePipe } from '@angular/common';
import { PagarCuentaComponent } from './pagos/pagar-cuenta/pagar-cuenta.component';
@NgModule({
  declarations: [
    DashboardComponent,
    LoginComponent,
    PagesComponent,
    PuntosMedidaComponent,
    MapaColombiaComponent,
    DetalleOrganizacionComponent,
    PagosComponent,
    PagarCuentaComponent,
    
  ],
  imports: [
    CommonModule,
    SharedModule,
    AngularMaterialModule,
    AppRoutingModule,
    NgChartsModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    DashboardComponent,
    LoginComponent,
    PagesComponent,
    PuntosMedidaComponent,
    MapaColombiaComponent,
    DetalleOrganizacionComponent
  ],
  providers: [
    DatePipe,
    {
      
      provide: HTTP_INTERCEPTORS,
      useClass: ValidationInterceptor,
      multi: true,
      
    }
  ]
})
export class PagesModule { }
