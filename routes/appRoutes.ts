import express, { type RequestHandler } from "express";
import App from "../models/appSchema.js";
import msgError from "../utilities/msgError.js";
import mongoose from "mongoose";
import requireBody from "../middleware/requireBody.js";


const isValidId = (id: string) => mongoose.Types.ObjectId.isValid(id)
const appRouter = express.Router();


appRouter
    .route("/")

    .post(
        requireBody(["deviceId", "name", "status", "port"]),
        (async (req, res, next) => {
            try {
                if (!isValidId(String(req.body.deviceId))) return next(msgError(400, "Invalid deviceId"));

                const created = await App.create(req.body)
                res.status(201).json(created)
            } catch (err: any) {
                const error = err
                next(msgError(400, error.message))
            }
        }) as RequestHandler)

    .get((async (req, res, next) => {
        try {
            const { deviceId, status, q, port } = req.query

            const VALID_STATUSES = ["running", "stopped"]
            const filter: Record<string, any> = {}

            if (port) filter.port = String(port);


            if (status) {
                const normalizedStatus = String(status).toLowerCase()
                if (!VALID_STATUSES.includes(normalizedStatus)) {
                    return next(msgError(400, `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`))
                }
                filter.status = normalizedStatus
            }

            if (deviceId) {
                if (!isValidId(String(deviceId))) return next(msgError(400, "Invalid deviceId"));
                filter.deviceId = String(deviceId)
            }

            // regex to find query in title, $options: "i" to make case insensitive
            if (q) filter.name = { $regex: String(q), $options: "i" };

            // populates the deviceId with the username and displayName
            const data = await App.find(filter)
                .sort({ createdAt: -1 })
                .populate("deviceId", "name status");

            res.json(data)
        } catch (err) {
            next(err)
        }
    }) as RequestHandler);

appRouter
    .route('/:id')

    .put(((async (req, res, next) => {
        const id = String(req.params.id)
        if (!isValidId(id)) return next(msgError(400, "Invalid App id"));

        try {
            const updated = await App.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true
            }).populate("deviceId", "name status")

            if (!updated) return next(msgError(404, "App not found"));
            res.json(updated)
        } catch (err: any) {
            next(msgError(400, err.message))
        }
    }) as RequestHandler))

    .delete(((async (req, res, next) => {
        const id = String(req.params.id)
        if (!isValidId(id)) return next(msgError(400, "Invalid App id"));

        try {
            const deleted = await App.findByIdAndDelete(id)
            if (!deleted) return next(msgError(404, "App not found"));
            res.json(deleted)
        } catch (err) {
            next(err)
        }
    }) as RequestHandler))


export default appRouter;