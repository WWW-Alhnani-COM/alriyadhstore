import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// تصدير الجداول مباشرة من schema
export const {
  adminsTable,
  categoriesTable,
  productsTable,
  ordersTable,
  orderItemsTable,
} = schema;

// أو استخدم export * from "./schema" مع التأكد من صحة المحتوى
export * from "./schema";
