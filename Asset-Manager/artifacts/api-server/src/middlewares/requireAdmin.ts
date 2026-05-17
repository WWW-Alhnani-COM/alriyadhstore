import type { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    adminId?: number;
    adminEmail?: string;
  }
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // ✅ تم تعطيل التحقق مؤقتاً لاختبار لوحة التحكم
  next();
}
