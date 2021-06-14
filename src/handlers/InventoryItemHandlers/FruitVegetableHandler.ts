/* eslint-disable prettier/prettier */
import EInventoryCategory from 'src/common/src/Enums/EInventoryCategory';
import EInventoryStatus from 'src/common/src/Enums/EInventoryStatus';
import { IUpdateResponse } from 'src/common/src/Interface/updateResponse';
import FruitVegetable from 'src/common/src/Model/InventoryModel/FruitVegetable';
import AbstractInventoryItemHandler from './AbstractInventoryItemHandler';

class FruitVegetableHandler extends AbstractInventoryItemHandler {
  item: FruitVegetable;

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

  update(newValues: {
    itemName: string;
    itemRemaining: number;
    itemMinRequired: number;
    itemUse: number;
  }): IUpdateResponse {
    const returnStruct: IUpdateResponse = { success: true, reason: [] };
    let res: { success: boolean; reason: string };
    
    if (newValues.itemName && newValues.itemName != this.item.name) {
      this.item.name = newValues.itemName;
    }

    if (
      newValues.itemRemaining &&
      newValues.itemRemaining != this.item.remaining
    ) {
      console.log('remaining');
      res = this.updateRemaining(newValues.itemRemaining);
      if (!res.success) {
        returnStruct.success = false;
        returnStruct.reason.push(res.reason);
      }
    }
    if (newValues.itemUse) {
      console.log('use');
      res = this.updateUse(newValues.itemUse);
      if (!res.success) {
        returnStruct.success = false;
        returnStruct.reason.push(res.reason);
      }
    }

    if (newValues.itemMinRequired) {
      console.log('minRequired');
      res = this.updateMinRequired(newValues.itemMinRequired);
      if (!res.success) {
        returnStruct.success = false;
        returnStruct.reason.push(res.reason);
      }
    }
    return returnStruct;
  }

  updateMinRequired(itemMinRequired: number): {
    success: boolean;
    reason: string;
  } {
    const validate = this.validatePositiveAndNumber(
      'minRequired',
      itemMinRequired,
    );
    if (!validate.success) {
      return {
        success: false,
        reason: validate.reason,
      };
    } else {
      this.item.minRequired = itemMinRequired;
    }
  }
  updateUse(itemUse: number): { success: boolean; reason: string } {
    const validate = this.validatePositiveAndNumber('usage', itemUse);
    if (!validate.success) {
      return {
        success: false,
        reason: validate.reason,
      };
    } else if (!this.checkAvailability(itemUse)) {
      return {
        success: false,
        reason:
          "there's only " +
          this.item.remaining +
          " left. you can't use " +
          itemUse,
      };
    } else {
      this.use(itemUse);
    }
  }
  updateRemaining(itemRemaining: number): { success: boolean; reason: string } {
    const validate = this.validatePositiveAndNumber('remaining', itemRemaining);
    if (!validate.success) {
      return {
        success: false,
        reason: validate.reason,
      };
    } else {
      this.item.remaining = itemRemaining;
      return {
        success: true,
        reason: '',
      };
    }
  }
  validatePositiveAndNumber(param: string, newValue: any) {
    if (newValue <= 0)
      return {
        success: false,
        reason: this.item.name + "'s " + param + " can't be 0 or lower",
      };
    if (typeof newValue !== 'number')
      return {
        success: false,
        reason: param + ' has to be a number',
      };

    return {
      success: true,
      reason: '',
    };
  }

  checkAvailability(amountNeeded: number) {
    return this.item.remaining > amountNeeded;
  }

  static isAFruitVegetableCategory(category: string) {
    if (
      category === EInventoryCategory.Fruits ||
      category === EInventoryCategory.Vegetables
    )
      return true;
    else return false;
  }
}

export default FruitVegetableHandler;
