import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, ordersTable, orderItemsTable } from "@workspace/db";
import {
  AdminListOrdersQueryParams,
  AdminListOrdersResponse,
  AdminGetOrderParams,
  AdminGetOrderResponse,
  AdminUpdateOrderParams,
  AdminUpdateOrderBody,
  AdminUpdateOrderResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../../middlewares/requireAdmin";

const router: IRouter = Router();

router.use("/admin/orders", requireAdmin);
router.use("/admin/orders/:id", requireAdmin);

async function loadOrder(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) return null;
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));
  return {
    id: order.id,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    totalPrice: Number(order.totalPrice),
    status: order.status,
    paymentLink: order.paymentLink,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    items: items.map((it) => ({
      id: it.id,
      productId: it.productId,
      productName: it.productName,
      productImage: it.productImage,
      quantity: it.quantity,
      price: Number(it.price),
    })),
  };
}

router.get("/admin/orders", async (req, res): Promise<void> => {
  const parsed = AdminListOrdersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { status } = parsed.data;
  const where = status ? eq(ordersTable.status, status) : undefined;

  const orderRows = await db
    .select()
    .from(ordersTable)
    .where(where as ReturnType<typeof eq>)
    .orderBy(desc(ordersTable.createdAt));

  const ids = orderRows.map((o) => o.id);
  const allItems = ids.length
    ? await db.select().from(orderItemsTable)
    : [];
  const itemsByOrder = new Map<number, typeof allItems>();
  for (const it of allItems) {
    const arr = itemsByOrder.get(it.orderId) ?? [];
    arr.push(it);
    itemsByOrder.set(it.orderId, arr);
  }

  const result = orderRows.map((o) => ({
    id: o.id,
    customerName: o.customerName,
    phone: o.phone,
    address: o.address,
    totalPrice: Number(o.totalPrice),
    status: o.status,
    paymentLink: o.paymentLink,
    notes: o.notes,
    createdAt: o.createdAt.toISOString(),
    items: (itemsByOrder.get(o.id) ?? []).map((it) => ({
      id: it.id,
      productId: it.productId,
      productName: it.productName,
      productImage: it.productImage,
      quantity: it.quantity,
      price: Number(it.price),
    })),
  }));

  res.json(AdminListOrdersResponse.parse(result));
});

router.get("/admin/orders/:id", async (req, res): Promise<void> => {
  const params = AdminGetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const order = await loadOrder(params.data.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(AdminGetOrderResponse.parse(order));
});

router.patch("/admin/orders/:id", async (req, res): Promise<void> => {
  const params = AdminUpdateOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = AdminUpdateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.status != null) updates.status = parsed.data.status;
  if (parsed.data.paymentLink !== undefined) updates.paymentLink = parsed.data.paymentLink;

  if (Object.keys(updates).length === 0) {
    const order = await loadOrder(params.data.id);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(AdminUpdateOrderResponse.parse(order));
    return;
  }

  const [updated] = await db
    .update(ordersTable)
    .set(updates)
    .where(eq(ordersTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const order = await loadOrder(params.data.id);
  res.json(AdminUpdateOrderResponse.parse(order));
});

export default router;
