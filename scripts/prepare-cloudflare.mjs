import { readFile, writeFile } from "node:fs/promises";

const databaseId = process.argv[2];
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(databaseId ?? "")) {
  throw new Error("Pass the D1 database ID returned by `wrangler d1 create worldfolk-prod`.");
}

const input = new URL("../dist/server/wrangler.json", import.meta.url);
const output = new URL("../dist/server/wrangler.cloudflare.json", import.meta.url);
const config = JSON.parse(await readFile(input, "utf8"));
config.name = "worldfolk";
config.workers_dev = true;
config.r2_buckets = [{ binding: "BUCKET", bucket_name: "worldfolk-media" }];
// The proxied apex A record uses Cloudflare's originless placeholder (192.0.2.0).
// Both hostnames route all requests, including assets and WebSockets, to this Worker.
config.routes = [
  { pattern: "worldfolk.world/*", zone_name: "worldfolk.world" },
  { pattern: "www.worldfolk.world/*", zone_name: "worldfolk.world" },
];
config.d1_databases = [{
  binding: "DB",
  database_name: "worldfolk-prod",
  database_id: databaseId,
  migrations_dir: "../../drizzle",
}];
await writeFile(output, JSON.stringify(config, null, 2) + "\n");
console.log("Prepared dist/server/wrangler.cloudflare.json for the worldfolk Worker.");
