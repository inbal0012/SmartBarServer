import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryItemSchema } from 'src/inventory/inventory.model';
import { InventoryService } from 'src/inventory/inventory.service';
import { RecipeController } from './recipe.controller';
import { RecipeSchema } from './recipe.model';
import { RecipeService } from './recipe.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: "Recipe", schema: RecipeSchema }, { name: "InventoryItem", schema: InventoryItemSchema }])],
  controllers: [RecipeController],
  providers: [RecipeService, InventoryService]
})
export class RecipeModule { }
