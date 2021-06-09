import EInventoryCategory from "src/common/src/Enums/EInventoryCategory";
import EInventoryStatus from "src/common/src/Enums/EInventoryStatus";
import BooleanInventoryItem from "src/common/src/Modules/InventoryItemModules/BooleanInventoryItem";
import AbstractInventoryItemHandler from "./AbstractInventoryItemHandler";

class BooleanInventoryItemHandler extends AbstractInventoryItemHandler {
    item: BooleanInventoryItem

    constructor(booleanInventoryItem: BooleanInventoryItem) {
        super();
        this.item = booleanInventoryItem;
        this.item.status = this.item.remaining ? EInventoryStatus.Ok : EInventoryStatus.Empty;
    }

    updateStatus(): void {
        this.item.needStatusUpdate = true;
    }

    use(amountUsed: number): void {
        this.updateStatus();
    }

    update(ingredientParam: string, newValue: any) {
        switch (ingredientParam) {
            case 'name':
                return { success: false, reason: "You can't change the name" };
            case 'category':
                if (newValue === EInventoryCategory.Spices || newValue === EInventoryCategory.Herbs) {
                    this.item.category = newValue;
                    return {
                        success: true,
                        reason: this.item.name + "'s category updated",
                    };
                }
                else return {
                    success: false,
                    reason: "can't change " + this.item.name + "'s category to " + newValue,
                };
            case 'remaining':
                if (typeof (newValue) === 'boolean') {
                    this.updateRemaining(newValue);
                    return {
                        success: true,
                        reason: this.item.name + 'remaining updated',
                    };
                }
                if (!(typeof (newValue) === 'number'))
                    return {
                        success: false,
                        reason:
                            "remaining has to be a number if you want to use it \nor a boolean if you want to update the status"
                    };

                if (newValue <= 0)
                    return {
                        success: false,
                        reason:
                            this.item.name + "'s remaining can't be 0 or lower"
                    };
                else if (!this.checkAvailability(newValue))
                    return {
                        success: false,
                        reason:
                            "There is a shortage of " + this.item.name,
                    };
                else {
                    this.use(newValue);
                    return {
                        success: true,
                        reason: this.item.name + 'used',
                    };
                }

            default:
                return {
                    success: false,
                    reason:
                        this.item.name + " doesn't have a " + ingredientParam + ' parameter',
                };
        }
    }

    checkAvailability(amountNeeded: number): boolean {
        return this.item.remaining;
    }

    updateRemaining(isRemained: boolean) {
        this.item.remaining = isRemained;
        this.item.needStatusUpdate = false;
        this.item.status = this.item.remaining ? EInventoryStatus.Ok : EInventoryStatus.Empty
    }
}

export default BooleanInventoryItemHandler;