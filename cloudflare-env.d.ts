declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    WORLD_ROOMS?: DurableObjectNamespace;
    BUCKET?: R2Bucket;
  }
}
