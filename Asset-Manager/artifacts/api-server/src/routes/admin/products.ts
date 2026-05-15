import { Router, type IRouter } from "express";
import { asc, desc, eq, ilike } from "drizzle-orm";
import { db, productsTable, categoriesTable } from "@workspace/db";
import {
  AdminListProductsQueryParams,
  AdminListProductsResponse,
  AdminCreateProductBody,
  AdminGetProductParams,
  AdminGetProductResponse,
  AdminUpdateProductParams,
  AdminUpdateProductBody,
  AdminUpdateProductResponse,
  AdminDeleteProductParams,
  AdminDeleteProductResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../../middlewares/requireAdmin";

const router: IRouter = Router();

router.use("/admin/products", requireAdmin);
router.use("/admin/products/:id", requireAdmin);

function serialize(p: typeof productsTable.$inferSelect, categoryName?: string | null) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    quantity: p.quantity,
    categoryId: p.categoryId,
    categoryName: categoryName ?? null,
    image: p.image,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/admin/products", async (req, res): Promise<void> => {
  const parsed = AdminListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { search } = parsed.data;
  const where = search ? ilike(productsTable.name, `%${search}%`) : undefined;

  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .where(where as ReturnType<typeof ilike>)
    .orderBy(desc(productsTable.createdAt));

  res.json(
    AdminListProductsResponse.parse(rows.map((r) => serialize(r.product, r.categoryName))),
  );
});

router.post("/admin/products", async (req, res): Promise<void> => {
  const parsed = AdminCreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(productsTable)
    .values({
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price.toFixed(2),
      quantity: parsed.data.quantity,
      categoryId: parsed.data.categoryId,
      image: parsed.data.image,
    })
    .returning();

  const [cat] = await db
    .select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, row.categoryId));

  res.status(201).json(serialize(row, cat?.name ?? null));
});

router.get("/admin/products/:id", async (req, res): Promise<void> => {
  const params = AdminGetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .where(eq(productsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(AdminGetProductResponse.parse(serialize(row.product, row.categoryName)));
});

router.put("/admin/products/:id", async (req, res): Promise<void> => {
  const params = AdminUpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = AdminUpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(productsTable)
    .set({
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price.toFixed(2),
      quantity: parsed.data.quantity,
      categoryId: parsed.data.categoryId,
      image: parsed.data.image,
    })
    .where(eq(productsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const [cat] = await db
    .select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, row.categoryId));

  res.json(AdminUpdateProductResponse.parse(serialize(row, cat?.name ?? null)));
});

router.delete("/admin/products/:id", async (req, res): Promise<void> => {
  const params = AdminDeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  try {
    await db.delete(productsTable).where(eq(productsTable.id, params.data.id));
  } catch {
    res.status(400).json({ error: "لا يمكن حذف منتج موجود في طلبات سابقة" });
    return;
  }
  res.json(AdminDeleteProductResponse.parse({ success: true }));
});

export default router;
