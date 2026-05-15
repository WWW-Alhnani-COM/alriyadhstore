import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, categoriesTable } from "@workspace/db";
import {
  AdminListCategoriesResponse,
  AdminCreateCategoryBody,
  AdminUpdateCategoryBody,
  AdminUpdateCategoryParams,
  AdminUpdateCategoryResponse,
  AdminDeleteCategoryParams,
  AdminDeleteCategoryResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../../middlewares/requireAdmin";

const router: IRouter = Router();

router.use("/admin/categories", requireAdmin);
router.use("/admin/categories/:id", requireAdmin);

router.get("/admin/categories", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
    })
    .from(categoriesTable)
    .orderBy(asc(categoriesTable.name));
  res.json(AdminListCategoriesResponse.parse(rows));
});

router.post("/admin/categories", async (req, res): Promise<void> => {
  const parsed = AdminCreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(categoriesTable).values(parsed.data).returning();
  res.status(201).json({ id: row.id, name: row.name, slug: row.slug });
});

router.put("/admin/categories/:id", async (req, res): Promise<void> => {
  const params = AdminUpdateCategoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = AdminUpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(categoriesTable)
    .set(parsed.data)
    .where(eq(categoriesTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.json(AdminUpdateCategoryResponse.parse({ id: row.id, name: row.name, slug: row.slug }));
});

router.delete("/admin/categories/:id", async (req, res): Promise<void> => {
  const params = AdminDeleteCategoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  try {
    await db.delete(categoriesTable).where(eq(categoriesTable.id, params.data.id));
  } catch {
    res.status(400).json({ error: "لا يمكن حذف فئة تحتوي على منتجات" });
    return;
  }
  res.json(AdminDeleteCategoryResponse.parse({ success: true }));
});

export default router;
