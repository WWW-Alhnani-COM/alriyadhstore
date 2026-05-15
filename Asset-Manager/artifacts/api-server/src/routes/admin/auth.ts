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
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.email, parsed.data.email.toLowerCase()));

  if (!admin) {
    res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    return;
  }

  const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    return;
  }

  req.session.adminId = admin.id;
  req.session.adminEmail = admin.email;
  res.json(AdminLoginResponse.parse({ id: admin.id, email: admin.email }));
});

router.post("/admin/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.clearCookie("store.sid");
    res.json(AdminLogoutResponse.parse({ success: true }));
  });
});

router.get("/admin/me", async (req, res): Promise<void> => {
  if (!req.session?.adminId || !req.session?.adminEmail) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json(
    AdminMeResponse.parse({
      id: req.session.adminId,
      email: req.session.adminEmail,
    }),
  );
});

export default router;
