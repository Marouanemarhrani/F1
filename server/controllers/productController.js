const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const orderModel = require("../models/orderModel");
const companyModel = require("../models/companyModel");
const fs = require("fs");
const slugify = require("slugify");
const braintree = require('braintree');
const dotenv = require("dotenv");

dotenv.config();

// Payment gateway
const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

const validateProductFields = (fields, files) => {
    const { name, description, price, brand, category, company, quantity } = fields;
    const { photo } = files;
    if (!name) return { error: "Name is required" };
    if (!description) return { error: "Description is required" };
    if (!price) return { error: "Price is required" };
    if (!brand) return { error: "Brand is required" };
    if (!category) return { error: "Category is required" };
    if (!company) return { error: "Company is required" };
    if (!quantity) return { error: "Quantity is required" };
    if (!photo || photo.size > 1000000) return { error: "Photo is required and should be less than 1MB" };
    return null;
};

// Create product
const createProductController = async (req, res) => {
    try {
        const validationError = validateProductFields(req.fields, req.files);
        if (validationError) return res.status(400).send(validationError);

        const { name } = req.fields;
        const { photo } = req.files;
        const product = new productModel({ ...req.fields, slug: slugify(name) });

        if (photo) {
            product.photo.data = fs.readFileSync(photo.path);
            product.photo.contentType = photo.type;
        }

        await product.save();
        res.status(201).send({
            success: true,
            message: 'Product created successfully',
            product,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error creating product',
            error,
        });
    }
};

// Get all products
const getProductsController = async (req, res) => {
    try {
        const products = await productModel.find({})
            .populate('category')
            .populate('brand')
            .populate('company')
            .select("-photo")
            .limit(100)
            .sort({ createdAt: -1 });

        res.status(200).send({
            totalProducts: products.length,
            success: true,
            message: "Products retrieved successfully",
            products,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error retrieving products",
            error,
        });
    }
};

// Get product by slug
const getProductController = async (req, res) => {
    try {
        const product = await productModel.findOne({ slug: req.params.slug })
            .select("-photo")
            .populate("category")
            .populate("brand")
            .populate('company');

        if (!product) {
            return res.status(404).send({
                success: false,
                message: "Product not found",
            });
        }

        res.status(200).send({
            success: true,
            message: "Product details retrieved successfully",
            product,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error retrieving product details",
            error,
        });
    }
};

// Update product
const updateProductController = async (req, res) => {
    try {
        const validationError = validateProductFields(req.fields, req.files);
        if (validationError) return res.status(400).send(validationError);

        const { name } = req.fields;
        const { photo } = req.files;
        const product = await productModel.findByIdAndUpdate(
            req.params.id,
            { ...req.fields, slug: slugify(name) },
            { new: true }
        );

        if (photo) {
            product.photo.data = fs.readFileSync(photo.path);
            product.photo.contentType = photo.type;
        }

        await product.save();
        res.status(200).send({
            success: true,
            message: 'Product updated successfully',
            product,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error updating product',
            error,
        });
    }
};

// Search product
const searchProductController = async (req, res) => {
    try {
        const { keyword } = req.params;
        const results = await productModel.find({
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ],
        }).select("-photo");

        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error searching products",
            error,
        });
    }
};

// Related products
const relatedProductController = async (req, res) => {
    try {
        const { pid, cid } = req.params;
        const products = await productModel.find({
            category: cid,
            _id: { $ne: pid },
        }).select("-photo")
            .limit(3)
            .populate("category")
            .populate("brand")
            .populate('company');

        res.status(200).send({
            success: true,
            products,
        });
    } catch (error) {
        console.error(error);
        res.status(400).send({
            success: false,
            message: "Error retrieving related products",
            error,
        });
    }
};

// Products by category
const productCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.findOne({ slug: req.params.slug });
        const products = await productModel.find({ category }).populate('category').populate('brand').populate('company');

        res.status(200).send({
            success: true,
            category,
            products,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error retrieving products by category",
            error,
        });
    }
};

