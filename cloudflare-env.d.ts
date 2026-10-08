declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    MAP_ASSETS?: Fetcher;
    WORLD_ROOMS?: DurableObjectNamespace;
    WORLD_SESSIONS?: DurableObjectNamespace;
    WORLD_ALLOCATORS?: DurableObjectNamespace;
    BUCKET?: R2Bucket;
  }
}
