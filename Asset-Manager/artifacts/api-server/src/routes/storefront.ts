import { Router, type IRouter } from "express";
import { and, asc, desc, eq, gte, ilike, lte, sql } from "drizzle-orm";
import { db, productsTable, categoriesTable, orderItemsTable } from "@workspace/db";
import {
  ListStorefrontCategoriesResponse,
  ListStorefrontProductsResponse,
  ListStorefrontProductsQueryParams,
  GetStorefrontProductResponse,
  GetStorefrontProductParams,
  GetFeaturedProductsResponse,
  GetBestSellersResponse,
  GetNewArrivalsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeProduct(p: typeof productsTable.$inferSelect, categoryName?: string | null) {
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

router.get("/storefront/categories", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      productCount: sql<number>`count(${productsTable.id})::int`,
    })
    .from(categoriesTable)
    .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id)
    .orderBy(asc(categoriesTable.name));

  res.json(ListStorefrontCategoriesResponse.parse(rows));
});

router.get("/storefront/products", async (req, res): Promise<void> => {
  // Strip empty-string query params before validation so they're treated as omitted
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(req.query)) {
    if (v !== "" && v !== "null" && v !== "undefined") cleaned[k] = v;
  }
  const parsed = ListStorefrontProductsQueryParams.safeParse(cleaned);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const {
    categoryId,
    search,
    minPrice,
    maxPrice,
    sort,
    page,
    pageSize,
  } = parsed.data;

  const filters = [];
  if (categoryId != null && !Number.isNaN(categoryId))
    filters.push(eq(productsTable.categoryId, categoryId));
  if (search) filters.push(ilike(productsTable.name, `%${search}%`));
  if (minPrice != null && !Number.isNaN(minPrice))
    filters.push(gte(productsTable.price, String(minPrice)));
  if (maxPrice != null && !Number.isNaN(maxPrice))
    filters.push(lte(productsTable.price, String(maxPrice)));

  const where = filters.length ? and(...filters) : undefined;

  const orderBy = (() => {
    switch (sort) {
      case "price_asc":
        return asc(productsTable.price);
      case "price_desc":
        return desc(productsTable.price);
      case "newest":
      default:
        return desc(productsTable.createdAt);
    }
  })();

  const safePage = Math.max(1, page ?? 1);
  const safePageSize = Math.min(60, Math.max(1, pageSize ?? 12));
  const offset = (safePage - 1) * safePageSize;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productsTable)
    .where(where as ReturnType<typeof and>);

  const rows = await db
    .select({
      product: productsTable,
      categoryName: categoriesTable.name,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .where(where as ReturnType<typeof and>)
    .orderBy(orderBy)
    .limit(safePageSize)
    .offset(offset);

  const items = rows.map((r) => serializeProduct(r.product, r.categoryName));

  res.json(
    ListStorefrontProductsResponse.parse({
      items,
      total: count,
      page: safePage,
      pageSize: safePageSize,
      totalPages: Math.max(1, Math.ceil(count / safePageSize)),
    }),
  );
});

router.get("/storefront/products/:id", async (req, res): Promise<void> => {
  const params = GetStorefrontProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select({
      product: productsTable,
      categoryName: categoriesTable.name,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .where(eq(productsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(GetStorefrontProductResponse.parse(serializeProduct(row.product, row.categoryName)));
});

router.get("/storefront/featured", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      product: productsTable,
      categoryName: categoriesTable.name,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .orderBy(desc(productsTable.createdAt))
    .limit(8);

  res.json(
    GetFeaturedProductsResponse.parse(
      rows.map((r) => serializeProduct(r.product, r.categoryName)),
    ),
  );
});

router.get("/storefront/best-sellers", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      product: productsTable,
      categoryName: categoriesTable.name,
      sold: sql<number>`coalesce(sum(${orderItemsTable.quantity}), 0)::int`,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .leftJoin(orderItemsTable, eq(orderItemsTable.productId, productsTable.id))
    .groupBy(productsTable.id, categoriesTable.name)
    .orderBy(desc(sql`coalesce(sum(${orderItemsTable.quantity}), 0)`), desc(productsTable.createdAt))
    .limit(8);

  res.json(
    GetBestSellersResponse.parse(
      rows.map((r) => serializeProduct(r.product, r.categoryName)),
    ),
  );
});

router.get("/storefront/new-arrivals", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      product: productsTable,
      categoryName: categoriesTable.name,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
    .orderBy(desc(productsTable.createdAt))
    .limit(8);

  res.json(
    GetNewArrivalsResponse.parse(
      rows.map((r) => serializeProduct(r.product, r.categoryName)),
    ),
  );
});

export default router;
