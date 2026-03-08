import express, { type RequestHandler } from "express";
import Device from "../models/deviceSchema.js";
import mongoose from "mongoose";
import msgError from "../utilities/msgError.js";
import requireBody from "../middleware/requireBody.js";
import { getRequesterUserId, isValidId, toNumber } from "../utilities/functions.js";
import si from "systeminformation";
import { auth } from "../middleware/auth.js";


type Drives = {
    fs: string,
    type: string,
    size: number,
    used: number,
    available: number,
    use: number,
    mount: string,
    rw: boolean
}


const deviceRouter = express.Router();

deviceRouter
    .route("/")

    .post(
        auth,
        (async (req, res, next) => {
            const q = String(req.query.q || "");
            const userId = getRequesterUserId(req);
            if (!userId) return next(msgError(401, "Missing user context"));
            if (!isValidId(String(userId))) return next(msgError(400, "Invalid userId"));
            try {
                const getDriveInfo = (drives: Drives[]) => {
                    return drives.map((drive) => ({
                        fs: drive.fs,
                        type: drive.type,
                        mount: drive.mount,
                        sizeMB: parseFloat((drive.size / 1e6).toFixed(2)),
                        usedMB: parseFloat((drive.used / 1e6).toFixed(2)),
                        availableMB: parseFloat((drive.available / 1e6).toFixed(2)),
                        usePercent: drive.use,
                        rw: drive.rw,
                    }))
                }
                let deviceData;
                const useSystemInfo = q.toLowerCase() === "yes";

                if (useSystemInfo) {
                    const [osInfo, fsSize] = await Promise.all([
                        si.osInfo(),
                        si.fsSize(),
                    ]);

                    const platform = osInfo.platform.toLowerCase()
                    // normalize rw: boolean: null -> false
                    const normalizedDrives: Drives[] = fsSize.filter((d) => d.fs !== "overlay").map((d) => ({
                        ...d,
                        rw: d.rw ?? false,
                    }));
                    deviceData = {
                        userId,
                        name: osInfo.hostname,
                        os: platform,
                        real: true,
                        drives: getDriveInfo(normalizedDrives),
                        status: "online",
                    };
                } else {
                    const name = "Test Device"
                    const drives = [
                        {
                            fs: '/dev/mapper/ubuntu--vg-ubuntu--lv',
                            type: 'ext4',
                            sizeMB: 61075263488,
                            usedMB: 29964328960,
                            availableMB: 27975274496,
                            usePercent: 51.72,
                            mount: '/',
                            rw: true
                        },
                        {
                            fs: '/dev/sdb1',
                            type: 'ext4',
                            sizeMB: 13889009823744,
                            usedMB: 196360871936,
                            availableMB: 12992606248960,
                            usePercent: 1.49,
                            mount: '/mnt/data',
                            rw: true
                        }
                    ]
                    const [platform, real] = ["windows", false]
                    if (!name) return next(msgError(400, "name is required when not using system info"));
                    if (!drives || !Array.isArray(drives) || drives.length === 0)
                        return next(msgError(400, "drives array is required when not using system info"));

                    deviceData = { userId, name, os: platform, real, drives, status: "online" };
                }

                const existingDevice = await Device.findOne({
                    userId,
                    name: deviceData.name,
                });

                if (existingDevice) {
                    return next(msgError(409, "Device already exists"));
                }

                const created = await Device.create(deviceData)
                res.status(201).json(created)
            } catch (err: any) {
                const error = err
                next(msgError(400, error.message))
            }
        }) as RequestHandler)

    .get(auth, (async (req, res, next) => {
        try {
            const { status, q } = req.query
            const userId = getRequesterUserId(req);
            const VALID_STATUSES = ["online", "offline"]
            const filter: Record<string, any> = {
                userId: userId // only logged-in user's devices
            };

            if (status) {
                const normalizedStatus = String(status).toLowerCase()
                if (!VALID_STATUSES.includes(normalizedStatus)) {
                    return next(msgError(400, `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`))
                }
                filter.status = normalizedStatus
            }

            if (userId) {
                if (!isValidId(String(userId))) return next(msgError(400, "Invalid userId"));
                filter.userId = String(userId)
            }

            // regex to find query in title, $options: "i" to make case insensitive
            if (q) filter.name = { $regex: String(q), $options: "i" };

            // populates the userId with the username and displayName
            const data = await Device.find(filter)
                .sort({ createdAt: -1 })
                .populate("userId", "name email");

            res.json(data)
        } catch (err) {
            next(err)
        }
    }) as RequestHandler);


deviceRouter
    .route('/:id')

    .put(auth, ((async (req, res, next) => {
        const id = String(req.params.id)
        const userId = getRequesterUserId(req)
        if (!userId) return next(msgError(401, "Missing user context"))
        if (!isValidId(userId)) return next(msgError(400, "Invalid User id"));
        if (!isValidId(id)) return next(msgError(400, "Invalid device id"));

        try {
            const device = await Device.findById(id);

            if (!device) {
                return next(msgError(404, "Device not found"));
            }

            if (String(device.userId) !== String(userId)) {
                return next(msgError(403, "Forbidden"));
            }
            const updated = await Device.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true,
            }).populate("userId", "name email")

            if (!updated) return next(msgError(404, "device not found"));
            res.json(updated)
        } catch (err: any) {
            next(msgError(400, err.message))
        }
    }) as RequestHandler))

    .delete(auth, ((async (req, res, next) => {
        const id = String(req.params.id)
        const userId = getRequesterUserId(req)
        if (!userId) return next(msgError(401, "Missing user context"))
        if (!isValidId(userId)) return next(msgError(400, "Invalid User id"));
        if (!isValidId(id)) return next(msgError(400, "Invalid device id"));

        try {
            const device = await Device.findById(id);

            if (!device) return next(msgError(404, "Device not found"));

            if (String(device.userId) !== String(userId)) return next(msgError(403, "Forbidden"));

            const deleted = await Device.findByIdAndDelete(id)
            if (!deleted) return next(msgError(404, "Device not found"));
            res.json(deleted)
        } catch (err) {
            next(err)
        }
    }) as RequestHandler))

export default deviceRouter;