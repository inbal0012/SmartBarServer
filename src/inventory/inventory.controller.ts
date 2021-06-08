import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { InventoryService } from './inventory.service'

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get()
    async getAllItems() {
        const items = await this.inventoryService.getAllItems();
        return items;
    }

    @Get(':id')
    async getItem(@Param('id') id: string) {
        const item = await this.inventoryService.getItem(id);
        return item;
    }

    @Post()
    async addItem(@Body('name') itemName: string, @Body('category') itemCategory: string, @Body('remaining') itemRemaining: number, @Body('minRequired') itemMinRequired: number, @Body('alcoholPercentage') itemAlcoholPercentage: number) {
        const itemId = await this.inventoryService.insertItem(itemName, itemCategory, itemRemaining, itemMinRequired, itemAlcoholPercentage);
        return { id: itemId }
    }

    @Patch(':id')
    async updateItem(@Param('id') id: string, @Body('name') itemName: string, @Body('category') itemCategory: string, @Body('remaining') itemRemaining: number, @Body('minRequired') itemMinRequired: number, @Body('alcoholPercentage') itemAlcoholPercentage: number) {
        const result = await this.inventoryService.updateItem(id, itemName, itemCategory, itemRemaining, itemMinRequired, itemAlcoholPercentage);
        return result;
    }

    @Delete(':id')
    async deleteItem(@Param('id') id: string) {
        const result = await this.inventoryService.deleteItem(id)
        return result;
    }
}
