import * as mongoose from 'mongoose';

export const InventoryItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    remaining: { type: Number, required: true },
    minRequired: { type: Number, required: true },
    alcoholPercentage: { type: Number },
});


export interface InventoryItem extends mongoose.Document {
    id: string
    name: string;
    category: string;
    remaining: number;
    minRequired: number;
    alcoholPercentage: number;
}