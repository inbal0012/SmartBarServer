
export default abstract class AbstractInventoryItemHandler {
    item;
    abstract update(newValues: {}): { success: boolean; reason: string; };
    abstract updateStatus(): void;
    abstract use(amountUsed: number): void
    abstract checkAvailability(amountNeeded: number): boolean;
}
