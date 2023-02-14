import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paginator'
})
export class PaginatorPipe implements PipeTransform {

  transform(arrayMap: any[], pageSize: number = 5, pageNumber: number = 1): any[] {
    --pageNumber;
    return arrayMap.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);
  }

}

