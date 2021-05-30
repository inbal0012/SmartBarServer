import EInventoryCategory from "./common/src/Enums/EInventoryCategory";
import AbstractInventoryItem from "./common/src/Modules/InventoryItemModules/AbstractInventoryItem";
import BinaryInventoryItem from "./common/src/Modules/InventoryItemModules/BinaryInventoryItem";
import BottleBuilder from "./common/src/Modules/InventoryItemModules/Bottle";
import FruitVegetable from "./common/src/Modules/InventoryItemModules/FruitVegetable";
import { NullInventoryItem } from "./common/src/Modules/InventoryItemModules/InventoryItem";
import Recipe from "./common/src/Modules/Recipe";

class DBMuck {
  private static instance: DBMuck;
  inventory: AbstractInventoryItem[] = [];
  recipeList: Recipe[] = [];

  private constructor() {
    this.initInventory();
  }

  public static getInstance(): DBMuck {
    if (!DBMuck.instance) {
      DBMuck.instance = new DBMuck();
    }

    return DBMuck.instance;
  }

  //#region Ingredients Inventory
  initInventory() {
    this.inventory = [];
    try {
      this.addItem(new BottleBuilder('Kraken', EInventoryCategory.BottleCategory.AlcoholCategory.Rum, 200, 30).alcoholPercentage(40).build());
      this.addItem(new BottleBuilder('Milk', EInventoryCategory.BottleCategory.Dairy, 30, 50).build());
      this.addItem(new BottleBuilder('Coke', EInventoryCategory.BottleCategory.Beverage, 100, 50).build());
      this.addItem(new FruitVegetable('Apple', EInventoryCategory.Fruits, 5, 1));
      this.addItem(new BottleBuilder("Angostura bitters", EInventoryCategory.BottleCategory.Bitter, 100, 10).alcoholPercentage(44.7).build())
      this.addItem(new BottleBuilder("Campari", EInventoryCategory.BottleCategory.AlcoholCategory.Liquor, 500, 30).alcoholPercentage(25).build())
      this.addItem(new BottleBuilder("Citrus Vodka", EInventoryCategory.BottleCategory.AlcoholCategory.Vodka, 300, 30).alcoholPercentage(37.5).build())
      this.addItem(new BottleBuilder("Cointreau", EInventoryCategory.BottleCategory.AlcoholCategory.Liquor, 500, 30).alcoholPercentage(40).build())
      this.addItem(new BottleBuilder("Cranberry Juice", EInventoryCategory.BottleCategory.Juice, 0, 50).build())
      this.addItem(new BottleBuilder("Dry Vermouth", EInventoryCategory.BottleCategory.AlcoholCategory.Vermouth, 700, 15).alcoholPercentage(18).build())
      this.addItem(new BottleBuilder("Hendricks", EInventoryCategory.BottleCategory.AlcoholCategory.Gin, 400, 30).alcoholPercentage(44).build())
      this.addItem(new BottleBuilder("Lime Juice", EInventoryCategory.BottleCategory.Juice, 0, 50).build())
      this.addItem(new BottleBuilder("Sweet Vermouth", EInventoryCategory.BottleCategory.AlcoholCategory.Vermouth, 700, 15).alcoholPercentage(16).build())
      this.addItem(new BottleBuilder("Jose Cuervo ", EInventoryCategory.BottleCategory.AlcoholCategory.Tequila, 60, 30).alcoholPercentage(40).build())
      this.addItem(new BottleBuilder("Jack Daniels", EInventoryCategory.BottleCategory.AlcoholCategory.Whiskey, 200, 30).alcoholPercentage(40).build())
      this.addItem(new BinaryInventoryItem("Mint Leaves", EInventoryCategory.Herbs, true))
      this.addItem(new BottleBuilder("Simple Syrup", EInventoryCategory.BottleCategory.Syrup, 50, 10).build())
      this.addItem(new BinaryInventoryItem("Sugar", EInventoryCategory.Spices, true))
    } catch (error) {
      console.log(error);
    }
  }
  getIngredientByName(name: string) {
    var ingredient = this.inventory.find((item) => item.getName() === name);
    if (ingredient === undefined) {
      ingredient = this.inventory.find((item) => item.getCategory() === name);
      if (ingredient === undefined) ingredient = new NullInventoryItem();
    }
    return ingredient;
  }
  addItem(item: AbstractInventoryItem) {
    this.inventory.push(item);
    this.inventory.sort(function (a, b) {
      if (a.getName() < b.getName()) return -1;
      if (a.getName() > b.getName()) return 1;
      return 0;
    });
  }
  //#endregion
  //#region  Recipes
  //#endregion Recipes
}

export default DBMuck;
