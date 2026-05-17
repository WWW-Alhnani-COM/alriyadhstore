import type { Request, Response, NextFunction } from "express";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // ✅ تم تعطيل التحقق مؤقتاً
  next();
}
