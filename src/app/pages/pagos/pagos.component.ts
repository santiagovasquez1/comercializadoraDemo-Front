import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin, Observable, switchMap } from 'rxjs';
import { ETypesOrganizations, GetGeneralDataRequest } from 'src/app/models/GetGeneralDataRequest';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { KillerAppService } from 'src/app/services/killer-app.service';
import { ToastrService } from 'ngx-toastr';
import { MedidorModel } from 'src/app/models/MedidorModel';
import { InformationDetalle } from 'src/app/models/informationDetalle';
import { DatePipe } from '@angular/common';
import { InformationModel } from 'src/app/models/InformationModel';
import { PagosModel } from 'src/app/models/pagosModel';
import { MatDialog } from '@angular/material/dialog';
import { PagarCuentaComponent } from './pagar-cuenta/pagar-cuenta.component';


@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html'
})
export class PagosComponent {

  dataTableEmpresa: MatTableDataSource<OrganizationModel>;
  dataTableAreas: MatTableDataSource<PagosModel>;
  dataTableLocales: MatTableDataSource<any>;
  
  request: GetGeneralDataRequest;
  organizationConsumoTimeStamp: OrganizationModel;

  columnsTableConsumo: string[] = ['consumoEnergiaActiva', 'consumoEnergiaReactiva', 'costoActiva', 'costoReactiva', 'valorTotal','fechaPago', 'estado'];

  columnsTableAreas: string[] = ['areas','consumoEnergiaActiva', 'consumoEnergiaReactiva', 'costoActiva', 'costoReactiva', 'valorTotal','fechaPago', 'estado','actions'];

  columnsTableLocales: string[] = ['area','consumoEnergiaActiva', 'consumoEnergiaReactiva', 'costoActiva', 'costoReactiva', 'valorTotal','fechaPago', 'estado','actions'];

  isShowAreas: boolean = false;
  isShowLocales: boolean = false;
  fechaPago: Date;

  estadoEmpresa: string = 'Debe';

  areaSelected: string = '';

  constructor(private route: ActivatedRoute,
              private router: Router,
              private spinner: NgxSpinnerService,
              private loadInformationService: KillerAppService,
              private toastr: ToastrService,
              public datePipe: DatePipe,
              public dialog: MatDialog){

                this.dataTableEmpresa = new MatTableDataSource();
                this.dataTableAreas = new MatTableDataSource();
                this.dataTableLocales = new MatTableDataSource();
   }


    ngOnInit(): void {
    this.spinner.show();

    const fechaActual = new Date();
    this.fechaPago = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);


    let obs: Observable<OrganizationModel>[] = [];

    obs.push(this.loadInformationService.GetConsumoByTimeStamp({
      empresaName: 'Empresa1',
      fechaConsulta: new Date(2023, 1, 24),
      TypeOfOrganization: ETypesOrganizations.Empresa
    }));

