/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryModule } from './inventory/inventory.module';
import { RecipeModule } from './recipe/recipe.module';

@Module({
  imports: [
    InventoryModule,
    MongooseModule.forRoot('mongodb://localhost:27017'),
    RecipeModule,
  ],
})
export class AppModule { }
