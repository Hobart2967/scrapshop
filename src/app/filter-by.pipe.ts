import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterBy'
})
export class FilterByPipe implements PipeTransform {

  public transform(list: any[], translations: any, term): unknown {
    if (!term.replace(/s/g, '')) {
      return list;
    }

    return [...list].map(x => ({
      ...x,
      itemName: translations[x.itemId].title
    })).filter(x => x.itemName.toLowerCase().indexOf(term.toLowerCase()) !== -1)
  }

}
