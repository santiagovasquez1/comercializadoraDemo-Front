import { DetalleOrganizacionComponent } from './detalle-organizacion/detalle-organizacion.component';
import { PagesComponent } from './pages.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { PuntosMedidaComponent } from './dashboard/puntos-medida/puntos-medida.component';

const routes: Routes = [
    // { path: '', redirectTo: 'main/dashboard', pathMatch: 'full' },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: "login", component: LoginComponent },
    {
        path: 'main',
        component:PagesComponent,
        children:[{
            path:'dashboard',
            component:DashboardComponent,
            data:{
                parent:'main',
                title:'Dashboard'
            }
        },
        {
            path:'puntos-medida',
            component:PuntosMedidaComponent,
            data:{
                parent:'main',
                title:'Puntos de medida'
            }
        },{
            path:'puntos-medida/detalle-organizacion/:GeneralData',
            component:DetalleOrganizacionComponent,
            data:{
                parent:'puntos-medida',
                title:'Detalle Organizacion'
            }
        }]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule { }