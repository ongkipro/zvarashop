/**
 * Server-authoritative order reads shared by both Meta Purchase surfaces.
 * The public route requires the per-order status token; the API-key route is
 * already authenticated but still must not trust caller-supplied revenue.
 */
export type MetaPurchaseOrder = {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  province: string;
  city: string;
  postal_code: string | null;
  total_amount: number;
  product_value: number;
  payment_method: string;
  payment_status: string;
  ad_click_ids: string | null;
  meta_request_context: string | null;
};

const PURCHASE_ORDER_SELECT = `
  SELECT
    o.order_number, o.customer_name, o.customer_phone, o.customer_email,
    o.province, o.city, o.postal_code, o.total_amount,
    o.payment_method, o.payment_status, o.ad_click_ids, o.meta_request_context,
    (
      SELECT COALESCE(SUM(oi.unit_price * oi.quantity), 0)
      FROM order_items oi
      WHERE oi.order_id = o.id
    ) AS product_value
  FROM orders o
  WHERE (CAST(o.id AS TEXT) = ? OR o.order_number = ?)
`;

export function findPurchaseOrderByStatusToken(
  database: D1Database,
  locator: string,
  statusToken: string,
): Promise<MetaPurchaseOrder | null> {
  return database
    .prepare(`${PURCHASE_ORDER_SELECT} AND o.public_status_token = ? LIMIT 1`)
    .bind(locator, locator, statusToken)
    .first<MetaPurchaseOrder>();
}

export function findPurchaseOrderForApiKeyCaller(
  database: D1Database,
  locator: string,
): Promise<MetaPurchaseOrder | null> {
  return database
    .prepare(`${PURCHASE_ORDER_SELECT} LIMIT 1`)
    .bind(locator, locator)
    .first<MetaPurchaseOrder>();
}
