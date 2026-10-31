-- zvarashop catalogue data, not schema. Applied in production before
-- AdsBookCMS 1.8.0 and recorded in d1_migrations under this exact name, so
-- the name stays and production never runs it again. Its original SQL lives
-- in scripts/catalog-seeds/0075_wamena_oil_herbal_papua.sql: it inserts this store's products and native
-- landing pages, which reference rows a fresh database (tests, dev:local) does
-- not have, and failed there with a foreign-key error. Apply that file by hand
-- to seed a fresh database with the catalogue.
SELECT 1;
