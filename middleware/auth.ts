import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../utilities/config.js";
import { type RequestHandler } from "express";

// added to decoded to make sure .user exitst in decoded
type AuthTokenPayload = JwtPayload & {
    user: {
      id: string;
    };
};

export const auth: RequestHandler = (req,res,next) => {
    const token = req.header('x-auth-token')

    if(!token) return res.status(401).json({errors : [{msg: "No token, Auth denied"}]});

    try {
       //decode token. Checks if token is ours (we created it with our signature) AND if its not expired
        const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
        // set req.user to the decoded user information from payload.
        // Standard practice to put in req.user for easy use
        // added a user interface in express types folder for req.user to be accepted
        req.user = decoded.user;
        next()
    } catch (error:any) {
        console.error(error.message);
        res.status(401).json({errors : [{mag: "token is not valid"}]})
    }
}