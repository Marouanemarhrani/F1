const express = require('express');
const { 
    registerController, 
    loginController, 
    updateProfileController, 
    getAllOrdersController, 
    orderStatusController, 
    getOrdersController, 
    updateAddressController, 
    deleteUserController
} = require('../controllers/userController');
const { isAdmin, isTechnician, requireSignIn } = require('../middlewares/authMiddleware');

const router = express.Router();

// Routing
// Register a new user
router.post('/register', registerController);

// User login
router.post('/login', loginController);

// Update user profile
router.put('/profile', requireSignIn, updateProfileController);

// Protected user route auth
router.get("/user-auth", requireSignIn, (req, res) => {
    res.status(200).send({ ok: true });
});

// Protected admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
    res.status(200).send({ ok: true });
});

// Protected technician route auth
router.get("/technician-auth", requireSignIn, isTechnician, (req, res) => {
    res.status(200).send({ ok: true });
});

// Orders
router.get('/orders', requireSignIn, getOrdersController);

// All orders
router.get('/all-orders', requireSignIn, isAdmin, getAllOrdersController);

// Order status update
router.put("/order-status/:orderId", requireSignIn, isAdmin, orderStatusController);

// Update user address
router.put('/update-address', requireSignIn, updateAddressController);

//delete account
router.delete('/delete-account', requireSignIn, deleteUserController);

module.exports = router;