import { PagesComponent } from './pages.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { PuntosMedidaComponent } from './dashboard/puntos-medida/puntos-medida.component';

const routes: Routes = [
    // { path: '', component: PagesComponent },
    { path: "login", component: LoginComponent },
    // { path: "dashboard", component: DashboardComponent }
    {
        path: '',
        component:PagesComponent,
        children:[{
            path:'dashboard',
            component:DashboardComponent,
            data:{
                parent:'',
                title:'Dashboard'
            }
        },
        {
            path:'dashboard/puntos-medida',
            component:PuntosMedidaComponent,
        }]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule { }