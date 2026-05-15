import { Router, type IRouter } from "express";
import { asc, desc, eq, sql } from "drizzle-orm";
import {
  db,
  ordersTable,
  orderItemsTable,
  productsTable,
  categoriesTable,
} from "@workspace/db";
import { AdminGetStatsResponse } from "@workspace/api-zod";
import { requireAdmin } from "../../middlewares/requireAdmin";

const router: IRouter = Router();

router.use("/admin/stats", requireAdmin);

router.get("/admin/stats", async (_req, res): Promise<void> => {
  const [totals] = await db
    .select({
      totalOrders: sql<number>`count(*)::int`,
      totalRevenue: sql<number>`coalesce(sum(${ordersTable.totalPrice}), 0)::float`,
      pendingOrders: sql<number>`count(*) filter (where ${ordersTable.status} = 'pending')::int`,
    })
    .from(ordersTable);

  const [productCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(productsTable);

  const [catCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(categoriesTable);

  const ordersByStatus = await db
    .select({
      status: ordersTable.status,
      count: sql<number>`count(*)::int`,
    })
    .from(ordersTable)
    .groupBy(ordersTable.status)
    .orderBy(asc(ordersTable.status));

  const revenueByCategory = await db
    .select({
      categoryId: categoriesTable.id,
      categoryName: categoriesTable.name,
      revenue: sql<number>`coalesce(sum(${orderItemsTable.price} * ${orderItemsTable.quantity}), 0)::float`,
      ordersCount: sql<number>`count(distinct ${orderItemsTable.orderId})::int`,
    })
    .from(categoriesTable)
    .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
    .leftJoin(orderItemsTable, eq(orderItemsTable.productId, productsTable.id))
    .groupBy(categoriesTable.id)
    .orderBy(desc(sql`coalesce(sum(${orderItemsTable.price} * ${orderItemsTable.quantity}), 0)`));

  const recentOrders = await db
    .select({
      id: ordersTable.id,
      customerName: ordersTable.customerName,
      totalPrice: ordersTable.totalPrice,
      status: ordersTable.status,
      createdAt: ordersTable.createdAt,
    })
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt))
    .limit(8);

  const lowStock = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      quantity: productsTable.quantity,
    })
    .from(productsTable)
    .orderBy(asc(productsTable.quantity))
    .limit(6);

  res.json(
    AdminGetStatsResponse.parse({
      totalOrders: totals?.totalOrders ?? 0,
      totalRevenue: Number(totals?.totalRevenue ?? 0),
      totalProducts: productCount?.c ?? 0,
      totalCategories: catCount?.c ?? 0,
      pendingOrders: totals?.pendingOrders ?? 0,
      ordersByStatus: ordersByStatus.map((r) => ({ status: r.status, count: r.count })),
      revenueByCategory: revenueByCategory.map((r) => ({
        categoryId: r.categoryId,
        categoryName: r.categoryName,
        revenue: Number(r.revenue),
        ordersCount: r.ordersCount,
      })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        customerName: o.customerName,
        totalPrice: Number(o.totalPrice),
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      })),
      lowStockProducts: lowStock,
    }),
  );
});

export default router;
