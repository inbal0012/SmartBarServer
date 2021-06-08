import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose';
import { InventoryItem } from './inventory.model';
import { InventoryModule } from './inventory.module';

@Injectable()
export class InventoryService {
    constructor(@InjectModel("InventoryItem") private readonly inventoryModel: Model<InventoryItem>) { }

    public async getAllItems() {
        const items = await this.inventoryModel.find().exec();
        return items;
    }

    public async getItem(id: string) {
        const item = await this.findItemById(id);
        return item;
    }

    public async insertItem(name: string, category: string, remaining: number, minRequired: number, alcoholPercentage: number,) {
        const item = new this.inventoryModel({ name, category, remaining, minRequired, alcoholPercentage })
        const result = await item.save();
        return result.id as string;
    }

    public async updateItem(id: string, itemName: string, itemCategory: string, itemRemaining: number, itemMinRequired: number, itemAlcoholPercentage: number) {
        const updatedItem = await this.findItemById(id);
        if (itemName) {
            updatedItem.name = itemName;
        }
        if (itemCategory) {
            updatedItem.category = itemCategory;
        }
        if (itemRemaining) {
            updatedItem.remaining = itemRemaining;
        }
        if (itemMinRequired) {
            updatedItem.minRequired = itemMinRequired;
        }
        if (itemAlcoholPercentage) {
            updatedItem.alcoholPercentage = itemAlcoholPercentage;
        }

        updatedItem.save();
        return updatedItem;
    }

    public async deleteItem(id: string) {
        const result = await this.inventoryModel.deleteOne({ _id: id }).exec();
        return result.n;
    }

    private async findItemById(id: string): Promise<InventoryItem> {
        let item;
        try {
            item = await this.inventoryModel.findById(id).exec();
        } catch (error) {
            throw new NotFoundException('Could not find Item.')

        }
        if (!item) {
            throw new NotFoundException('Could not find Item.')
        }
        return item
    }

}
