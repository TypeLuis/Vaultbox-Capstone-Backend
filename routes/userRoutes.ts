import express, { type RequestHandler } from "express";
import User from "../models/userSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { check, validationResult } from "express-validator";
import { JWT_SECRET } from "../utilities/config.js";
import dotenv from 'dotenv'


dotenv.config()


const router = express.Router();

//  @route: POST /api/users
//  @desc: Register/Creating a user
//  @access: Public
router
    .route("/")
    
    .post(
        // array of middleware to check if any of these are validated
        [
            check("name", "name is required").not().isEmpty(),
            check("email", "please include a valid email").isEmail(),
            check("password", "Password needs to be 6 or more characters").isLength({min: 6})
        ],
        (async (req, res) => {
            const errors = validationResult(req)
            // making errors into array to always have the same format
            if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

            const {name, email, password} = req.body;

            try {
                // check if user exists
                let user = await User.findOne({email})
                // respond with error
                if(user) return res.status(400).json({errors : [{msg: "user already exist"}]});
                // create new user Object
                user = new User({
                    name,
                    email,
                    password
                })
                // create salt to hash our password, number represent number of rounds of encryption
                const salt = await bcrypt.genSalt(10) 

                // hash/encrypt our password
                user.password = await bcrypt.hash(password, salt)

                // save user to DB
                await user.save()

                // create payload for JWT
                const payload = {
                    user: {
                        id: user._id,
                        name: user.name // normally would not include name
                    }
                }
                // respond with JWT, because you register and login simultaneously
                jwt.sign(
                    payload, 
                    JWT_SECRET,
                    {expiresIn: "3h"},
                    (err, token) => {
                        if(err) throw err

                        res.json({token})
                    }
                )
            } catch (error:any) {
                console.error(error.message)
                // want to refer them as errors with an array that way both errors are reffered the same way
                res.status(error.status || 500).json({errors: [{msg: `Error: ${error.message}`}]})
            }
        }) as RequestHandler);

export default router;