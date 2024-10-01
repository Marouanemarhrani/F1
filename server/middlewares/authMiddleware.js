const JWT = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Protected Routes token base
const requireSignIn = async (req, res, next) => {
    try {
        const decode = JWT.verify(
            req.headers.authorization, 
            process.env.JWT_SECRET
        );
        req.user = decode;   
        next();
    } catch (error) {
        console.log(error);
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

// Technician access
const isTechnician = async (req, res, next) => {
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
            message: "Error in technician middleware",
        });
    }
};

module.exports = {
    requireSignIn,
    isAdmin,
    isTechnician
};