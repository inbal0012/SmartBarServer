/* eslint-disable prettier/prettier */
import EInventoryCategory from 'src/common/src/Enums/EInventoryCategory';
import EInventoryStatus from 'src/common/src/Enums/EInventoryStatus';
import { IUpdateResponse } from 'src/common/src/Interface/updateResponse';
import BooleanInventoryItem from 'src/common/src/Model/InventoryModel/BooleanInventoryItem';
import AbstractInventoryItemHandler from './AbstractInventoryItemHandler';

class BooleanInventoryItemHandler extends AbstractInventoryItemHandler {
    item: BooleanInventoryItem;

    constructor(booleanInventoryItem: BooleanInventoryItem) {
        super();
        this.item = booleanInventoryItem;
        this.item.status = this.item.remaining
            ? EInventoryStatus.Ok
            : EInventoryStatus.Empty;
    }

    updateStatus(): void {
        console.log('needStatusUpdate = true');

        this.item.needStatusUpdate = true;
    }

    use(amountUsed: number): void {
        this.updateStatus();
    }

    update(newValues: {
        itemName: string;
        itemRemaining: number;
        itemUse: number;
    }): IUpdateResponse {
        const returnStruct: IUpdateResponse = { success: true, reason: [] };
        let res: { success: boolean; reason: string };
        if (newValues.itemName && newValues.itemName != this.item.name) {
            this.item.name = newValues.itemName;
        }
        if (newValues.itemRemaining) {
            this.updateRemaining(newValues.itemRemaining > 0 ? true : false);
            console.log('remaining');
        }
        if (newValues.itemUse) {
            console.log('use');
            res = this.updateUse(newValues.itemUse);
            if (!res.success) {
                returnStruct.success = false;
                returnStruct.reason.push(res.reason);
            }
        }
        return returnStruct;
    }
    updateUse(itemUse: number): { success: boolean; reason: string } {
        if (!(typeof itemUse === 'number')) {
            return {
                success: false,
                reason: 'To use ' + this.item.name + ' you must send a number',
            };
        }
        if (itemUse < 0) {
            return {
                success: false,
                reason: this.item.name + "'s remaining can't be lower then 0",
            };
        }
        if (!this.checkAvailability(itemUse)) {
            return {
                success: false,
                reason: 'There is a shortage of ' + this.item.name,
            };
        }
        this.use(itemUse);
        return {
            success: true,
            reason: ""
        };
    }

    checkAvailability(amountNeeded: number): boolean {
        return this.item.remaining;
    }

    updateRemaining(isRemained: boolean) {
        this.item.remaining = isRemained;
        this.item.needStatusUpdate = false;
        this.item.status = this.item.remaining
            ? EInventoryStatus.Ok
            : EInventoryStatus.Empty;
    }

    static isABooleanCategory(category: string) {
        if (
            category === EInventoryCategory.Herbs ||
            category === EInventoryCategory.Spices
        )
            return true;
        else return false;
    }
}

export default BooleanInventoryItemHandler;
