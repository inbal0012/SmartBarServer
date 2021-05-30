const express = require('express');
const router = express.Router();
const InventoryItem = require('../models/InventoryItem');

// Getting all
router.get('/', async (req, res) => {
  try {
    const inventory = await InventoryItem.find();
    res.send(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Getting one
router.get('/:id', getInventoryItem, (req, res) => {
  res.json(res.item);
});
// Creating one
router.post('/', async (req, res) => {
  const item = new InventoryItem({
    name: req.body.name,
    category: req.body.category,
    remaining: req.body.remaining,
    status: req.body.status,
  });

  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Updating one
router.patch('/:id', getInventoryItem, async (req, res) => {
  if (req.body.name != null) {
    res.item.name = req.body.name;
  }
  if (req.body.category != null) {
    res.item.category = req.body.category;
  }
  if (req.body.remaining != null) {
    res.item.remaining = req.body.remaining;
  }
  if (req.body.status != null) {
    res.item.status = req.body.status;
  }
  try {
    const updatedItem = await res.item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Deleting one
router.delete('/:id', getInventoryItem, async (req, res) => {
  try {
    await res.item.remove();
    res.json({ message: 'Deleted Item' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function getInventoryItem(req, res, next) {
  let item;
  try {
    item = await InventoryItem.findById(req.params.id);
    if (item == null) {
      return res.status(404).json({ message: "can't find item" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  res.item = item;
  next();
}

module.exports = router;
