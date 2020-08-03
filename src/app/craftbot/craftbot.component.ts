import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ItemTranslation } from '../models/item-translation.interface';
import { CraftBotItem } from '../models/craftbot-item.interface';
import { map, mergeMap, take } from 'rxjs/operators';
import xml2js from 'xml2js';
import { from, Observable, combineLatest, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-craftbot',
  templateUrl: './craftbot.component.html',
  styleUrls: ['./craftbot.component.scss']
})
export class CraftbotComponent implements OnInit {

  //#region Properties

  private _excludedItemIds : string[] = [

  ];
  public get excludedItemIds() : string[] {
    return this._excludedItemIds;
  }
  public set excludedItemIds(v : string[]) {
    this._excludedItemIds = v;
  }

  private _cart: BehaviorSubject<CraftBotItem[]> = new BehaviorSubject([]);
  public get cart(): BehaviorSubject<CraftBotItem[]> {
    return this._cart;
  }
  public set cart(v: BehaviorSubject<CraftBotItem[]>) {
    this._cart = v;
  }

  private addIngredients(item: CraftBotItem, materialList: Array<{ itemId: string; quantity: number }>) {
    if (!item.quantity) {
      return;
    }
    item.ingredientList.forEach(ingredient => {
      const ingredientCrafting = !this.excludedItemIds.find(x => x === ingredient.itemId) && this.craftbotItems.find(x => x.itemId === ingredient.itemId);

      if (!ingredientCrafting ) {
        const foundItem = materialList.find(x => x.itemId === ingredient.itemId);
        if (foundItem) {
          foundItem.quantity += ingredient.quantity * item.quantity;
        } else {
          materialList.push({
            itemId: ingredient.itemId,
            quantity: ingredient.quantity * item.quantity
          });
        }
      } else {
        const buildsNeeded = (item.quantity * ingredient.quantity) / ingredientCrafting.quantity;
        const quantity = Math.ceil(buildsNeeded);
        this.addIngredients({
          ...ingredientCrafting,
          quantity
        }, materialList);
      }
    });
  }

  public get materialList(): Observable<CraftBotItem[]> {
    return this._cart
      .pipe(map(items => {
        const materialList = [];

        items.forEach(item => {
            const craftBotItem = this.craftbotItems.find(x => x.itemId === item.itemId);
            this.addIngredients({
              ...item,
              quantity: item.orderedQuantity / (craftBotItem.quantity || 1)
            }, materialList);
        });
        return materialList;
      }));
  }

  private _searchTerm: string = '';
  public get searchTerm(): string {
    return this._searchTerm;
  }
  public set searchTerm(v: string) {
    this._searchTerm = v;
  }


  private _craftbotItems: CraftBotItem[];
  public get craftbotItems(): CraftBotItem[] {
    return this._craftbotItems;
  }
  public set craftbotItems(v: CraftBotItem[]) {
    this._craftbotItems = v;
  }


  private _translations: ItemTranslation;
  public get translations(): ItemTranslation {
    return this._translations;
  }
  public set translations(v: ItemTranslation) {
    this._translations = v;
  }


  private _iconMap: any;
  public get iconMap(): any {
    return this._iconMap;
  }
  public set iconMap(v: any) {
    this._iconMap = v;
  }


  private _currentItem: {index: string; id: string};
  public get currentItem(): {index: string; id: string} {
    return this._currentItem;
  }
  public set currentItem(v: {index: string; id: string}) {
    this._currentItem = v;
  }

  //#endregion

  public constructor(private readonly _httpClient: HttpClient) {
  }

  public addToCart(itemId: string) {
    const item = this.craftbotItems.find(x => x.itemId === itemId);
    const addedItem = this.cart.value.find(i => i.itemId === item.itemId);
    if (!addedItem) {
      item.orderedQuantity = (item.orderedQuantity || item.quantity || 1);
      this.cart.next([...this._cart.value, item]);
      return;
    }

    const increaseStep = item.quantity || 1;

    item.orderedQuantity = (item.orderedQuantity || 0) + increaseStep;
    this.cart.next([...this.cart.value]);
  }

  public increaseAmount(item: CraftBotItem) {
    item.orderedQuantity = item.orderedQuantity + (item.quantity || 1);
    this.cart.next([...this.cart.value]);
  }

  public decreaseAmount(item: CraftBotItem) {
    item.orderedQuantity = item.orderedQuantity - (item.quantity || 1);
    this.cart.next([...this.cart.value]);
  }


  public async ngOnInit(): Promise<void> {
    this._craftbotItems = await this._httpClient.get<CraftBotItem[]>('/assets/scrap_mechanic_gamedir/craftbot.json').toPromise();
    this._translations = Object.assign(
      await this._httpClient.get('/assets/scrap_mechanic_gamedir/InventoryItemDescriptions.json').toPromise(),
      await this._httpClient.get('/assets/scrap_mechanic_gamedir/inventoryDescriptions.json').toPromise());

    this._iconMap = await combineLatest([
      this._httpClient
        .get('/assets/scrap_mechanic_gamedir/IconMapSurvival.xml', { responseType: 'text' })
        .pipe(
          mergeMap(x => this.parseXML(x)),
          map(x => x.MyGUI.Resource.find(y => y.$.name === 'ItemIconsSetSurvival0')),
          map(x => x.Group.find(y => y.$.name === 'ItemIconsSurvival')),
          map((x: any) => {
            const itemMap = {};
            x.Index.forEach(y => {
              itemMap[y.$.name] = {
                position: y.Frame[0].$.point.split(' ').map(x => `-${x}px`).join(' '),
                mapType: 'survival'
              };
            });
            return itemMap;
          })),
      this._httpClient
        .get('/assets/scrap_mechanic_gamedir/IconMap.xml', { responseType: 'text' })
        .pipe(
          mergeMap(x => this.parseXML(x)),
          map(x => x.MyGUI.Resource.find(y => y.$.name === 'ItemIconsSet0')),
          map(x => x.Group.find(y => y.$.name === 'ItemIcons')),
          map((x: any) => {
            const itemMap = {};
            x.Index.forEach(y => {
              itemMap[y.$.name] = {
                position: y.Frame[0].$.point.split(' ').map(x => `-${x}px`).join(' '),
                mapType: 'other'
              };
            });
            return itemMap;
          }))])
          .pipe(
            map(([survival, other]) => Object.assign(other, survival)),
            take(1))
      .toPromise();
  }

  private parseXML(data): Observable<any> {
    return from(new Promise(resolve => {
      const parser = new xml2js.Parser({
        trim: true,
        explicitArray: true
      });

      parser.parseString(data, (_, result) => resolve(result));
    }));
  }
}
