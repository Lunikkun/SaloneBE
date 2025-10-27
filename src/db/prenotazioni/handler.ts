import { desc, eq, gte, lt, lte, and, ne } from "drizzle-orm";
import { db } from "../../dbConnection";
import { InsertPrenotazione, Prenotazione, prenotazioni } from "./schema";
import { selectService } from "../saloonServices/handler";
import { staff } from "../staff/schema";
import { saloonServices } from "../saloonServices/schema";


export async function selectPrenotation(user_id: number) {
  return await db
    .select({user_id: prenotazioni.user_id, service_name: saloonServices.nome, data_prenotazione:prenotazioni.data_prenotazione, note:prenotazioni.nota, durata: saloonServices.durata})
    .from(prenotazioni)
    .where(eq(prenotazioni.user_id, user_id)).innerJoin(saloonServices, eq(prenotazioni.service_id, saloonServices.id));
}
export async function createPrenotation(pren: InsertPrenotazione) {
  await db.insert(prenotazioni).values(pren).returning();
}

export async function deletePrenotation(pren: Prenotazione) {
  await db.delete(prenotazioni).where(eq(prenotazioni.id, pren.id));
}

export async function selectNextPrenotation(date: Date, staffMemberId: number) {
  return await db
    .select()
    .from(prenotazioni)
    .where(
      and(
        eq(prenotazioni.staffMember, staffMemberId),
        gte(prenotazioni.data_prenotazione, date)
      )
    )
    .orderBy(prenotazioni.data_prenotazione)
    .limit(1)
    .then(res => res[0]);
}
export async function selectPreviousPrenotation(date: Date, staffMemberId: number) {
  return await db
    .select()
    .from(prenotazioni)
    .where(
      and(
        eq(prenotazioni.staffMember, staffMemberId),
        lte(prenotazioni.data_prenotazione, date)
      )
    )
    .orderBy(desc(prenotazioni.data_prenotazione))
    .limit(1)
    .then(res => res[0]);
}
/* DA RIFARE TUTTO IL SISTEMA DI CHECK OVERLAPPING IN QUANTO 
ORA CI SONO DIVERSI MEMBRI DELLO STAFF CHE POSSONO OVERLAPPARSI TRA LORO
DA TENERE IN CONTO: 
LA DURATA DEL LORO LAVORO
IL FATTO CHE UN GIORNO POSSONO ESSERE NON DISPONIBILI
 
*/
export async function checkPrenotationOverlap(
  date: Date,
  durata: number, // in minuti
  workerId: number
) {
  // Calcola l'intervallo temporale della nuova prenotazione
  const startDate = date;
  const endDate = new Date(startDate.getTime() + durata * 60 * 1000);

  // Ottieni tutte le prenotazioni del lavoratore in questione
  const existingPrenotations = await db
    .select()
    .from(prenotazioni)
    .where(eq(prenotazioni.staffMember, workerId));

  // Se il lavoratore non ha prenotazioni, non c’è sovrapposizione
  if (existingPrenotations.length === 0) return false;

  // Controlla overlap con ciascuna prenotazione esistente
  for (const pren of existingPrenotations) {
    const service = await selectService(pren.service_id);
    const prenStart = pren.data_prenotazione;
    const prenEnd = new Date(prenStart.getTime() + service.durata * 60 * 1000);

    /*
      L’overlap esiste se:
      - l’inizio della nuova prenotazione è prima della fine di un’altra, E
      - la fine della nuova prenotazione è dopo l’inizio di un’altra
    */
    const overlaps =
      startDate < prenEnd && endDate > prenStart;

    if (overlaps) {
      console.log(
        `⚠️ Overlap rilevato con prenotazione ID ${pren.id} (${prenStart.toISOString()} - ${prenEnd.toISOString()})`
      );
      return true;
    }
  }

  // Nessuna sovrapposizione trovata
  return false;
}


export async function getPrenotationInfo(id: number) {
  let res = await db.select().from(prenotazioni).where(eq(prenotazioni.id, id));
  return res[0];
}

export async function deleteExpiredPrenotations() {
  return await db
    .delete(prenotazioni)
    .where(lt(prenotazioni.data_prenotazione, new Date(Date.now())));
}

export async function updatePrenotation(id: number, newDate: Date) {
  await db
    .update(prenotazioni)
    .set({ data_prenotazione: newDate })
    .where(eq(prenotazioni.id, id))
    .returning();
}
