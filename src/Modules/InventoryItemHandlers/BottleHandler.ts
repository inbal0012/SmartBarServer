import EInventoryCategory from "src/common/src/Enums/EInventoryCategory";
import EInventoryStatus from "src/common/src/Enums/EInventoryStatus";
import { Bottle } from "src/common/src/Modules/InventoryItemModules/Bottle";
import AbstractInventoryItemHandler from "./AbstractInventoryItemHandler";

class BottleHandler extends AbstractInventoryItemHandler {
  item: Bottle

  constructor( bottle: Bottle) {
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

  update(ingredientParam: string, newValue: any) {
    switch (ingredientParam) {
      case 'name':
        // TODO
        return { success: false, reason: "You can't change the name" };
      case 'category':
        if (BottleHandler.isABottleCategory(newValue)) {
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
        var validate = this.validatePositiveAndNumber("remaining", newValue)
        if (!validate.success)
          return validate
        if (!this.checkAvailability(newValue))
          return {
            success: false,
            reason:
              "there's only " +
              this.item.remaining +
              " left. you can't use " +
              newValue,
          };
        else {
          this.use(newValue);
          return {
            success: true,
            reason: this.item.name + 'used',
          };
        }
      case "minRequired":
        var validate = this.validatePositiveAndNumber("minRequired", newValue)
        if (!validate.success)
          return validate
        this.item.minRequired = newValue;
        return {
          success: true,
          reason:
            "minRequired changed to " + newValue
        };
      case "alcoholPercentage":
        if (!BottleHandler.isAAlcoholCategory(newValue))
          return {
            success: false,
            reason:
              this.item.name + " is not an Alcohol type. it doesn't have alcohol percentage."
          };
        var validate = this.validatePositiveAndNumber("alcohol percentage", newValue)
        if (!validate.success)
          return validate
        this.item.alcoholPercentage = newValue;
        return {
          success: true,
          reason:
            "alcohol percentage changed to " + newValue
        };
      default:
        return {
          success: false,
          reason:
            this.item.name + " doesn't have a " + ingredientParam + ' parameter',
        };
    }
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
