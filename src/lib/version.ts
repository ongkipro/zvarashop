export type CmsVersionInfo = {
  version: string;
  channel: string;
  releaseTag: string;
  coreEngine: string;
  schemaVersion: number;
  lastUpdated: string;
};

export const CMS_VERSION: CmsVersionInfo = {
  version: "1.5.0",
  channel: "production",
  // Standalone ZvaraShop release candidate: repository authority, hardened
  // Meta/Google delivery, delayed-Purchase context, and order replay dedupe.
  releaseTag: "2026.09-standalone-signals",
  coreEngine: "Astro 7 SSR + Cloudflare Workers",
  schemaVersion: 58,
  lastUpdated: "2026-09-01",
};
