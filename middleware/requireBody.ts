import type { RequestHandler } from "express"
import msgError from "../utilities/msgError.js"

// this is a function within a function to use the fields parameter inside the the requesthandler function. we need the field parameter to apply the keys in the parameter when calling. this has to be used in the route itself and not in app.use()
const requireBody =
  (fields: string[]): RequestHandler => (req, res, next) => {
    for (const field of fields) {
      if (!req.body?.[field]) {
        return next(msgError(400, `Missing field: ${field}`))
      }
    }
    next()
}

export default requireBody