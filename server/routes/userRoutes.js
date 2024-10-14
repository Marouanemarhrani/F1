const express = require('express');
const { 
    registerController, 
    loginController, 
    updateProfileController, 
    updatePasswordController,  
    deleteUserController
} = require('../controllers/userController');
const { isAdmin, isEmployee, requireSignIn } = require('../middlewares/authMiddleware');  // isEmployee instead of isTechnician

const router = express.Router();

// Routing
// Register a new user
router.post('/register', registerController);

// User login
router.post('/login', loginController);

// Update user profile (without password)
router.put('/profile', requireSignIn, updateProfileController);

// Update password
router.put('/update-password', requireSignIn, updatePasswordController); 

// Protected user route auth
router.get("/user-auth", requireSignIn, (req, res) => {
    res.status(200).send({ ok: true });
});

// Protected admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
    res.status(200).send({ ok: true });
});

// Protected employee route auth
router.get("/employee-auth", requireSignIn, isEmployee, (req, res) => {
    res.status(200).send({ ok: true });
});

// Delete account
router.delete('/delete-account', requireSignIn, deleteUserController);

module.exports = router;
