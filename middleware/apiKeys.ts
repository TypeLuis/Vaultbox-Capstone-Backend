import msgError from "../utilities/msgError.js";
import type { RequestHandler } from "express";

const apiKeys = ["perscholas", "ps-example", "hJAsknw-L198sAJD-l3kasx"]


const apiKeysCheck:RequestHandler =  (req, _res, next) => {
    var key = req.query["api-key"]

    // missing key
    if (!key || typeof key !== "string") {
        return next(msgError(400, "API Key Required"))
    }

    // invalid key
    if (!apiKeys.includes(key)) {
        return next(msgError(401, "Invalid API Key"))
    }

    // Valid key! Store it in req.key for route access.
    // have to create a express types file to validate keys in request
    req.key = key;
    next();
}

export default apiKeysCheck