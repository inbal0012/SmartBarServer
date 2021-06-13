import EInventoryCategory from 'src/common/src/Enums/EInventoryCategory';
import EInventoryStatus from 'src/common/src/Enums/EInventoryStatus';
import FruitVegetable from 'src/common/src/Modules/InventoryItemModules/FruitVegetable';
import AbstractInventoryItemHandler from './AbstractInventoryItemHandler';

class FruitVegetableHandler extends AbstractInventoryItemHandler {
  item: FruitVegetable

  constructor(fruitVegetable: FruitVegetable) {
    super();
    this.item = fruitVegetable;
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

  //TODO Add used!
  update(newValues: { itemName: string, itemRemaining: number, itemMinRequired: number, itemUse: number }) {
    console.log(newValues.itemName + ", " + newValues.itemRemaining + ", " + newValues.itemMinRequired);

    var returnStrct = { success: true, reason: "" };
    var validate;
    if (newValues.itemName && newValues.itemName != this.item.name) {
      returnStrct.reason += this.item.name + " renamed to " + newValues.itemName;
      this.item.name = newValues.itemName;
    }

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
      validate = this.validatePositiveAndNumber("minRequired", newValues.itemMinRequired)
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
    // case 'category':
    //   if (newValue === EInventoryCategory.Fruits || newValue === EInventoryCategory.Vegetables) {
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

  checkAvailability(amountNeeded: number) {
    return this.item.remaining > amountNeeded;
  }

  static isAFruitVegetableCategory(category: string) {
    if (category === EInventoryCategory.Fruits || category === EInventoryCategory.Vegetables)
      return true;
    else return false;
  }
}

export default FruitVegetableHandler;
