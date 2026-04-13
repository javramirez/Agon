import { db } from '@/lib/db'
import { ekecheiria } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function getEkecheiriaActiva() {
  const rows = await db
    .select()
    .from(ekecheiria)
    .where(eq(ekecheiria.activa, true))
    .limit(1)
  return rows[0] ?? null
}
