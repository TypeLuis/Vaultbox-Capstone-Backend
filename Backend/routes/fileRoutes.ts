import express, { type RequestHandler } from "express";
import crypto from "crypto";
import path from "path";
import File from "../models/fileSchema.js";
import Device, { type DeviceSchema } from "../models/deviceSchema.js";
import msgError from "../utilities/msgError.js";
import { isValidId, toNumber } from "../utilities/functions.js";
import { upload } from "../config/upload.js";
import { minio, MINIO_BUCKET } from "../config/minioClient.js";
import { auth } from "../middleware/auth.js";

const fileRouter = express.Router();


function getRequesterUserId(req: any): string | null {
  // Prefer auth middleware
  if (req.user?.id) return String(req.user.id);

  // Fallbacks
  if (req.body?.userId) return String(req.body.userId);
  if (req.query?.userId) return String(req.query.userId);

  return null;
}

async function assertOwnsDevice(userId: string, deviceId: string) {
  const device = await Device.findById(deviceId).select("userId");
  if (!device) throw msgError(404, "Device not found");
  if (String(device.userId) !== String(userId)) throw msgError(403, "Forbidden");
}


//  Helper: build a safe key that won’t collide and is future-proof.
function buildObjectKey(userId: string, deviceId: string, storedName: string) {
  // You can change this later without breaking old files because objectKey is stored in DB.
  return `user/${userId}/device/${deviceId}/files/${storedName}`;
}


