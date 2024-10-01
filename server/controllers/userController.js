const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');
const { comparePassword, hashPassword } = require('../helpers/authHelper');
const JWT = require('jsonwebtoken');

// Register a new user
const registerController = async (req, res) => {
    try {
        const { firstname, lastname, email, password, phone, address } = req.body;
        
        const requiredFields = { firstname, lastname, email, password, phone, address };
        for (const [field, value] of Object.entries(requiredFields)) {
            if (!value) {
                return res.status(400).send({ 
                    success:false,
                    message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required for authentication!` });
            }
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: "An account is already registered with this email. Login or try another email",
            });
        }

        const hashedPassword = await hashPassword(password);
        const user = new userModel({
            firstname,
            lastname,
            email,
            phone,
            address,
            password: hashedPassword,
        });
        await user.save();

        res.status(201).send({
            success: true,
            message: "Account added successfully",
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "An unexpected error occurred. Please try again.",
            error,
        });
    }
};

// Login user
const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).send({
                success: false,
                message: 'Email and password are required',
            });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User doesn't exist. Please register or try another email.",
            });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).send({
                success: false,
                message: "Incorrect password. Please try again.",
            });
        }

        const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).send({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "An unexpected error occurred during login. Please try again.",
            error,
        });
    }
};

// Update profile
const updateProfileController = async (req, res) => {
    try {
        const { firstname, lastname, email, password, address, phone } = req.body;
        const user = await userModel.findById(req.user._id);
        
        if (password && password.length < 6) {
            return res.json({ error: 'Password is required and must be at least 6 characters long' });
        }

        const hashedPassword = password ? await hashPassword(password) : undefined;
        const updatedUser = await userModel.findByIdAndUpdate(req.user._id, {
            firstname: firstname || user.firstname,
            lastname: lastname || user.lastname,
            password: hashedPassword || user.password,
            phone: phone || user.phone,
            address: address || user.address,
        }, { new: true });

        res.status(200).send({
            success: true,
            message: 'Profile updated successfully',
            updatedUser,
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "There was an error in updating the profile",
            error,
        });
    }
};

// Delete user account
const deleteUserController = async (req, res) => {
    try {
        // Find the user by ID and delete
        const user = await userModel.findByIdAndDelete(req.user._id);

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).send({
            success: true,
            message: "Account deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "An error occurred while deleting the account",
            error,
        });
    }
};

// Get user's orders
const getOrdersController = async (req, res) => {
    try {
        const orders = await orderModel
            .find({ buyer: req.user._id })
            .populate("products", "-photo")
            .populate("buyer", "name");
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in getting orders",
            error,
        });
    }
};

// Get all orders
const getAllOrdersController = async (req, res) => {
    try {
        const orders = await orderModel
            .find({})
            .populate("products", "-photo")
            .populate("buyer", "name")
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in getting all orders",
            error,
        });
    }
};

// Update order status
const orderStatusController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const orders = await orderModel.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );
        res.status(200).send({
            success: true,
            message: 'Order status updated successfully',
            orders,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "There was an error while updating the order",
            error,
        });
    }
};

// Update user's address
const updateAddressController = async (req, res) => {
    try {
        const { address } = req.body;
        const updatedAddress = await userModel.findByIdAndUpdate(req.user._id, {
            address: address || req.user.address,
        }, { new: true });

        res.status(200).send({
            success: true,
            message: 'Address updated successfully',
            updatedAddress,
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "There was an error in updating the address",
            error,
        });
    }
};

module.exports = {
    registerController,
    loginController,
    updateProfileController,
    getOrdersController,
    getAllOrdersController,
    orderStatusController,
    updateAddressController,
    deleteUserController,
    
};