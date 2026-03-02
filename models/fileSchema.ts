import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Device",
        required: [true, "Device is required"],
        index: true,
    },
    filename: {
        type: String,
        required: true,
    },
    sizeMB: {
        type: Number,
        required: true,
    },
    fileType: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

export default mongoose.model("File", fileSchema)