//  * Optional checksum (SHA256) for integrity tracking.
function sha256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// --------------------
// LIST FILES (metadata)
// GET /api/files?deviceId=... [&userId=... if not using req.user]
// --------------------
fileRouter.get(
  "/",
  auth,
  (async (req, res, next) => {
    try {
      const { min, max, deviceId, fileType, q } = req.query

      const minSize = toNumber(min)
      const maxSize = toNumber(max)
      const userId = getRequesterUserId(req);
      const filter: Record<string, any> = {}
      // const { deviceId } = req.query;

      if (!userId) return next(msgError(401, "Missing user context"));
      if (!deviceId) return next(msgError(400, "deviceId is required"));
      if (!isValidId(String(userId))) return next(msgError(400, "Invalid userId"));
      if (!isValidId(String(deviceId))) return next(msgError(400, "Invalid deviceId"));

      await assertOwnsDevice(String(userId), String(deviceId));

      let files: any

      if (minSize !== null || maxSize !== null || q !== null) {
        filter.sizeBytes = {}
        if (minSize !== null) filter.sizeBytes.$gte = minSize
        if (maxSize !== null) filter.sizeBytes.$lte = maxSize
        // regex to find query in title, $options: "i" to make case insensitive
        if (q !== null) filter.filename = { $regex: String(q), $options: "i" };
        files = await File.find(filter)
          .sort({ createdAt: -1 })
          .populate("deviceId", "name status");
      } else {
        files = await File.find({ deviceId: String(deviceId) }).sort({ createdAt: -1 }).populate("deviceId", "name status");
      }


      res.json(files);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler
);

// --------------------
// UPLOAD
// POST /api/files/upload?deviceId=... [&userId=... if not using req.user]
// multipart/form-data with field name: "file"
// --------------------
fileRouter.post(
  "/upload",
  upload.single("file"),
  auth,
  (async (req: any, res, next) => {
    try {
      const userId = getRequesterUserId(req);
      const deviceId = String(req.query.deviceId || "");

      if (!userId) return next(msgError(401, "Missing user context"));
      if (!deviceId) return next(msgError(400, "deviceId is required"));
      if (!isValidId(String(userId))) return next(msgError(400, "Invalid userId"));
      if (!isValidId(deviceId)) return next(msgError(400, "Invalid deviceId"));

      await assertOwnsDevice(String(userId), deviceId);

      // .lean() makes it return a plain JS object.
      const deviceObj = await Device.findById(deviceId).lean<DeviceSchema>();
      if (!deviceObj) {
        return next(msgError(404, "Device not found"));
      }
      const mount = deviceObj.drives?.[0]?.mount;
      if (!mount) return next(msgError(400, "Missing mount"));

      if (!req.file) return next(msgError(400, "No file uploaded (field name must be 'file')"));

      const original = req.file.originalname as string;
      const mimeType = req.file.mimetype as string;
      const sizeBytes = Number(req.file.size || 0);

      // Create a safe stored filename: uuid + original extension (optional)
      const ext = path.extname(original).slice(0, 12); // avoid weird long extensions
      const storedBase = crypto.randomUUID();
      const filenameStored = ext ? `${storedBase}${ext}` : storedBase;

      const objectKey = buildObjectKey(String(userId), deviceId, filenameStored);
      //   const storagePath = `minio://${MINIO_BUCKET}/${objectKey}`;
      const storagePath = `minio://${MINIO_BUCKET}/${objectKey}`;

      const buffer: Buffer = req.file.buffer;

      // Optional checksum
      const checksum = sha256(buffer);

      // Upload to MinIO
      // putObject(bucket, objectName, stream/buffer, size, meta)
      const meta = {
        "Content-Type": mimeType,
        "x-amz-meta-originalname": original,
        "x-amz-meta-deviceid": deviceId,
        "x-amz-meta-userid": String(userId),
      };

      const putResult = await minio.putObject(MINIO_BUCKET, objectKey, buffer, sizeBytes, meta);

      // Save metadata to MongoDB
      const created = await File.create({
        deviceId,
        uploadedByUserId: userId,
        filenameOriginal: original,
        filenameStored,
        mimeType,
        sizeBytes,
        storageDriver: "minio",
        bucket: MINIO_BUCKET,
        objectKey,
        storagePath,
        checksum,
        // putResult.etag may exist depending on minio client version
        etag: (putResult as any)?.etag,
      });

      res.status(201).json(created);
    } catch (err: any) {
      next(msgError(400, err.message));
    }
  }) as RequestHandler
);

// --------------------
// DOWNLOAD (stream from MinIO)
// GET /api/files/:id/download [&userId=... if not using req.user]
// --------------------
fileRouter.get(
  "/:id/download",
  auth,
  (async (req: any, res, next) => {
    try {
      const userId = getRequesterUserId(req);
      const fileId = String(req.params.id);

      if (!userId) return next(msgError(401, "Missing user context"));
      if (!isValidId(String(userId))) return next(msgError(400, "Invalid userId"));
      if (!isValidId(fileId)) return next(msgError(400, "Invalid file id"));

      const fileDoc = await File.findById(fileId);
      if (!fileDoc) return next(msgError(404, "File not found"));

      await assertOwnsDevice(String(userId), String(fileDoc.deviceId));

      // Get object stream from MinIO
      const stream = await minio.getObject(fileDoc.bucket, fileDoc.objectKey);

      // Set headers so browser downloads with original name
      res.setHeader("Content-Type", fileDoc.mimeType || "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(fileDoc.filenameOriginal)}"`
      );
      res.setHeader("Content-Length", String(fileDoc.sizeBytes));

      stream.on("error", (e) => next(msgError(500, `MinIO stream error: ${String((e as any)?.message || e)}`)));

      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler
);

// --------------------
// DELETE (MinIO object + Mongo record)
// DELETE /api/files/:id [&userId=... if not using req.user]
// --------------------
fileRouter.delete(
  "/:id",
  auth,
  (async (req: any, res, next) => {
    try {
      const userId = getRequesterUserId(req);
      const fileId = String(req.params.id);

      if (!userId) return next(msgError(401, "Missing user context"));
      if (!isValidId(String(userId))) return next(msgError(400, "Invalid userId"));
      if (!isValidId(fileId)) return next(msgError(400, "Invalid file id"));

      const fileDoc = await File.findById(fileId);
      if (!fileDoc) return next(msgError(404, "File not found"));

      await assertOwnsDevice(String(userId), String(fileDoc.deviceId));

      // Delete from MinIO first (so we don't orphan storage)
      await minio.removeObject(fileDoc.bucket, fileDoc.objectKey);

      // Delete from DB
      await File.findByIdAndDelete(fileId);

      res.json({ ok: true, deletedId: fileId });
    } catch (err: any) {
      next(msgError(400, err.message));
    }
  }) as RequestHandler
);

export default fileRouter;