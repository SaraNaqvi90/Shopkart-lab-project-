const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

async function registerUser(req, res) {
    try {
        const { fullName, email, password, phone } = req.body;

        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

      
        const isUserAlreadyExists = await userModel.findOne({ email });

        if (isUserAlreadyExists) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters"
            });
        }

      
        const hash = await bcrypt.hash(password, 10);

     
        const user = await userModel.create({
            fullName,
            email,
            password: hash,
            phone
        });

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}


async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

      
        const token = jwt.sign(
            {
                id: user._id
            },
            process.env.JWT_SECRET
        );

       
        res.cookie("token", token, {
            httpOnly: true
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            customer: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

async function getMe(req, res) {

    return res.status(200).json({
        _id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        phone: req.user.phone
    });

}

async function logoutUser(req, res) {

    res.clearCookie("token");

    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });

}
module.exports = {
    registerUser,
    loginUser,
    getMe,
    logoutUser
};