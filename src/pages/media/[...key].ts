import type { APIRoute } from "astro";
import { getRuntimeEnv } from "../../lib/env";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const key = String(params.key || "");
  if (!key.startsWith("content/") || key.includes("..")) {
    return new Response("Not found", { status: 404 });
  }
  const bucket = getRuntimeEnv(locals)?.ASSET_BUCKET;
  if (!bucket || typeof bucket !== "object") {
    return new Response("Media unavailable", { status: 503 });
  }
  const object = await (bucket as R2Bucket).get(key);
  if (!object && import.meta.env.DEV) {
    try {
      const remoteRes = await fetch(`https://zvara.shop/media/${key}`);
      if (remoteRes.ok) {
        const buffer = await remoteRes.arrayBuffer();
        try {
          await (bucket as R2Bucket).put(key, buffer, {
            httpMetadata: {
              contentType: remoteRes.headers.get("content-type") || "image/webp",
            },
          });
        } catch {}
        return new Response(buffer, {
          headers: {
            "content-type": remoteRes.headers.get("content-type") || "image/webp",
            "cache-control": "public, max-age=31536000, immutable",
            "x-content-type-options": "nosniff",
          },
        });
      }
    } catch {}
  }
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers({
    "content-type": object.httpMetadata?.contentType || "application/octet-stream",
    etag: object.httpEtag,
    "cache-control": "public, max-age=31536000, immutable",
    "x-content-type-options": "nosniff",
  });
  return new Response(object.body as unknown as BodyInit, { headers });
};
