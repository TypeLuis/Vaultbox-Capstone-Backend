import mongoose, { Types } from "mongoose";

export type DriveSchema = {
    fs: string,
    type: string,
    mount: string,
    sizeMB: number,
    usedMB: number,
    availableMB: number,
    usePercent: number,
    rw: boolean
}

export type DeviceSchema = {
    _id: Types.ObjectId
    userId: Types.ObjectId,
    name: string,
    os: string,
    real: string,
    drives: DriveSchema[],
    status: string,
    createdAt: string
}

export const driveSchema = new mongoose.Schema({
    fs: { type: String, required: true },        // e.g. 'overlay', '/dev/sdb1'
    type: { type: String, required: true },       // e.g. 'ext4', 'overlay'
    mount: { type: String, required: true },      // e.g. '/', '/config'
    sizeMB: { type: Number, required: true },
    usedMB: { type: Number, required: true },
    availableMB: { type: Number, required: true },
    usePercent: { type: Number, required: true }, // e.g. 1.4
    rw: { type: Boolean, default: false },        // read/write flag
}, { _id: false }); // id false because it's taking from the drives key in deviceSchema

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

    os: {
        type: String,
        required: true
    },

    real: {
        type: Boolean,
        required: true
    },

    drives: {
        type: [driveSchema],
        default: [],
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
},

    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

// Virtual — total across all drives in GB
deviceSchema.virtual("storageTotalGB").get(function () {
    if (!this.drives?.length) return 0; 
    return parseFloat((this.drives.reduce((sum, d) => sum + d.sizeMB, 0) / 1024).toFixed(2));
});

// Virtual — used across all drives in GB
deviceSchema.virtual("storageUsedGB").get(function () {
    if (!this.drives?.length) return 0; 
    return parseFloat((this.drives.reduce((sum, d) => sum + d.usedMB, 0) / 1024).toFixed(2));
});

// Virtual — used across all drives in GB
deviceSchema.virtual("availableGB").get(function () {
    if (!this.drives?.length) return 0; 
    return parseFloat((this.drives.reduce((sum, d) => sum + d.availableMB, 0) / 1024).toFixed(2));
});

// That makes it impossible for the same user to create two devices with the same name.
deviceSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model("Device", deviceSchema)