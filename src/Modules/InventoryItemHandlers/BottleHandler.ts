import EInventoryCategory from "src/common/src/Enums/EInventoryCategory";
import EInventoryStatus from "src/common/src/Enums/EInventoryStatus";
import { Bottle } from "src/common/src/Modules/InventoryItemModules/Bottle";
import AbstractInventoryItemHandler from "./AbstractInventoryItemHandler";

class BottleHandler extends AbstractInventoryItemHandler {
  item: Bottle

  constructor(bottle: Bottle) {
    super();
    this.item = bottle;
    this.updateStatus();
  }

  updateStatus() {
    if (this.item.remaining > this.item.minRequired * 2)
      this.item.status = EInventoryStatus.Ok;
    else if (this.item.remaining > this.item.minRequired)
      this.item.status = EInventoryStatus.AlmostEmpty;
    else this.item.status = EInventoryStatus.Empty;
  }

  use(amountUsed: number) {
    this.item.remaining -= amountUsed;
    this.updateStatus();
  }

  update(newValues: { itemName: string, itemRemaining: number, itemMinRequired: number, itemUse: number, itemAlcoholPercentage: number }) {
    var returnStrct = { success: true, reason: "" };
    var validate;
    if (newValues.itemName && newValues.itemName != this.item.name) {
      console.log("name");

      returnStrct.reason += this.item.name + " renamed to " + newValues.itemName + " - ";
      this.item.name = newValues.itemName;
    }
    // case 'category':
    //   if (BottleHandler.isABottleCategory(newValue)) {
    //     this.item.category = newValue;

    //     return {
    //       success: true,
    //       reason: this.item.name + "'s category updated",
    //     };
    //   }
    //   else return {
    //     success: false,
    //     reason: "can't change " + this.item.name + "'s category to " + newValue,
    //   };
    if (newValues.itemRemaining && newValues.itemRemaining != this.item.remaining) {
      console.log("remaining");
      validate = this.validatePositiveAndNumber("remaining", newValues.itemRemaining)
      if (!validate.success) {
        returnStrct.success = false
        returnStrct.reason += validate.reason + " - ";
      }
      else {
        this.item.remaining = newValues.itemRemaining;
        returnStrct.reason += "remaining updated to " + newValues.itemRemaining + " - ";
      }
    }
    if (newValues.itemUse) {
      console.log("use");
      validate = this.validatePositiveAndNumber("usage", newValues.itemUse)
      if (!validate.success) {
        returnStrct.success = false
        returnStrct.reason += validate.reason + " - ";
      }


      else if (!this.checkAvailability(newValues.itemUse)) {
        returnStrct.success = false
        returnStrct.reason += "there's only " + this.item.remaining + " left. you can't use " + newValues.itemUse + " - "
      }

      else {
        this.use(newValues.itemUse);
        console.log(this.item.remaining);

        returnStrct.reason += this.item.name + ' used - '
      }
    }

    if (newValues.itemMinRequired) {
      console.log("minRequired");

      validate = this.validatePositiveAndNumber("minRequired", newValues.itemMinRequired)
      if (!validate.success) {
        returnStrct.success = false
        returnStrct.reason += validate.reason + " - ";
      }
      else {
        this.item.minRequired = newValues.itemMinRequired;
        returnStrct.reason += "minRequired changed to " + newValues.itemMinRequired + " - "
      }
    }

    if (newValues.itemAlcoholPercentage) {
      console.log("minRequired");

      if (!BottleHandler.isAAlcoholCategory(this.item.category)) {
        returnStrct.success = false
        returnStrct.reason += this.item.name + " is not an Alcohol type. it doesn't have alcohol percentage. - "
      }
      else {
        validate = this.validatePositiveAndNumber("alcohol percentage", newValues.itemAlcoholPercentage)
        if (!validate.success) {
          returnStrct.success = false;
          returnStrct.reason += validate.reason + " - ";
        }
        else {
          this.item.alcoholPercentage = newValues.itemAlcoholPercentage;
          returnStrct.reason += "alcohol percentage changed to " + newValues.itemAlcoholPercentage + " - "
        }
      }
    }
    return returnStrct;
  }


  checkAvailability(amountNeeded: number): boolean {
    return this.item.remaining > amountNeeded;
  }

  validatePositiveAndNumber(param: string, newValue: any) {
    if (typeof (newValue) !== 'number')
      return {
        success: false,
        reason:
          param + " has to be a number"
      };

    if (newValue <= 0)
      return {
        success: false,
        reason:
          this.item.name + "'s " + param + " can't be 0 or lower"
      };

    return {
      success: true,
      reason:
        ""
    };
  }

  static isABottleCategory(category: string) {
    if (
      Object.values(EInventoryCategory.BottleCategory).includes(category) ||
      Object.values(EInventoryCategory.BottleCategory.AlcoholCategory).includes(
        category
      )
    )
      return true;
    else return false;
  }

  static isAAlcoholCategory(category: string) {
    if (
      Object.values(EInventoryCategory.BottleCategory.AlcoholCategory).includes(
        category
      )
    )
      return true;
    else return false;
  }
}

export default BottleHandler;
