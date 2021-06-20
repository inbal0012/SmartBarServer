/* eslint-disable prettier/prettier */
import * as mongoose from 'mongoose';
import {
  IInventoryItem,
  InventoryItemSchema,
} from 'src/inventory/inventory.model';

export const IngredientSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
  },
  amount: {
    type: Number,
    required: true,
    min: [1, 'Quantity can not be less then 1.'],
  },
  optional: {
    type: Boolean,
    required: true,
  },
});

export const RecipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: { type: [IngredientSchema], required: true },
  method: { type: [String], required: true },
  portion: { type: Number, required: true },
});

export interface IRecipe extends mongoose.Document {
  id: string;
  name: string;
  ingredients: {
    amount: number;
    productId: mongoose.Schema.Types.ObjectId;
    optional: boolean;
  }[];
  method: [string];
  portion: number;
}
