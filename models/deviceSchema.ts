import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
        index: true
    },
    name: {
        type: String,
        required: true
    },
    storageTotalGB: {
        type: Number,
        required: true,
    },
    storageUsedGB: {
        type: Number,
        required: true,
        default: 0,
    },
    status: {
        type: String,
        enum: ["online", "offline"],
        default: "offline",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

export default mongoose.model("Device", deviceSchema)