// Search product by ID
const searchProductIDController = async (req, res) => {
    try {
        const product = await productModel.findOne({ _id: req.params.id })
            .select("-photo")
            .populate("category")
            .populate("brand")
            .populate('company');

        if (!product) {
            return res.status(404).send({
                success: false,
                message: "Product not found",
            });
        }

        res.status(200).send({
            success: true,
            message: "Product details retrieved successfully",
            product,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error retrieving product details",
            error,
        });
    }
};

// Get photo URL
const getPhotourlController = async (req, res) => {
    try {
        const photoURL = await productModel.findById(req.params.id).select("photo");
        if (photoURL.photo.data) {
            res.set("Content-type", photoURL.photo.contentType);
            return res.status(200).send(photoURL.photo.data);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "There was an error in getting the photo url",
            error,
        });
    }
};

// Delete product
const deleteProductController = async (req, res) => {
    try {
        const productId = req.params.id;
        const result = await productModel.findByIdAndDelete(productId);

        if (!result) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Filters
const productFiltersController = async (req, res) => {
    try {
      const { checked, radio, companies } = req.body;
      let args = {};
  
      if (checked.length > 0) args.category = { $in: checked };
  
      if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
  
      if (companies && companies.length > 0) {
        args.company = { $in: companies };
      }
  
      const products = await productModel.find(args);
      
      res.status(200).send({
        success: true,
        products,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: "Error in filtering products",
        error,
      });
    }
};

// Product count
const productCountController = async (req, res) => {
    try {
        const total = await productModel.find({}).estimatedDocumentCount();
        res.status(200).send({
            success: true,
            total,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "There was an error in product counting",
            error,
        });
    }
};

// Products per page
const productListController = async (req, res) => {
    try {
        const perPage = 6;
        const page = req.params.page ? req.params.page : 1;
        const products = await productModel
            .find({})
            .select("-photo")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ createdAt: -1 });
        res.status(200).send({
            success: true,
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "There was an error in product per page",
            error,
        });
    }
};

// Get bestseller products
const getBestsellerProducts = async (req, res) => {
    try {
        const bestsellers = await productModel.find({ bestseller: true })
            .populate("category")
            .populate("brand")
            .populate('company');

        if (bestsellers.length === 0) {
            return res.status(404).json({
                message: 'No bestseller products found.'
            });
        }

        res.status(200).send({
            success: true,
            bestsellers,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server error while fetching bestseller products',
            error: error.message
        });
    }
};

// Braintree token
const braintreeTokenController = async (req, res) => {
    try {
        gateway.clientToken.generate({}, function (err, response) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.send(response);
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "There was an error in payment gateway api",
            error,
        });
    }
};

// Braintree payment
const brainTreePaymentController = async (req, res) => {
    try {
        const { cart, nonce } = req.body;
        let total = 0;
        cart.map((i) => {
            total += i.price;
        });
        let newTransaction = gateway.transaction.sale({
            amount: total,
            paymentMethodNonce: nonce,
            options: {
                submitForSettlement: true,
            },
        },
        function (error, result) {
            if (result) {
                const order = new orderModel({
                    products: cart,
                    payment: result,
                    buyer: req.user._id,
                }).save();
                res.json({ ok: true });
            } else {
                res.status(500).send(error);
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "There was an error in Payment",
            error,
        });
    }
};

// Products by company
const productCompanyController = async (req, res) => {
    try {
        const company = await companyModel.findOne({ slug: req.params.slug });
        const products = await productModel.find({ company }).populate('category').populate('brand').populate('company');

        res.status(200).send({
            success: true,
            company,
            products,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error retrieving products by company",
            error,
        });
    }
};

module.exports = {
    createProductController,
    getProductsController,
    getProductController,
    updateProductController,
    searchProductController,
    relatedProductController,
    productCategoryController,
    searchProductIDController,
    getPhotourlController,
    deleteProductController,
    productFiltersController,
    productCountController,
    productListController,
    getBestsellerProducts,
    braintreeTokenController,
    brainTreePaymentController,
    productCompanyController,
};
