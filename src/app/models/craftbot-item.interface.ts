export interface CraftBotItem {
  itemId: string;
  quantity: number;
  orderedQuantity: number;
  ingredientList: Array<{
    itemId: string;
    quantity: number;
  }>;
}

