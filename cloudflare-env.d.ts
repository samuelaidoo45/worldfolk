declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    TURN_KEY_ID?: string;
    TURN_KEY_API_TOKEN?: string;
    MAP_ASSETS?: Fetcher;
    WORLD_ROOMS?: DurableObjectNamespace;
    WORLD_SESSIONS?: DurableObjectNamespace;
    WORLD_ALLOCATORS?: DurableObjectNamespace;
    BUCKET?: R2Bucket;
  }
}
