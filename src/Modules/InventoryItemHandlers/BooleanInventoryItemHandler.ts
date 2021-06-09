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
        console.log("needStatusUpdate = true");

        this.item.needStatusUpdate = true;
    }

    use(amountUsed: number): void {
        this.updateStatus();
    }

    update(newValues: { itemName: string, itemRemaining: number, itemUse: number }) {
        var returnStrct = { success: true, reason: "" };
        if (newValues.itemName && newValues.itemName != this.item.name) {
            returnStrct.reason += this.item.name + " renamed to " + newValues.itemName;
            this.item.name = newValues.itemName;
        }
        if (newValues.itemRemaining) {
            this.updateRemaining(newValues.itemRemaining > 0 ? true : false);
            console.log("remaining");

            returnStrct.reason += this.item.name + ' remaining updated - '

        }
        if (newValues.itemUse) {
            if (!(typeof (newValues.itemUse) === 'number')) {
                returnStrct.success = false;
                returnStrct.reason += "To use " + this.item.name + " you must send a number - "
            }
            else {
                if (newValues.itemUse < 0) {
                    returnStrct.success = false;
                    returnStrct.reason += this.item.name + "'s remaining can't be lower then 0 - "
                }

                else if (!this.checkAvailability(newValues.itemUse)) {
                    returnStrct.success = false;
                    returnStrct.reason += "There is a shortage of " + this.item.name + " - "
                }
                else {
                    if (returnStrct.success) {
                        this.use(newValues.itemUse);
                        returnStrct.reason += this.item.name + ' used - '
                    }
                }
            }

        }
        return returnStrct;
    }

    checkAvailability(amountNeeded: number): boolean {
        return this.item.remaining;
    }

    updateRemaining(isRemained: boolean) {
        this.item.remaining = isRemained;
        this.item.needStatusUpdate = false;
        this.item.status = this.item.remaining ? EInventoryStatus.Ok : EInventoryStatus.Empty
    }

    static isABooleanCategory(category: string) {
        if (category === EInventoryCategory.Herbs || category === EInventoryCategory.Spices)
            return true;
        else return false;
    }
}

export default BooleanInventoryItemHandler;