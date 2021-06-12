import { ERecipeStatus } from "src/common/src/Enums/ERecipeCategory";
import BooleanInventoryItem from "src/common/src/Modules/InventoryItemModules/BooleanInventoryItem";
import { Bottle } from "src/common/src/Modules/InventoryItemModules/Bottle";
import FruitVegetable from "src/common/src/Modules/InventoryItemModules/FruitVegetable";
import InventoryItem, { NullInventoryItem } from "src/common/src/Modules/InventoryItemModules/InventoryItem";

import Recipe from "src/common/src/Modules/Recipe";
import AbstractInventoryItemHandler from "./InventoryItemHandlers/AbstractInventoryItemHandler";
import BooleanInventoryItemHandler from './InventoryItemHandlers/BooleanInventoryItemHandler'
import BottleHandler from "./InventoryItemHandlers/BottleHandler";
import FruitVegetableHandler from "./InventoryItemHandlers/FruitVegetableHandler";
import InventoryItemHandler, { NullInventoryItemHandler } from "./InventoryItemHandlers/InventoryItemHandler";

class RecipeHandler {
    recipe: Recipe
    ingredientsHandlers: [number, AbstractInventoryItemHandler, boolean][] = [];
    //categories: Array<string>;
    // TODO measurement converting ( + measure unit for misc InItems)
    // TODO garnish
    // TODO parse ingredients

    constructor(recipe: Recipe) {
        this.recipe = recipe;
        this.parseHandlers();
        //this.categories = new Array(ERecipeCategory.StrengthNonAlcoholic);
    }

    addCategory(category: string) {
        // TODO
    }

    parseHandlers() {
        this.recipe.ingredients.forEach(ingredient => {
            if (ingredient[1] instanceof BooleanInventoryItem) {
                this.ingredientsHandlers.push([ingredient[0], new BooleanInventoryItemHandler(ingredient[1]), ingredient[2]]);
            }
            else if (ingredient[1] instanceof Bottle) {
                this.ingredientsHandlers.push([ingredient[0], new BottleHandler(ingredient[1]), ingredient[2]]);
            }
            else if (ingredient[1] instanceof FruitVegetable) {
                this.ingredientsHandlers.push([ingredient[0], new FruitVegetableHandler(ingredient[1]), ingredient[2]]);
            }
            else if (ingredient[1] instanceof InventoryItem) {
                this.ingredientsHandlers.push([ingredient[0], new InventoryItemHandler(ingredient[1]), ingredient[2]]);
            }
            else
                this.ingredientsHandlers.push([ingredient[0], new NullInventoryItemHandler(), false]);
        });
    }

    checkAvailability() {
        var isAvailable: string = ERecipeStatus.allAvailable;// = true;
        var missingIng = "";

        this.ingredientsHandlers.forEach(ingredient => {

            if (!ingredient[1].checkAvailability(ingredient[0])) {
                if (!ingredient[2]) {
                    isAvailable = ERecipeStatus.notAvailable;
                    missingIng += ingredient[1].item.name + ", ";
                }
                else {
                    if (isAvailable == ERecipeStatus.allAvailable)
                        isAvailable = ERecipeStatus.basicAvailable
                    missingIng += ingredient[1].item.name + " (optional), ";
                }
            }
        });
        let reason = "";
        switch (isAvailable) {
            case ERecipeStatus.allAvailable:
                reason = "All ingredients available"
                break;
            case ERecipeStatus.basicAvailable:
                reason = "Missing optional ingredients: " + missingIng;
                break;
            case ERecipeStatus.notAvailable:
                reason = "Missing ingredients: " + missingIng;
                break;
            default:
                break;
        }
        return { success: isAvailable, reason };
    }

    calculateDrinkStrength() {
        // var alcohol;
        // var quantity;
        // this.ingredients.forEach(ingredient => {
        //     if (ingredient.category )
        // });
        // TODO
    }

    toJson() {
        return this.recipe.toJson();
    }

}

export default RecipeHandler;