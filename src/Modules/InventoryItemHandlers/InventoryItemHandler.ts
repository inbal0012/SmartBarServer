import EInventoryCategory from "src/common/src/Enums/EInventoryCategory";
import EInventoryStatus from "src/common/src/Enums/EInventoryStatus";
import InventoryItem, { NullInventoryItem } from "src/common/src/Modules/InventoryItemModules/InventoryItem";
import AbstractInventoryItemHandler from "./AbstractInventoryItemHandler";

class InventoryItemHandler extends AbstractInventoryItemHandler {
  item: InventoryItem;
  constructor(inventoryItem: InventoryItem) {
    super();
    this.item = inventoryItem;
    this.updateStatus();
  }

  updateStatus() {
    if (this.item.remaining > this.item.minRequired * 2) this.item.status = EInventoryStatus.Ok;
    else if (this.item.remaining > this.item.minRequired)
      this.item.status = EInventoryStatus.AlmostEmpty;
    else this.item.status = EInventoryStatus.Empty;
  }

  use(amountUsed: number): void {
    this.item.remaining -= amountUsed;
    this.updateStatus();
  }

  update(newValues: { itemName: string, itemRemaining: number, itemMinRequired: number }): { success: boolean; reason: string; } {

    var returnStrct = { success: true, reason: "" };
    if (newValues.itemName && newValues.itemName != this.item.name) {
      returnStrct.reason += this.item.name + " renamed to " + newValues.itemName;
      this.item.name = newValues.itemName;
    }
    if (newValues.itemRemaining && newValues.itemRemaining != this.item.remaining) {
      var validate = this.validatePositiveAndNumber("remaining", newValues.itemRemaining)
      if (!validate.success) {
        returnStrct.success = false
        returnStrct.reason += validate.reason + "\n";
      }
      else if (!this.checkAvailability(newValues.itemRemaining)) {
        returnStrct.success = false
        returnStrct.reason += "there's only " + this.item.remaining + " left. you can't use " + newValues.itemRemaining + "\n"
      }
      else {
        this.use(newValues.itemRemaining);

        returnStrct.reason += this.item.name + 'used\n'
      }
    }
    if (newValues.itemMinRequired) {
      var validate = this.validatePositiveAndNumber("minRequired", newValues.itemMinRequired)
      if (!validate.success) {
        returnStrct.success = false
        returnStrct.reason += validate.reason + "\n";
      }
      else {
        this.item.minRequired = newValues.itemMinRequired;
        returnStrct.reason += "minRequired changed to " + newValues.itemMinRequired + "\n"
      }
    }
    return returnStrct;
  }

  checkAvailability(amountNeeded: number): boolean {
    return this.item.remaining > amountNeeded;
  }

  validatePositiveAndNumber(param: string, newValue: any) {
    if (newValue <= 0)
      return {
        success: false,
        reason:
          this.item.name + "'s " + param + " can't be 0 or lower"
      };
    if (typeof (newValue) !== 'number')
      return {
        success: false,
        reason:
          param + " has to be a number"
      };

    return {
      success: true,
      reason:
        ""
    };
  }
}
class NullInventoryItemHandler extends AbstractInventoryItemHandler {

  item: NullInventoryItem;
  constructor() {
    super();
    this.item = new NullInventoryItem();
  }

  checkAvailability(amountNeeded: number) {
    return false;
  }

  updateStatus(): void {
  }

  use(amountUsed: number): void {
  }

  update(newValues: {}) {
    return {
      success: false,
      reason:
        "Unavailable",
    };
  }
}

export default InventoryItemHandler;
export { NullInventoryItemHandler };
