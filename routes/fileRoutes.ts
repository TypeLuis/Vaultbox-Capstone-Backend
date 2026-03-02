import express, { type RequestHandler } from "express";
import File from "../models/fileSchema.js";
import mongoose from "mongoose";
import msgError from "../utilities/msgError.js";
import requireBody from "../middleware/requireBody.js";
import { isValidId, toNumber } from "../utilities/functions.js";



const fileRouter = express.Router();

fileRouter
    .route("/")

    .post(
        requireBody(["deviceId", "filename", "sizeMB", "fileType"]),
        (async (req, res, next) => {
            try {
                if (!isValidId(String(req.body.userId))) return next(msgError(400, "Invalid userId"));

                const created = await File.create(req.body)
                res.status(201).json(created)
            } catch (err: any) {
                const error = err
                next(msgError(400, error.message))
            }
        }) as RequestHandler)

    .get((async (req, res, next) => {
        try {
            const { min, max, deviceId, fileType, q } = req.query

            const minSize = toNumber(min)
            const maxSize = toNumber(max)

            const filter: Record<string, any> = {}

            // if (filename) filter.filename = String(filename);
            if (fileType) filter.fileType = String(fileType);

            if (deviceId) {
                if (!isValidId(String(deviceId))) return next(msgError(400, "Invalid deviceId"));
                filter.deviceId = String(deviceId)
            }

            if (minSize !== null || maxSize !== null) {
                filter.price = {}
                if (minSize !== null) filter.price.$gte = minSize
                if (maxSize !== null) filter.price.$lte = maxSize
            }

            // regex to find query in title, $options: "i" to make case insensitive
            if (q) filter.filename = { $regex: String(q), $options: "i" };

            // populates the deviceId with the username and displayName
            const data = await File.find(filter)
                .sort({ createdAt: -1 })
                .populate("deviceId", "name status");

            res.json(data)
        } catch (err) {
            next(err)
        }
    }) as RequestHandler)


fileRouter
    .route('/:id')

    .put(((async (req, res, next) => {
        const id = String(req.params.id)
        if (!isValidId(id)) return next(msgError(400, "Invalid File id"));

        try {
            const updated = await File.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true
            }).populate("deviceId", "name status")

            if (!updated) return next(msgError(404, "File not found"));
            res.json(updated)
        } catch (err: any) {
            next(msgError(400, err.message))
        }
    }) as RequestHandler))

    .delete(((async (req, res, next) => {
        const id = String(req.params.id)
        if (!isValidId(id)) return next(msgError(400, "Invalid File id"));

        try {
            const deleted = await File.findByIdAndDelete(id)
            if (!deleted) return next(msgError(404, "File not found"));
            res.json(deleted)
        } catch (err) {
            next(err)
        }
    }) as RequestHandler))
export default fileRouter;