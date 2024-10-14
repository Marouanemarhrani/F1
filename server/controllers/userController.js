const userModel = require('../models/userModel');
const { comparePassword, hashPassword } = require('../helpers/authHelper');
const JWT = require('jsonwebtoken');

// Register a new user
const registerController = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, phone, street, postalCode, city, country } = req.body;

        // Check if required fields are provided
        const requiredFields = { firstName, lastName, email, password, confirmPassword, phone, street, postalCode, city, country };
        for (const [field, value] of Object.entries(requiredFields)) {
            if (!value) {
                return res.status(400).send({ 
                    success: false,
                    message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required for registration!`
                });
            }
        }

        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            return res.status(400).send({
                success: false,
                message: "Password and Confirm Password do not match",
            });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: "An account is already registered with this email. Please try another email or login.",
            });
        }

        // Hash password and create user
        const hashedPassword = await hashPassword(password);
        const user = new userModel({
            firstName,
            lastName,
            email,
            phone,
            address: {
                street,
                postalCode,
                city,
                country
            },
            password: hashedPassword,
        });
        await user.save();

        res.status(201).send({
            success: true,
            message: "Account created successfully",
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "An unexpected error occurred during registration. Please try again.",
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
                message: "User not found. Please register first.",
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
                firstName: user.firstName,
                lastName: user.lastName,
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

// Update profile (without password update)
const updateProfileController = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, street, postalCode, city, country } = req.body;
        const user = await userModel.findById(req.user._id);

        const updatedUser = await userModel.findByIdAndUpdate(req.user._id, {
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            email: email || user.email,
            phone: phone || user.phone,
            address: {
                street: street || user.address.street,
                postalCode: postalCode || user.address.postalCode,
                city: city || user.address.city,
                country: country || user.address.country
            }
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
            message: "There was an error updating the profile",
            error,
        });
    }
};

// Update password
const updatePasswordController = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        // Check if all fields are provided
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).send({
                success: false,
                message: "All fields are required to update the password",
            });
        }

        // Check if new passwords match
        if (newPassword !== confirmNewPassword) {
            return res.status(400).send({
                success: false,
                message: "New Password and Confirm New Password do not match",
            });
        }

        const user = await userModel.findById(req.user._id);

        // Check if old password matches
        const isMatch = await comparePassword(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).send({
                success: false,
                message: "Old password is incorrect",
            });
        }

        // Update with the new password
        const hashedNewPassword = await hashPassword(newPassword);
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).send({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "An error occurred while updating the password",
            error,
        });
    }
};

// Delete user account
const deleteUserController = async (req, res) => {
    try {
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

module.exports = {
    registerController,
    loginController,
    updateProfileController,
    updatePasswordController, 
    deleteUserController,
};
