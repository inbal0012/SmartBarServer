/* eslint-disable prettier/prettier */
import { ERecipeStatus } from 'src/common/src/Enums/ERecipeCategory';
import { IUpdateResponse } from 'src/common/src/Interface/updateResponse';
import AbstractInventoryItem from 'src/common/src/Model/InventoryModel/AbstractInventoryItem';
import BooleanInventoryItem from 'src/common/src/Model/InventoryModel/BooleanInventoryItem';
import { Bottle } from 'src/common/src/Model/InventoryModel/Bottle';
import FruitVegetable from 'src/common/src/Model/InventoryModel/FruitVegetable';
import InventoryItem from 'src/common/src/Model/InventoryModel/InventoryItem';

import Recipe from 'src/common/src/Model/Recipe';
import AbstractInventoryItemHandler from './InventoryItemHandlers/AbstractInventoryItemHandler';
import BooleanInventoryItemHandler from './InventoryItemHandlers/BooleanInventoryItemHandler';
import BottleHandler from './InventoryItemHandlers/BottleHandler';
import FruitVegetableHandler from './InventoryItemHandlers/FruitVegetableHandler';
import InventoryItemHandler, {
    NullInventoryItemHandler,
} from './InventoryItemHandlers/InventoryItemHandler';

class RecipeHandler {
    recipe: Recipe;
    ingredientsHandlers: [number, AbstractInventoryItemHandler, boolean][] = [];
    //categories: Array<string>;
    // TODO measurement converting ( + measure unit for misc InItems)
    // TODO garnish
    // TODO parse ingredients

    constructor(recipe: Recipe) {
        this.recipe = recipe;
        this.parseHandlers();
        this.recipe.strength = this.calculateDrinkStrength();
        //this.categories = new Array(ERecipeCategory.StrengthNonAlcoholic);
    }

    addCategory(category: string) {
        // TODO
    }

    update(
        recipeName: string,
        recipeIngredients: [number, AbstractInventoryItem, boolean][],
        recipeMethod: [string],
        recipePortion: number,
    ): IUpdateResponse {
        const returnStruct: IUpdateResponse = { success: true, reason: [] };
        if (recipeName && recipeName != this.recipe.name) {
            this.recipe.name = recipeName;
        }
        if (recipeIngredients) {
            // TODO make it better
            this.recipe.ingredients = recipeIngredients;
        }
        if (recipeMethod) {
            this.recipe.method = recipeMethod;
        }
        if (recipePortion) {
            const validate = this.validatePositiveAndNumber('portion', recipePortion);
            if (!validate.success) {
                returnStruct.success = false;
                returnStruct.reason.push(validate.reason)
            } else {
                this.recipe.portion = recipePortion;
            }
        }

        return returnStruct;
    }

    parseHandlers() {
        this.recipe.ingredients.forEach((ingredient) => {
            if (ingredient[1] instanceof BooleanInventoryItem) {
                this.ingredientsHandlers.push([
                    ingredient[0],
                    new BooleanInventoryItemHandler(ingredient[1]),
                    ingredient[2],
                ]);
            } else if (ingredient[1] instanceof Bottle) {
                this.ingredientsHandlers.push([
                    ingredient[0],
                    new BottleHandler(ingredient[1]),
                    ingredient[2],
                ]);
            } else if (ingredient[1] instanceof FruitVegetable) {
                this.ingredientsHandlers.push([
                    ingredient[0],
                    new FruitVegetableHandler(ingredient[1]),
                    ingredient[2],
                ]);
            } else if (ingredient[1] instanceof InventoryItem) {
                this.ingredientsHandlers.push([
                    ingredient[0],
                    new InventoryItemHandler(ingredient[1]),
                    ingredient[2],
                ]);
            } else
                this.ingredientsHandlers.push([
                    ingredient[0],
                    new NullInventoryItemHandler(),
                    false,
                ]);
        });
    }

    checkAvailability() {
        let isAvailable: string = ERecipeStatus.allAvailable; // = true;
        const missingIng = [];

        this.ingredientsHandlers.forEach((ingredient) => {
            if (!ingredient[1].checkAvailability(ingredient[0])) {
                if (!ingredient[2]) {
                    isAvailable = ERecipeStatus.notAvailable;
                    missingIng.push(ingredient[1].item.name);
                } else {
                    if (isAvailable == ERecipeStatus.allAvailable)
                        isAvailable = ERecipeStatus.basicAvailable;
                    missingIng.push(ingredient[1].item.name + ' (optional)');
                }
            }
        });
        let reason = '';
        switch (isAvailable) {
            case ERecipeStatus.allAvailable:
                reason = 'All ingredients available';
                break;
            case ERecipeStatus.basicAvailable:
                reason = 'Missing optional ingredients: ' + missingIng;
                break;
            case ERecipeStatus.notAvailable:
                reason = 'Missing ingredients: ' + missingIng;
                break;
            default:
                break;
        }
        return { success: isAvailable, reason };
    }

    calculateDrinkStrength() {
        let sum = 0, alcohol = 0;
        this.recipe.ingredients.forEach(ingredient => {
            sum += ingredient[0];
            if (Bottle.isAAlcoholCategory(ingredient[1].category)) {
                alcohol += (ingredient[1] as Bottle).alcoholPercentage / 100 * ingredient[0]
            }
        });
        return (alcohol / sum) * 100
    }

    toJson() {
        return this.recipe.toJson();
    }

    validatePositiveAndNumber(param: string, newValue: any) {
        if (newValue <= 0)
            return {
                success: false,
                reason: this.recipe.name + "'s " + param + " can't be 0 or lower",
            };
        if (typeof newValue !== 'number')
            return {
                success: false,
                reason: param + ' has to be a number',
            };

        return {
            success: true,
            reason: '',
        };
    }
}

export default RecipeHandler;
