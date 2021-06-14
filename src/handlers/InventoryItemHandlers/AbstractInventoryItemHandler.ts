/* eslint-disable prettier/prettier */
import { IUpdateResponse } from 'src/common/src/Interface/updateResponse';

export default abstract class AbstractInventoryItemHandler {
    item;
    // eslint-disable-next-line @typescript-eslint/ban-types
    abstract update(newValues: {}): IUpdateResponse;
    abstract updateStatus(): void;
    abstract use(amountUsed: number): void;
    abstract checkAvailability(amountNeeded: number): boolean;
}
