import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import EInventoryCategory from 'src/common/src/Enums/EInventoryCategory';
import AbstractInventoryItem from 'src/common/src/Modules/InventoryItemModules/AbstractInventoryItem';
import Recipe from 'src/common/src/Modules/Recipe';
import { IInventoryItem } from 'src/inventory/inventory.model';
import { InventoryService } from 'src/inventory/inventory.service';
import RecipeHandler from 'src/Modules/RecipeHandler';
import { IRecipe } from './recipe.model';

@Injectable()
export class RecipeService {
    constructor(@InjectModel("Recipe") private readonly recipeModel: Model<IRecipe>, private readonly inventoryService: InventoryService) { }

    async getAllRecipes() {
        const recipes = await this.recipeModel.find().exec();
        return recipes;
    }
    async getRecipe(id: string) {
        const dbRecipe = await this.findRecipeById(id);

        let ingredients = []
        for (let index = 0; index < dbRecipe.ingredients.length; index++) {
            const element = dbRecipe.ingredients[index];

            const item = await this.inventoryService.getItem(String(element.productId))
            ingredients.push([element.amount, item, element.optional]);
        }
        return new Recipe(dbRecipe.name, ingredients, dbRecipe.method, dbRecipe.portion);
    }
    async getRecipeByName(name: string) {
        return await this.recipeModel.find({ name: { $regex: ".*" + name + ".*" } }).exec();
    }
    async CheckRecipeAvailability(id: string) {
        let Handler = new RecipeHandler(await this.getRecipe(id))
        const result = Handler.checkAvailability();

        return result
    }
    async insertRecipe(name: string, ingredients: [number, string, boolean][], method: [String], portion: number) {
        console.log(name, ingredients, method, portion);

        const exist = await this.recipeModel.find({ name: { $regex: ".*" + name + ".*" } }).exec();
        if (exist.length > 0)
            name = name + " #" + exist.length;

        var newIngredients = await this.extractIngredients(ingredients);

        const recipe = new this.recipeModel({ name, ingredients: newIngredients, method, portion });
        const result = await recipe.save();
        return result;
    }
    async updateRecipe(id: string, recipeName: string, recipeIngredients: [number, string, boolean][], recipeMethod: [string], recipePortion: number) {
        const updatedRecipe = await this.findRecipeById(id);
        let Handler = new RecipeHandler(await this.getRecipe(id))

        var newIngredients = await this.extractIngredients(recipeIngredients);
        let ingredients: [number, AbstractInventoryItem, boolean][] = []
        for (let index = 0; index < newIngredients.length; index++) {
            const element = newIngredients[index];

            const item = await this.inventoryService.getItem(String(element.productId))
            ingredients.push([element.amount, item, element.optional]);
        }
        const result = Handler.update(recipeName, ingredients, recipeMethod, recipePortion)

        
        if (recipeName) {
            updatedRecipe.name = Handler.recipe.name;
        }
        if (recipeIngredients && result.reason.includes("Ingredients changed")) {
            updatedRecipe.ingredients = newIngredients;
        }
        if (recipeMethod) {
            updatedRecipe.method = Handler.recipe.method;
        }
        if (recipePortion) {
            updatedRecipe.portion = Handler.recipe.portion;
        }
        updatedRecipe.save();
        console.log(result);

        return { updatedRecipe, result };
    }
    async deleteRecipe(id: string) {
        const result = await this.recipeModel.deleteOne({ _id: id }).exec();
        return result.n + " recipes deleted";
    }

    private async findRecipeById(id: string) {
        let recipe: IRecipe;
        try {
            recipe = await this.recipeModel.findById(id).exec();
        } catch (error) {
            throw new NotFoundException('Could not find recipe.')
        }
        if (!recipe) {
            throw new NotFoundException('Could not find recipe.')
        }
        return recipe
    }

    private async extractIngredients(ingredients: [number, string, boolean][]) {

        let newIngredients: {
            productId: Schema.Types.ObjectId,
            amount: number,
            optional: boolean
        }[] = [];
        //new Array<{ number, IInventoryItem, boolean }>();

        for (const ingredient of ingredients) {

            let item = await this.inventoryService.getIngredientByName(ingredient[1])

            const optional = ingredient[2] ? ingredient[2] : false
            if (item.category === EInventoryCategory.Unavailable) {
                item = await item.save();
            }
            newIngredients.push({ amount: ingredient[0], productId: item._id, optional });
        }

        return newIngredients;
    }
}