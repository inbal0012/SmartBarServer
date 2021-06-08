import { Module } from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [InventoryModule, MongooseModule.forRoot('mongodb://localhost:27017/inventory')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
