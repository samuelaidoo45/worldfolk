export const sessionToken=(request:Request)=>request.headers.get('cookie')?.match(/(?:^|;\s*)accralife_session=([a-f0-9-]{36})(?:;|$)/)?.[1]||null;
export async function loadPlayer<T>(db:D1Database,request:Request):Promise<T|null>{
 const token=sessionToken(request);if(!token)return null;
 return db.prepare('SELECT *, (SELECT username FROM accounts WHERE player_id=players.id) AS handle FROM players WHERE session_token=? AND (session_expires_at=0 OR session_expires_at>?)').bind(token,Date.now()).first<T>();
}
export function sessionCookie(request:Request,token:string,maxAge=2592000){return `accralife_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${new URL(request.url).protocol==='https:'?'; Secure':''}`}

export async function loadRegisteredPlayer<T>(db:D1Database,request:Request):Promise<T|null>{
 const player=await loadPlayer<T & {handle?:string}>(db,request);return player?.handle?player:null;
}
