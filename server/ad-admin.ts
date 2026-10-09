export async function isAdAdmin(db:D1Database,playerId:string){return !!await db.prepare('SELECT player_id FROM platform_admins WHERE player_id=?').bind(playerId).first()}
