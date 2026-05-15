import { Router, type IRouter } from "express";
import { eq, inArray } from "drizzle-orm";
import {
  db,
  productsTable,
  ordersTable,
  orderItemsTable,
} from "@workspace/db";
import {
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function loadOrderWithItems(orderId: number) {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId));
  if (!order) return null;

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, orderId));

  return {
    id: order.id,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    totalPrice: Number(order.totalPrice),
    status: order.status as "pending" | "paid" | "shipped" | "cancelled",
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

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const body = parsed.data;

  const productIds = body.items.map((i) => i.productId);
  const products = await db
    .select()
    .from(productsTable)
    .where(inArray(productsTable.id, productIds));

  const productMap = new Map(products.map((p) => [p.id, p]));

  let total = 0;
  for (const item of body.items) {
    const p = productMap.get(item.productId);
    if (!p) {
      res.status(400).json({ error: `Product ${item.productId} not found` });
      return;
    }
    total += Number(p.price) * item.quantity;
  }

  const [order] = await db
    .insert(ordersTable)
    .values({
      customerName: body.customerName,
      phone: body.phone,
      address: body.address,
      notes: body.notes ?? null,
      totalPrice: total.toFixed(2),
      status: "pending",
    })
    .returning();

  await db.insert(orderItemsTable).values(
    body.items.map((item) => {
      const p = productMap.get(item.productId)!;
      return {
        orderId: order.id,
        productId: p.id,
        productName: p.name,
        productImage: p.image,
        quantity: item.quantity,
        price: p.price,
      };
    }),
  );

  // decrement product stock (best-effort)
  for (const item of body.items) {
    const p = productMap.get(item.productId)!;
    const newQty = Math.max(0, p.quantity - item.quantity);
    await db
      .update(productsTable)
      .set({ quantity: newQty })
      .where(eq(productsTable.id, p.id));
  }

  const full = await loadOrderWithItems(order.id);
  res.status(201).json(GetOrderResponse.parse(full));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const full = await loadOrderWithItems(params.data.id);
  if (!full) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(GetOrderResponse.parse(full));
});

export default router;
