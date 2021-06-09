
export default abstract class AbstractInventoryItemHandler {
    item;
    abstract update(ingredientParam: string, newValue: any);
    abstract updateStatus(): void;
    abstract use(amountUsed: number): void
    abstract checkAvailability(amountNeeded: number): boolean;
}
