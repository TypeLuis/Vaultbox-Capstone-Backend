import mongoose from "mongoose";

export const isValidId = (id: string) => mongoose.Types.ObjectId.isValid(id)


export const toNumber = (v: unknown): number | null => {
    if (typeof v !== "string" && typeof v !== "number") return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
};