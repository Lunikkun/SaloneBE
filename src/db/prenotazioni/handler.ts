import { eq } from 'drizzle-orm';
import { db } from '../../dbConnection';
import { InsertPrenotazione, Prenotazione, prenotazioni } from './schema';

export async function createPrenotation(pren : InsertPrenotazione){

    await db.insert(prenotazioni).values(pren).returning();

}

export async function deletePrenotation(pren: Prenotazione) {
    await db.delete(prenotazioni).where(eq(prenotazioni.id, pren.id));
}
