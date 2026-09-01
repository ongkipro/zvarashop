import { getRuntimeEnv } from "./env.ts";
import { defaultCrmTemplates, parseCrmTemplates } from "./crm-template.ts";

export type StorefrontSupportContact = {
  whatsapp: string;
  thanksRedirectTemplate: string;
};

export async function getStorefrontSupportContact(
  locals?: App.Locals,
): Promise<StorefrontSupportContact> {
  const fallback = {
    whatsapp: "",
    thanksRedirectTemplate: defaultCrmTemplates.redirect,
  };
  const database = getRuntimeEnv(locals)?.OMS_DB;
  if (!database || typeof database !== "object") {
    console.error("storefront-support-whatsapp-no-database-binding");
    return fallback;
  }

  try {
    const store = await (database as D1Database)
      .prepare("SELECT support_whatsapp, crm_templates FROM stores ORDER BY id LIMIT 1")
      .first<{ support_whatsapp: string | null; crm_templates: string | null }>();
    if (!store) {
      console.error("storefront-support-whatsapp-no-store-row");
      return fallback;
    }
    return {
      whatsapp: store.support_whatsapp?.replace(/\D/g, "") || "",
      thanksRedirectTemplate: parseCrmTemplates(store.crm_templates).redirect,
    };
  } catch (error) {
    console.error("storefront-support-whatsapp-load", error);
    return fallback;
  }
}

export async function getStoreSupportWhatsapp(
  locals?: App.Locals,
): Promise<string> {
  return (await getStorefrontSupportContact(locals)).whatsapp;
}
