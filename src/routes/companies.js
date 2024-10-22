const express = require("express");
const db = require('../config/db'); // Ensure this path points to the correct db.js file
const { authenticate } = require("../middlewares/auth");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Get all companies
router.get("/", authenticate(), async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM companies");
    res.json(results);
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a new company
router.post(
  "/",
  authenticate("admin"),
  [
    body("name").isString().notEmpty().withMessage("Name is required"),
    body("category").isString().notEmpty().withMessage("Category is required"),
    body("phone").isString().optional(),
    body("email").isEmail().withMessage("Valid email is required"),
    body("city").isString().optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, category, phone, email, city } = req.body;

    try {
      await db.query(
        "INSERT INTO companies (name, category, phone, email, city) VALUES (?, ?, ?, ?, ?)",
        [name, category, phone, email, city]
      );
      res.status(201).json({ message: "Company added successfully" });
    } catch (err) {
      console.error("Error adding company:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update an existing company
router.put("/:id", authenticate("admin"), async (req, res) => {
  const { id } = req.params;
  const { name, category, phone, email, city } = req.body;

  try {
    const [results] = await db.query(
      "UPDATE companies SET name = ?, category = ?, phone = ?, email = ?, city = ? WHERE id = ?",
      [name, category, phone, email, city, id]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json({ message: "Company updated successfully" });
  } catch (err) {
    console.error("Error updating company:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a company
router.delete("/:id", authenticate("admin"), async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.query("DELETE FROM companies WHERE id = ?", [id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json({ message: "Company deleted successfully" });
  } catch (err) {
    console.error("Error deleting company:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
