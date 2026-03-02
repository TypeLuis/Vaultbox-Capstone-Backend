import mongoose from "mongoose";

const appSchema = new mongoose.Schema({
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Device",
        required: [true, "Device is required"],
        index: true,
    },
    name: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["running", "stopped"],
        default: "stopped",
    },
    port: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

export default mongoose.model("App", appSchema)