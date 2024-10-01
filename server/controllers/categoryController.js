const categoryModel = require('../models/categoryModel');
const slugify = require('slugify');
const fs = require('fs');

const validateCategoryFields = (fields, files) => {
  const { name } = fields;
  const { photo } = files;
  if (!name) return { error: "Name is required" };
  if (!photo || photo.size > 1000000) return { error: "Photo is required and should be less than 1MB" };
  return null;
};

// Create category
const createCategoryController = async (req, res) => {
  try {
      const validationError = validateCategoryFields(req.fields, req.files);
      if (validationError) return res.status(400).send(validationError);

      const { name } = req.fields;
      const { photo } = req.files;
      const existingCategory = await categoryModel.findOne({ name });
      if (existingCategory) {
        return res.status(200).send({
          success: false,
          message: "Category Already Exists",
        });
      }
      const category = new categoryModel({ ...req.fields, slug: slugify(name) });

      if (photo) {
        category.photo.data = fs.readFileSync(photo.path);
        category.photo.contentType = photo.type;
      }

      await category.save();
      res.status(201).send({
        success: true,
        message: 'Category created successfully',
        category,
      });
  } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message: 'Error creating category',
        error,
      });
  }
};

// Update category
const updateCategoryController = async (req, res) => {
  try {
      const validationError = validateCategoryFields(req.fields, req.files);
      if (validationError) return res.status(400).send(validationError);

      const { name } = req.fields;
      const { photo } = req.files;
      const category = await categoryModel.findByIdAndUpdate(
          req.params.id,
          { ...req.fields, slug: slugify(name) },
          { new: true }
      );

      if (photo) {
        category.photo.data = fs.readFileSync(photo.path);
        category.photo.contentType = photo.type;
      }

      await category.save();
      res.status(200).send({
        success: true,
        message: 'Category updated successfully',
        category,
      });
  } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message: 'Error updating category',
        error,
      });
  }
};

// Get all categories
const categoryController = async (req, res) => {
  try {
    const categories = await categoryModel.find({}).select("-photo");
    res.status(200).send({
      success: true,
      message: "All Categories List",
      categories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting all categories",
    });
  }
};

// Get single category
const singleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug }).select("-photo");
    res.status(200).send({
      success: true,
      message: "Get Single Category Successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting single category",
    });
  }
};

// Delete category
const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    await categoryModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Category Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting category",
      error,
    });
  }
};

// Get category photo URL
const getCategoryPhotourlController = async (req, res) => {
  try {
      const photoURL = await categoryModel.findById(req.params.id).select("photo");
      if (photoURL.photo.data) {
          res.set("Content-type", photoURL.photo.contentType);
          return res.status(200).send(photoURL.photo.data);
      }
  } catch (error) {
      console.log(error);
      res.status(500).send({
          success: false,
          message: "There was an error in getting the photo URL",
          error,
      });
  }
};

module.exports = {
  createCategoryController,
  updateCategoryController,
  categoryController,
  singleCategoryController,
  deleteCategoryController,
  getCategoryPhotourlController,
};
