/* eslint-disable prettier/prettier */
import EInventoryCategory from 'src/common/src/Enums/EInventoryCategory';
import EInventoryStatus from 'src/common/src/Enums/EInventoryStatus';
import { IUpdateResponse } from 'src/common/src/Interface/updateResponse';
import InventoryItem, {
  NullInventoryItem,
} from 'src/common/src/Model/InventoryModel/InventoryItem';
import AbstractInventoryItemHandler from './AbstractInventoryItemHandler';

class InventoryItemHandler extends AbstractInventoryItemHandler {
  item: InventoryItem;
  constructor(inventoryItem: InventoryItem) {
    super();
    this.item = inventoryItem;
    this.updateStatus();
  }

  updateStatus() {
    if (this.item.remaining > this.item.minRequired * 2)
      this.item.status = EInventoryStatus.Ok;
    else if (this.item.remaining > this.item.minRequired)
      this.item.status = EInventoryStatus.AlmostEmpty;
    else this.item.status = EInventoryStatus.Empty;
  }

  use(amountUsed: number): void {
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
      res = this.updateNumericParam(newValues.itemRemaining, 'remaining');
      if (!res.success) {
        returnStruct.success = false;
        returnStruct.reason.push(res.reason);
      }
    }
    //Use
    if (newValues.itemUse) {
      console.log('use');
      res = this.updateUse(newValues.itemUse);
      if (!res.success) {
        returnStruct.success = false;
        returnStruct.reason.push(res.reason);
      }
    }
    //min required
    if (newValues.itemMinRequired) {
      console.log('minRequired');
      res = this.updateNumericParam(newValues.itemMinRequired, 'minRequired');
      if (!res.success) {
        returnStruct.success = false;
        returnStruct.reason.push(res.reason);
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

  checkAvailability(amountNeeded: number): boolean {
    return this.item.remaining >= amountNeeded;
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

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updateStatus(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  use(amountUsed: number): void {}

  // eslint-disable-next-line @typescript-eslint/ban-types
  update(newValues: {}) {
    return {
      success: false,
      reason: ['Unavailable'],
    };
  }
}

export default InventoryItemHandler;
export { NullInventoryItemHandler };
