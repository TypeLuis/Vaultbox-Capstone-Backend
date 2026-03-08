import mongoose from "mongoose";

export const isValidId = (id: string) => mongoose.Types.ObjectId.isValid(id)


export const toNumber = (v: unknown): number | null => {
    if (typeof v !== "string" && typeof v !== "number") return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
};

export function getRequesterUserId(req: any): string | null {
  // Prefer auth middleware
  if (req.user?.id) return String(req.user.id);

  // Fallbacks
  if (req.body?.userId) return String(req.body.userId);
  if (req.query?.userId) return String(req.query.userId);

  return null;
}