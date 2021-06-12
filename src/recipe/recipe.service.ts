import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import EInventoryCategory from 'src/common/src/Enums/EInventoryCategory';
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
    async getRecipeByName(name: string) {
        return await this.recipeModel.find({ name: { $regex: ".*" + name + ".*" } }).exec();
    }
    async CheckRecipeAvailability(id: string) {
        // let recipe = await this.findRecipeById(id);
        // let ingredients = []
        // for (const ing in recipe.ingredients) {
        //     const item = await this.inventoryService.getItem(ing[1])
        //     ingredients.push([ing[0], item, ing[2]]);

        // }
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

    async extractIngredients(ingredients: [number, string, boolean][]) {

        let newIngredients: {
            productId: Schema.Types.ObjectId,
            amount: Number,
            optional: Boolean
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
    updateRecipe(id: string, recipeName: string, recipeIngredients: [number, string][], recipeMethod: [String], recipePortion: number) {
        throw new Error('Method not implemented.');
    }
    async deleteRecipe(id: string) {
        throw new Error('Method not implemented.');
    }
}
