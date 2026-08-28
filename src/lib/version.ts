export type CmsVersionInfo = {
  version: string;
  channel: string;
  releaseTag: string;
  coreEngine: string;
  schemaVersion: number;
  lastUpdated: string;
};

export const CMS_VERSION: CmsVersionInfo = {
  version: "1.4.1",
  channel: "production",
  // Product 1.4.0 plus this install's own tracking and release work: the Meta
  // browser Purchase carries all eight advanced-matching keys instead of
  // `external_id` alone, the pixel no longer waits on its 2.5 s deferral timer
  // to send a conversion, a synthetic payment-provider address stops being
  // hashed into `em`, and a deploy whose tree is behind the branch is refused.
  // The operator's sidebar reads this: leaving it at 1.4.0 would have told them
  // they were running stock when they were not.
  releaseTag: "2026.08-meta-purchase-matching",
  coreEngine: "Astro 7 SSR + Cloudflare Workers",
  // Unchanged: this release adds no migration.
  schemaVersion: 51,
  lastUpdated: "2026-08-28",
};
