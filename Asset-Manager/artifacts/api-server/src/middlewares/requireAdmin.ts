import type { Request, Response, NextFunction } from "express";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // تأكد من وجود adminId في الجلسة
  if (!req.session?.adminId) {
    console.log("❌ requireAdmin: No adminId in session. Session:", req.session);
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  console.log("✅ requireAdmin: Admin authorized", req.session.adminId);
  next();
}
