import mongoose from "mongoose";


const fileSchema = new mongoose.Schema(
    {
        deviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Device", required: true, index: true },
        uploadedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

        filenameOriginal: { type: String, required: true },
        filenameStored: { type: String, required: true },
        mimeType: { type: String, required: true },
        sizeBytes: { type: Number, required: true },

        storageDriver: { type: String, enum: ["minio"], default: "minio", required: true },
        bucket: { type: String, required: true },
        objectKey: { type: String, required: true },
        storagePath: { type: String, required: true },

        checksum: { type: String },
        etag: { type: String },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

fileSchema.virtual("sizeMB").get(function () {
    return Number((this.sizeBytes / (1024 * 1024)).toFixed(2));
});

fileSchema.virtual("sizeGB").get(function () {
    return Number((this.sizeBytes / (1024 * 1024 * 1024)).toFixed(2));
});

fileSchema.virtual("convertedSize").get(function () {
    const b = this.sizeBytes;
    if (b < 1024) return `${b} B`;
    const kb = b / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
});


fileSchema.index({ bucket: 1, objectKey: 1 }, { unique: true });
fileSchema.index({ deviceId: 1, createdAt: -1 });

export default mongoose.model("File", fileSchema);