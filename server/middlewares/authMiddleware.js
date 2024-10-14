const JWT = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Protected Routes token based
const requireSignIn = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'Authorization header missing!' });
        }

        const decode = JWT.verify(
            req.headers.authorization, 
            process.env.JWT_SECRET
        );
        req.user = decode;   
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Admin access
const isAdmin = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user._id);
        if (user.role !== 1) {
            return res.status(401).send({
                success: false,
                message: "You can't access to this page!",
            });
        } else {
            next();
        }
    } catch (error) {
        console.log(error);
        res.status(401).send({
            success: false,
            error,
            message: "Error in admin middleware",
        });
    }
};

// Employee access
const isEmployee = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user._id);
        if (user.role !== 2) {
            return res.status(401).send({
                success: false,
                message: "You can't access to this page!",
            });
        } else {
            next();
        }
    } catch (error) {
        console.log(error);
        res.status(401).send({
            success: false,
            error,
            message: "Error in employee middleware",
        });
    }
};

module.exports = {
    requireSignIn,
    isAdmin,
    isEmployee
};
