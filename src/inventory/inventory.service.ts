/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose';
import EInventoryCategory from 'src/common/src/Enums/EInventoryCategory';
import BooleanInventoryItem from 'src/common/src/Model/InventoryModel/BooleanInventoryItem';
import BottleBuilder from 'src/common/src/Model/InventoryModel/Bottle';
import FruitVegetable from 'src/common/src/Model/InventoryModel/FruitVegetable';
import AbstractInventoryItem from 'src/common/src/Model/InventoryModel/AbstractInventoryItem'
import BottleHandler from 'src/handlers/InventoryItemHandlers/BottleHandler';
import AbstractInventoryItemHandler from 'src/handlers/InventoryItemHandlers/AbstractInventoryItemHandler'
import { IInventoryItem } from './inventory.model';
import InventoryItem from 'src/common/src/Model/InventoryModel/InventoryItem';
import BooleanInventoryItemHandler from 'src/handlers/InventoryItemHandlers/BooleanInventoryItemHandler';
import FruitVegetableHandler from 'src/handlers/InventoryItemHandlers/FruitVegetableHandler';
import InventoryItemHandler, { NullInventoryItemHandler } from 'src/handlers/InventoryItemHandlers/InventoryItemHandler';
import { IUpdateResponse } from 'src/common/src/Interface/updateResponse';

@Injectable()
export class InventoryService {
    constructor(@InjectModel("InventoryItem") private readonly inventoryModel: Model<IInventoryItem>) { }

    public async getAllItems() {
        const items = await this.inventoryModel.find().exec();
        return items;
    }

    // Todo filter by category
    // Todo if !exist return a null object

    public async getItem(id: string) {
        const item = await this.findItemById(id);

        let newIngredient;
        if (BottleHandler.isABottleCategory(item.category)) {
            const builder = new BottleBuilder(id, item.name, item.category, item.remaining, item.minRequired);
            if (BottleHandler.isAAlcoholCategory(item.category))
                builder.alcoholPercentage(item.alcoholPercentage);
            newIngredient = builder.build();
        } else if (FruitVegetableHandler.isAFruitVegetableCategory(item.category)) {
            newIngredient = new FruitVegetable(id,
                item.name,
                item.category,
                item.remaining,
                item.minRequired
            );
        }
        else if (BooleanInventoryItemHandler.isABooleanCategory(item.category)) {
            newIngredient = new BooleanInventoryItem(id, item.name, item.category, item.remaining > 0 ? true : false)
        }
        else {
            newIngredient = new InventoryItem(id, item.name, item.category, item.remaining, item.minRequired);
        }
        return newIngredient as AbstractInventoryItem;
    }

    public async insertItem(name: string, category: string, remaining: number, minRequired: number, alcoholPercentage: number,) {
        console.log(name, category, remaining, minRequired, alcoholPercentage);

        if (!this.checkIfIsCategory(category))
            throw new BadRequestException('please select a valid category');
        if (!name)
            throw new BadRequestException('every ingredient must have a name');
        if (!remaining)
            throw new BadRequestException('every ingredient must have a remaining');

        let exist = await this.inventoryModel.findOne({ name: name }).exec()
        if (exist) {
            if (exist.category === EInventoryCategory.Unavailable || exist.category === EInventoryCategory.Unsorted) {
                return await this.updateItem(exist.id, name, category, remaining, undefined, minRequired, alcoholPercentage);
            }
            else throw new BadRequestException(name + ' already exist');
        }
        exist = await this.inventoryModel.findOne({ name: category }).exec()
        console.log(exist);

        if (exist) {
            if (exist.category === EInventoryCategory.Unavailable || exist.category === EInventoryCategory.Unsorted) {
                return await this.updateItem(exist.id, name, category, remaining, undefined, minRequired, alcoholPercentage);
            }
        }

        let item;
        if (category === EInventoryCategory.Unavailable || category === EInventoryCategory.Unsorted) {
            console.log("unsorted");
            item = new this.inventoryModel({ name, category, remaining: 0 });
        }
        else if (BottleHandler.isABottleCategory(category)) {
            console.log("bottle");
            if (!minRequired) {
                throw new BadRequestException("minRequired is a must for bottles")
            }
            item = new this.inventoryModel({ name, category, remaining, minRequired })
            if (BottleHandler.isAAlcoholCategory(category)) {
                if (!alcoholPercentage) {
                    throw new BadRequestException("Alcoholic drinks should have alcohol percentage")
                }
                item.alcoholPercentage = alcoholPercentage;
            }
        }
        else if (FruitVegetableHandler.isAFruitVegetableCategory(category)) {
            if (!minRequired) {
                throw new BadRequestException("minRequired is a must for fruits & vegetables")
            }
            item = new this.inventoryModel({ name, category, remaining, minRequired });
        }
        else if (BooleanInventoryItemHandler.isABooleanCategory(category)) {
            item = new this.inventoryModel({ name, category, remaining: remaining ? 1 : 0, needStatusUpdate: false });
            console.log("bool");
        }
        else {
            console.log("generic");
            if (!minRequired) {
                throw new BadRequestException("minRequired is a must")
            }
            item = new this.inventoryModel({ name, category, remaining, minRequired });
        }
        console.log(item);

        const result = await item.save();
        return result;
    }

