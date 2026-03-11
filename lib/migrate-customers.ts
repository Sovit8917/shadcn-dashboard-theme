import pool from "@/lib/postgres";

export async function migrateCustomers(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      country TEXT NOT NULL DEFAULT '',
      avatar TEXT,
      orders INTEGER NOT NULL DEFAULT 0,
      total_spent NUMERIC(10,2) NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      phone TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  const { rows } = await pool.query("SELECT COUNT(*) as count FROM customers");
  if (parseInt(rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO customers (name, email, country, orders, total_spent, status) VALUES
      ('Stanfield Baser', 'sbaser0@boston.com', 'Australia', 157, 2074.22, 'active'),
      ('Laurie Dax', 'ldax1@lycos.com', 'Australia', 663, 2404.19, 'active'),
      ('Maxine Kenrick', 'mkenrick2@eepurl.com', 'Australia', 64, 8821.40, 'active'),
      ('Harman Burkill', 'hburkill3@drupal.org', 'United States', 640, 5294.35, 'active'),
      ('Aubrey Borrow', 'aborrow4@jiathis.com', 'France', 184, 1003.30, 'active'),
      ('Nester Fridd', 'nfridd5@cdbaby.com', 'China', 965, 3876.92, 'active'),
      ('Lizzie Nicholes', 'lnicholes6@rediff.com', 'Brazil', 514, 7936.85, 'active'),
      ('Amabel Scullion', 'ascullion7@wiley.com', 'Australia', 584, 4150.97, 'active'),
      ('Zeke Arton', 'zarton8@weibo.com', 'Australia', 539, 3430.05, 'active'),
      ('Rosy Medlicott', 'rmedlicott9@amazon.com', 'Australia', 4, 8646.75, 'active')
    `);
  }

  console.log("Customers table ready");
}
