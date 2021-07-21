import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { RecipeService } from './recipe.service';

@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get()
  async getAllRecipes() {
    const recipes = await this.recipeService.getAllRecipes();
    return recipes;
  }

  @Get(':id')
  async getRecipe(@Param('id') id: string) {
    const recipe = await this.recipeService.getRecipeById(id);
    return recipe;
  }

  @Get(':id/available')
  async getRecipeAvailability(@Param('id') id: string) {
    const recipe = await this.recipeService.checkRecipeAvailability(id);
    return recipe;
  }

  @Get(':id/make')
  async makeCocktail(@Param('id') id: string) {
    const output = await this.recipeService.makeCocktail(id);
    return output;
  }

  @Get('/name/:name')
  async getRecipeByName(@Param('name') name: string) {
    const recipe = await this.recipeService.getRecipeByName(name);
    return recipe;
  }

  @Post()
  async addRecipe(
    @Body('name') recipeName: string,
    @Body('ingredients') recipeIngredients: [number, string, boolean][],
    @Body('method') recipeMethod: [string],
    @Body('portion') recipePortion: number,
  ) {
    return await this.recipeService.insertRecipe(
      recipeName,
      recipeIngredients,
      recipeMethod,
      recipePortion,
    );
  }

  @Patch(':id')
  async updateRecipe(
    @Param('id') id: string,
    @Body('name') recipeName: string,
    @Body('ingredients') recipeIngredients: [number, string, boolean][],
    @Body('method') recipeMethod: [string],
    @Body('portion') recipePortion: number,
  ) {
    const result = await this.recipeService.updateRecipe(
      id,
      recipeName,
      recipeIngredients,
      recipeMethod,
      recipePortion,
    );
    return result;
  }

  @Delete(':id')
  async deleteRecipe(@Param('id') id: string) {
    const result = await this.recipeService.deleteRecipe(id);
    return result;
  }
}