    forkJoin(obs).subscribe({
      next: response => {
        console.log("response: ",response)

        this.dataTableEmpresa.data = response;

        let dataAreasPagos:PagosModel[] = [];
        this.dataTableEmpresa.data[0].nodes.map(obj => {
          
          dataAreasPagos.push({nameArea:obj.name,energiaActivaAcumuladoMes:obj.information[0].energiaActivaAcumuladoMes,energiaReactivaAcumuladoMes:obj.information[0].energiaReactivaAcumuladoMes,costoActivaAcumuladoMes:obj.information[0].costoActivaAcumuladoMes, costoReactivaAcumuladoMes:obj.information[0].costoReactivaAcumuladoMes,valorTotal:obj.information[0].costoActivaAcumuladoMes+obj.information[0].costoReactivaAcumuladoMes,fecha:obj.information[0].fecha,estado:this.estadoEmpresa === 'Pagado' ? 'Pagado' : 'Debe'})
        })

        this.dataTableAreas.data = dataAreasPagos;

        this.spinner.hide();
      },
      error: err => {
        console.log(err);
        this.spinner.hide();
        this.toastr.error(err);
      }
    })
  }

  onVolver() {
    this.router.navigate(['/main/puntos-medida']);
  }

  OnVerLocal(element: any){
    this.areaSelected = element.nameArea;

    let areas = this.dataTableEmpresa.data[0].nodes;
    areas = areas.filter(obj => obj.name === element.nameArea)

    let estadoArea = this.dataTableAreas.data.filter(obj => obj.nameArea === element.nameArea)[0].estado;
    console.log("estadoArea: ",estadoArea);

    // let estadoLocal = this.dataTableLocales.data.filter(obj => obj.nameArea === element.nameArea)[0].estado;
    // console.log("estadoArea: ",estadoLocal);
    let dataTablaLocales:PagosModel[] = [];

    areas[0].nodes.map(obj => {
      dataTablaLocales.push({nameArea:areas[0].name,nameLocal:obj.name,energiaActivaAcumuladoMes:obj.information[0].energiaActivaAcumuladoMes,energiaReactivaAcumuladoMes:obj.information[0].energiaReactivaAcumuladoMes,costoActivaAcumuladoMes:obj.information[0].costoActivaAcumuladoMes, costoReactivaAcumuladoMes:obj.information[0].costoReactivaAcumuladoMes,valorTotal:obj.information[0].costoActivaAcumuladoMes+obj.information[0].costoReactivaAcumuladoMes,fecha:obj.information[0].fecha,estado: estadoArea == 'Pagado' ? 'Pagado' : 'Debe'})
    })

    this.dataTableLocales.data = dataTablaLocales;
    this.isShowLocales = true;
  }

  OnVerAreas(){
    this.isShowAreas = true;
  }

  OnPagar(element: any,tipo: string){

    if(element.estado === 'Debe'){
      let sendData: any[] = [];
      switch (tipo) {
        case 'Empresa':
          sendData.push({nameButton:'Pagar Total', title:'Efectuar pago de empresa',dataRow: {valorTotal:this.dataTableEmpresa.data[0].information[0].costoActivaAcumuladoMes + this.dataTableEmpresa.data[0].information[0].energiaReactivaAcumuladoMes}})
          break;
        case 'Area':
          sendData.push({nameButton:'Pagar Area', title:'Efectuar pago de área',dataRow: element})
          break;
        case 'Local':
          sendData.push({nameButton:'Pagar Local', title:'Efectuar pago de Local',dataRow: element})
          break;
      }
      const dialogRef = this.dialog.open(PagarCuentaComponent, {
        panelClass: 'style-dialog',
        width: '376px',
        height: '258px',
        data: sendData
      });
    
      dialogRef.afterClosed().subscribe(result => {
  
        if(result){
          switch (tipo) {
            case 'Empresa':
              this.estadoEmpresa = 'Pagado';
              if(this.dataTableAreas.data.length > 0){
                console.log("this.dataTableAreas.data: ",this.dataTableAreas.data)
                this.dataTableAreas.data.map(obj => obj.estado =  'Pagado')
              }
              break;
            case 'Area':
              this.dataTableAreas.data.map(obj => obj.estado = obj.nameArea === element.nameArea ? 'Pagado' : obj.estado)
              if(this.dataTableLocales.data.length > 0){
                this.dataTableLocales.data.map(obj => obj.estado = obj.nameArea === element.nameArea ?  'Pagado' : obj.estado)
              }
              
              break;
            case 'Local':
              this.dataTableLocales.data.map(obj => obj.estado = obj.nameLocal === element.nameLocal ? 'Pagado' : obj.estado)
              
              console.log("this.dataTableLocales.data: ",this.dataTableLocales.data)

              let todosLocalesPay = 0;
              for (let i = 0; i < this.dataTableLocales.data.length; i++) {
                if(this.dataTableLocales.data[i].estado === 'Debe'){
                  todosLocalesPay = 1;
                }
              }

              if(todosLocalesPay === 0){
                this.dataTableAreas.data.map(obj => obj.estado = obj.nameArea === element.nameArea ? 'Pagado' : obj.estado)
              }

              break;
          }
        }
  
  
        
      });
    }

    
  }
  

}