    public async updateItem(id: string, itemName: string, itemCategory: string, itemRemaining: number | boolean, itemUse: number, itemMinRequired: number, itemAlcoholPercentage: number) {
        console.log(itemName, itemCategory, itemRemaining, itemUse, itemMinRequired, itemAlcoholPercentage);

        const updatedItem = await this.findItemById(id);
        if (itemCategory && updatedItem.category != itemCategory) {
            await this.updateCategory(updatedItem, itemCategory);
        }
        let itemHandler: AbstractInventoryItemHandler;
        let result: IUpdateResponse;
        if (BottleHandler.isABottleCategory(updatedItem.category)) {
            itemHandler = new BottleHandler(new BottleBuilder(id, updatedItem.name, updatedItem.category, updatedItem.remaining, updatedItem.minRequired).alcoholPercentage(updatedItem.alcoholPercentage).build())
            result = itemHandler.update({ itemName, itemCategory, itemRemaining, itemUse, itemMinRequired, itemAlcoholPercentage })
        }
        else if (BooleanInventoryItemHandler.isABooleanCategory(updatedItem.category)) {
            itemHandler = new BooleanInventoryItemHandler(new BooleanInventoryItem(id, updatedItem.name, updatedItem.category, updatedItem.remaining ? true : false))
            result = itemHandler.update({ itemName, itemRemaining, itemUse })
        }
        else if (FruitVegetableHandler.isAFruitVegetableCategory(updatedItem.category)) {
            itemHandler = new FruitVegetableHandler(new FruitVegetable(id, updatedItem.name, updatedItem.category, updatedItem.remaining, updatedItem.minRequired))
            result = itemHandler.update({ itemName, itemCategory, itemRemaining, itemUse, itemMinRequired })
        }
        else if (updatedItem.category === EInventoryCategory.Unavailable || updatedItem.category === EInventoryCategory.Unsorted) {
            itemHandler = new NullInventoryItemHandler()
            result = itemHandler.update({})
        }
        else {
            itemHandler = new InventoryItemHandler(new InventoryItem(id, updatedItem.name, updatedItem.category, updatedItem.remaining, updatedItem.minRequired))
            result = itemHandler.update({ itemName, itemCategory, itemRemaining, itemUse, itemMinRequired })
        }

        const exist = await this.inventoryModel.findOne({ name: itemName }).exec()
        if (exist && exist.id !== updatedItem.id) {
            if (exist.category === EInventoryCategory.Unavailable || exist.category === EInventoryCategory.Unsorted) { }
            else {
                result.success = false;
                result.reason.push(itemName + ' already exist');
            }
        }
        if (result.success) {
            if (itemName) {
                updatedItem.name = itemHandler.item.name;
            }
            if (itemRemaining || itemUse) {
                updatedItem.remaining = itemHandler.item.remaining;
                updatedItem.needStatusUpdate = itemHandler.item.needStatusUpdate;
            }
            if (itemMinRequired) {
                updatedItem.minRequired = itemHandler.item.minRequired;
            }
            if (itemAlcoholPercentage) {
                updatedItem.alcoholPercentage = itemHandler.item.alcoholPercentage;
            }
            updatedItem.save();
        }

        console.log(result);

        return { updatedItem, result };
    }

    public async deleteItem(id: string) {
        const result = await this.inventoryModel.deleteOne({ _id: id }).exec();
        return result.n + " items deleted";
    }

    private async findItemById(id: string): Promise<IInventoryItem> {
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

    updateCategory(updatedItem: IInventoryItem, newCategory: string) {
        if (!this.checkIfIsCategory(newCategory) || newCategory === EInventoryCategory.Unavailable || newCategory === EInventoryCategory.Unsorted)
            throw new BadRequestException('please select a valid category');

        if (BottleHandler.isAAlcoholCategory(updatedItem.category)) {
            if (!BottleHandler.isAAlcoholCategory(newCategory)) {
                updatedItem.alcoholPercentage = undefined;
            }
        }
        if (BooleanInventoryItemHandler.isABooleanCategory(newCategory)) {
            if (!BooleanInventoryItemHandler.isABooleanCategory(updatedItem.category)) {
                updatedItem.remaining = updatedItem.remaining ? 1 : 0;
                updatedItem.needStatusUpdate = false;
            }
        }
        if (BooleanInventoryItemHandler.isABooleanCategory(updatedItem.category)) {
            if (!BooleanInventoryItemHandler.isABooleanCategory(newCategory)) {
                updatedItem.needStatusUpdate = undefined;
            }
        }
        if (!BooleanInventoryItemHandler.isABooleanCategory(newCategory)) {
            updatedItem.minRequired = 1;
        }

        updatedItem.category = newCategory;
    }
    private checkIfIsCategory(category: string) {
        return (
            Object.values(EInventoryCategory).includes(category) ||
            Object.values(EInventoryCategory.BottleCategory).includes(category) ||
            Object.values(EInventoryCategory.BottleCategory.AlcoholCategory).includes(category) && (category !== EInventoryCategory.Unsorted && category !== EInventoryCategory.Unavailable)
        );
    }

    async getIngredientByName(name: string): Promise<IInventoryItem> {
        console.log("get by name " + name);
        let ingredient = await this.inventoryModel.findOne({
            $or: [
                { name: name },
                { category: name }
            ]
        }).exec();
        // var ingredient = await this.inventoryModel.findOne({ name: name }).exec();
        // if (ingredient === null) {
        //     console.log("search by category");

        //     ingredient = await this.inventoryModel.findOne({ category: name }).exec();
        if (ingredient === null) {
            console.log("NullObject");

            ingredient = new this.inventoryModel({ name, category: EInventoryCategory.Unavailable, remaining: 0 });
        }
        // }
        return ingredient;
    }
}
