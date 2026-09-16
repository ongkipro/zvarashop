UPDATE products 
SET title = 'GIA Serbuk Anti Tersumbat 110g', 
    image_url = '/images/landing/gia-anti-sumbat/hero-action.webp'
WHERE id = 82215;
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants (product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES (82215, 'PG003-3', 'Beli 3 (Paket Hemat 3 Botol)', 139000, 264000, 300, 99);
