import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, adminsTable } from "@workspace/db";
import {
  AdminLoginBody,
  AdminLoginResponse,
  AdminMeResponse,
  AdminLogoutResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/admin/login", async (req, res): Promise<void> => {
  console.log("📝 Login attempt for email:", req.body.email);
  
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    console.log("❌ Validation failed:", parsed.error.message);
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.email, parsed.data.email.toLowerCase()));

  if (!admin) {
    console.log("❌ Admin not found for email:", parsed.data.email);
    res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    return;
  }

  const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!ok) {
    console.log("❌ Wrong password for email:", parsed.data.email);
    res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    return;
  }

  req.session.adminId = admin.id;
  req.session.adminEmail = admin.email;
  
  console.log("✅ Login successful! adminId:", req.session.adminId);
  console.log("📦 Session after login:", req.session);
  console.log("🍪 Cookie to send:", req.sessionID);
  
  res.json(AdminLoginResponse.parse({ id: admin.id, email: admin.email }));
});

router.post("/admin/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.clearCookie("store.sid");
    res.json(AdminLogoutResponse.parse({ success: true }));
  });
});

router.get("/admin/me", async (req, res): Promise<void> => {
  console.log("🔍 /me - Session:", req.session);
  console.log("🔍 /me - adminId:", req.session?.adminId);
  console.log("🔍 /me - Session ID:", req.sessionID);
  
  if (!req.session?.adminId || !req.session?.adminEmail) {
    console.log("❌ /me - Unauthorized - No adminId in session");
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  
  console.log("✅ /me - Authorized for adminId:", req.session.adminId);
  res.json(
    AdminMeResponse.parse({
      id: req.session.adminId,
      email: req.session.adminEmail,
    }),
  );
});

export default router;
