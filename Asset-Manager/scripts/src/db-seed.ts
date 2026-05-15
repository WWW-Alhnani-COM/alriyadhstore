import { Pool } from "pg";
import bcryptjs from "bcryptjs";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const pool = new Pool({ connectionString: dbUrl });

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Admins
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Categories
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Products
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        price NUMERIC(10,2) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        category_id INTEGER NOT NULL REFERENCES categories(id),
        image TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Orders
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        notes TEXT,
        total_price NUMERIC(10,2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        payment_link TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Order items
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        product_name TEXT,
        product_image TEXT
      );
    `);

    // Insert default admin
    const passwordHash = await bcryptjs.hash("admin123", 10);
    await client.query(
      `INSERT INTO admins (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING;`,
      ["admin@store.sa", passwordHash]
    );

    // Insert categories
    const catRows = await client.query(
      `INSERT INTO categories (name, slug) VALUES
        ('ملابس', 'clothing'),
        ('إلكترونيات', 'electronics'),
        ('عطور وجمال', 'beauty')
      ON CONFLICT (slug) DO NOTHING
      RETURNING id, slug;`
    );

    // Map category ids
    const allCats = await client.query(`SELECT id, slug FROM categories;`);
    const catMap: Record<string, number> = {};
    for (const row of allCats.rows) {
      catMap[row.slug] = row.id;
    }

    if (catMap["clothing"] && catMap["electronics"] && catMap["beauty"]) {
      await client.query(
        `INSERT INTO products (name, description, price, quantity, category_id, image) VALUES
          ('ثوب أبيض كلاسيكي', 'ثوب أبيض سعودي تقليدي من القماش عالي الجودة، مثالي للمناسبات الرسمية والصلاة.', 249.00, 15, $1, '/products/thob-white.png'),
          ('عباية نسائية مطرزة', 'عباية سوداء فاخرة بتطريز يدوي على الأكمام والصدر، قماش كريب ناعم.', 399.00, 8, $1, '/products/abaya.png'),
          ('طقم أطفال صيفي', 'طقم قطني مريح للأطفال يتكون من تيشيرت وشورت بتصميم عصري.', 129.00, 25, $1, '/products/kids-set.png'),
          ('هاتف ذكي حديث', 'هاتف ذكي بشاشة AMOLED 6.7 بوصة، كاميرا 108 ميجابكسل، بطارية 5000mAh.', 2499.00, 10, $2, '/products/smartphone.png'),
          ('سماعات لاسلكية بريميوم', 'سماعات لاسلكية بتقنية إلغاء الضوضاء، صوت ستيريو محيطي، بطارية 30 ساعة.', 749.00, 20, $2, '/products/headphones.png'),
          ('ساعة ذكية رياضية', 'ساعة ذكية بتتبع اللياقة البدنية، مقاومة للماء حتى 50 متر، بطارية 14 يوم.', 599.00, 12, $2, '/products/smartwatch.png'),
          ('عطر عود فاخر', 'عطر شرقي فاخر بمزيج من العود والمسك والعنبر، يدوم لأكثر من 12 ساعة.', 450.00, 18, $3, '/products/perfume.png'),
          ('مجموعة مكياج كاملة', 'مجموعة مكياج احترافية تتضمن 12 ظلاً للعيون، أحمر شفاه، وهايلايتر.', 299.00, 30, $3, '/products/makeup-set.png'),
          ('كريم ترطيب بريميوم', 'كريم ترطيب فاخر بخلاصة الذهب والكولاجين لتجديد البشرة وشدها.', 189.00, 40, $3, '/products/skincare.png')
        ON CONFLICT DO NOTHING;`,
        [catMap["clothing"], catMap["electronics"], catMap["beauty"]]
      );
    }

    await client.query("COMMIT");
    console.log("Database seeded successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
