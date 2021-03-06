/* eslint-disable prettier/prettier */
import EInventoryStatus from 'src/common/src/Enums/EInventoryStatus';
import { IUpdateResponse } from 'src/common/src/Interface/updateResponse';
import { Bottle } from 'src/common/src/Model/InventoryModel/Bottle';
import AbstractInventoryItemHandler from './AbstractInventoryItemHandler';

class BottleHandler extends AbstractInventoryItemHandler {
  item: Bottle;

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

  update(newValues: {
    itemName: string;
    itemRemaining: number;
    itemMinRequired: number;
    itemUse: number;
    itemAlcoholPercentage: number;
  }) {
    const returnStruct: IUpdateResponse = { success: true, reason: [] };
    let res: { success: boolean; reason: string };
    //name
    if (newValues.itemName && newValues.itemName != this.item.name) {
      this.item.name = newValues.itemName;
    }
    //remaining
    if (
      newValues.itemRemaining &&
      newValues.itemRemaining != this.item.remaining
    ) {
      console.log('remaining');
      res = this.updateNumericParam(newValues.itemRemaining, "remaining");
      if (!res.success) {
        returnStruct.success = false;
        returnStruct.reason.push(res.reason)
      }
    }
    //Use
    if (newValues.itemUse) {
      console.log('use');
      res = this.updateUse(newValues.itemUse);
      if (!res.success) {
        returnStruct.success = false;
        returnStruct.reason.push(res.reason)
      }
    }
    //min required
    if (newValues.itemMinRequired) {
      console.log('minRequired');
      res = this.updateNumericParam(newValues.itemMinRequired, 'minRequired');
      if (!res.success) {
        returnStruct.success = false;
        returnStruct.reason.push(res.reason)
      }
    }
    //alcohol percentage
    if (newValues.itemAlcoholPercentage) {
      console.log('alcoholPercentage');
      res = this.updateAlcoholPercentage(newValues.itemAlcoholPercentage);
      if (!res.success) {
        returnStruct.success = false;
        returnStruct.reason.push(res.reason)
      }
    }
    return returnStruct;
  }

  updateNumericParam(numToUpdate: number, prop): { success: boolean; reason: string } {
    const validate = this.validatePositiveAndNumber(
      prop,
      numToUpdate);
    if (!validate.success) {
      return {
        success: false,
        reason: validate.reason,
      };
    }
    this.item[prop] = numToUpdate;
    return {
      success: true,
      reason: '',
    };
  }

  updateUse(itemUse: number): { success: boolean; reason: string; } {
    const validate = this.validatePositiveAndNumber('usage', itemUse);
    if (!validate.success) {
      return {
        success: false,
        reason: validate.reason,
      };
    }
    if (!this.checkAvailability(itemUse)) {
      return {
        success: false,
        reason:
          "there's only " +
          this.item.remaining +
          " left. you can't use " +
          itemUse,
      };
    }
    this.use(itemUse);
    return {
      success: true,
      reason: '',
    };

  }

  updateAlcoholPercentage(itemAlcoholPercentage: number): { success: boolean; reason: string; } {
    if (!Bottle.isAAlcoholCategory(this.item.category)) {
      return {
        success: false,
        reason: this.item.name + " is not an Alcohol type. it doesn't have alcohol percentage",
      };
    }
    return this.updateNumericParam(itemAlcoholPercentage, 'alcoholPercentage');
  }

  checkAvailability(amountNeeded: number): boolean {
    return this.item.remaining >= amountNeeded;
  }

  validatePositiveAndNumber(param: string, newValue: any) {
    if (typeof newValue !== 'number')
      return {
        success: false,
        reason: param + ' has to be a number',
      };

    if (newValue <= 0)
      return {
        success: false,
        reason: this.item.name + "'s " + param + " can't be 0 or lower",
      };

    return {
      success: true,
      reason: '',
    };
  }
}

export default BottleHandler;
