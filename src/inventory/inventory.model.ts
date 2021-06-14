/* eslint-disable prettier/prettier */
import * as mongoose from 'mongoose';

export const InventoryItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    remaining: { type: Number, required: true },
    minRequired: { type: Number },
    alcoholPercentage: { type: Number },
    needStatusUpdate: { type: Boolean },
});

export interface IInventoryItem extends mongoose.Document {
    id: string;
    name: string;
    category: string;
    status: number;
    remaining: number;
    minRequired: number;
    alcoholPercentage: number;
    needStatusUpdate: boolean;
}
