const express = require('express');
const formidable = require('express-formidable');
const { isAdmin, requireSignIn } = require('../middlewares/authMiddleware');
const {
  categoryController,
  createCategoryController,
  deleteCategoryController,
  getCategoryPhotourlController,
  singleCategoryController,
  updateCategoryController,
} = require('../controllers/categoryController');

const router = express.Router();

//routes
// create category
router.post(
  "/create-category",
  requireSignIn,
  formidable(),
  isAdmin,
  createCategoryController
);

//update category
router.put(
  "/update-category/:id",
  requireSignIn,
  formidable(),
  isAdmin,
  updateCategoryController
);

//getAll category
router.get("/get-category", categoryController);

//single category
router.get("/single-category/:slug", singleCategoryController);

//delete category
router.delete(
  "/delete-category/:id",
  requireSignIn,
  isAdmin,
  deleteCategoryController
);

//Get URL of photo by id
router.get('/category/photoURL/:id', getCategoryPhotourlController);

module.exports = router;
