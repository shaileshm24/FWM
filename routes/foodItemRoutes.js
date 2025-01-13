const express = require('express');
const router = express.Router();
const Food = require('../models/foodItems');
const axios = require('axios');
const authMiddleware = require("../middleware/authMiddleware");

const SPOONACULAR_API_KEY = '2995e680431342cd842b5388f695c3ab';
const SPOONACULAR_URL = 'https://api.spoonacular.com/recipes/findByIngredients';

// Fetch recipes based on available food items
router.get('/fetch',authMiddleware, async (req, res) => {
  try {
    // Fetch food items from the database
     const foods = await Food.find({ user: req.user._id });

    const ingredients = foods.map(food => food.name).join(',');

    // Call Spoonacular API
    const response = await axios.get(SPOONACULAR_URL, {
      params: {
        ingredients,
        number: 5, // Number of recipes to fetch
        apiKey: SPOONACULAR_API_KEY,
      },
    });

    // Return recipes to the client
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new food item (specific /add route)
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const foodItems = req.body.foodItems;

    // Validate input: Ensure foodItems is an array and not empty
    if (!Array.isArray(foodItems) || foodItems.length === 0) {
      return res.status(400).json({ error: 'An array of food items is required.' });
    }

    // Validate each item in the array
    const invalidItems = foodItems.filter(
      (item) => !item.name || !item.category || !item.expiryDate
    );
    if (invalidItems.length > 0) {
      return res.status(400).json({
        error: 'Each food item must have a name, category, and expiry date.',
      });
    }

    // Attach the logged-in user's ID to each food item
    const itemsWithUser = foodItems.map((item) => ({
      ...item,
      user: req.user._id, // Associate with logged-in user
    }));

    // Save all valid food items to the database
    const savedItems = await Food.insertMany(itemsWithUser);

    res.status(201).json({
      message: `${savedItems.length} food items added successfully.`,
      data: savedItems,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all food items
router.get('/foodItems', authMiddleware, async (req, res) => {
  try {
    // Fetch food items associated with the logged-in user
    const foods = await Food.find({ user: req.user._id });

    res.status(200).json({
      message: 'Food items retrieved successfully',
      data: foods,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
