import type { RequestHandler } from "express"

const notFound: RequestHandler = (req, res) => {
    res.status(404).json({
      error: "Route not found",
      path: req.originalUrl
    })
}

export default notFound