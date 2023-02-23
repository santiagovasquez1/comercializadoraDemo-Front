import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-pagar-cuenta',
  templateUrl: './pagar-cuenta.component.html'
})
export class PagarCuentaComponent {

  isPay: boolean = false;

  

  constructor(public dialogRef: MatDialogRef<PagarCuentaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any){

      console.log(data)

  }

  closeDialog(): void {
    this.isPay = true;
    this.dialogRef.close(this.isPay);
  }

}
