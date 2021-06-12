import { Module } from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InventoryModule } from './inventory/inventory.module';
import { RecipeModule } from './recipe/recipe.module';

@Module({
  imports: [InventoryModule, MongooseModule.forRoot('mongodb://localhost:27017'), RecipeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
