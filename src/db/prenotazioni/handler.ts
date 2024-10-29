import { desc, eq, gte, lt, lte } from "drizzle-orm";
import { db } from "../../dbConnection";
import { InsertPrenotazione, Prenotazione, prenotazioni } from "./schema";
import { selectService } from "../saloonServices/handler";

export async function selectPrenotation(user_id: number) {
  return await db.select().from(prenotazioni).where(eq(prenotazioni.user_id, user_id));
}
export async function createPrenotation(pren: InsertPrenotazione) {
  await db.insert(prenotazioni).values(pren).returning();
}

export async function deletePrenotation(pren: Prenotazione) {
  await db.delete(prenotazioni).where(eq(prenotazioni.id, pren.id));
}

export async function selectNextPrenotation(date: Date) {
  let greater = await db
    .select()
    .from(prenotazioni)
    .where(gte(prenotazioni.data_prenotazione, date))
    .orderBy(prenotazioni.data_prenotazione);
  //greater.forEach(g=>{console.log(g.data_prenotazione)});
  return greater[0];
}

export async function selectPreviousPrenotation(date: Date) {
  let lesser = await db
    .select()
    .from(prenotazioni)
    .where(lte(prenotazioni.data_prenotazione, date))
    .orderBy(desc(prenotazioni.data_prenotazione));
  return lesser[0];
}

export async function checkPrenotationOverlap(date: Date, durata: number) {
  let endDate = new Date(date.getTime() + durata);
  let precedente = await selectPreviousPrenotation(date);
  let successivo = await selectNextPrenotation(date);
  //SE UNO DEI 2 CAMPI E' VUOTO???
  console.log(precedente + " " + successivo);

  if (successivo === undefined && precedente === undefined) {
    return false;
  }

  if (precedente === undefined) {
    if (endDate >= successivo.data_prenotazione) return true;
    else return false;
  }
  if (successivo === undefined) {
    let previousService = (await selectService(precedente.service_id));
    let previousServiceDuration = new Date(
      precedente.data_prenotazione.getTime() +
        previousService.durata * 1000 * 60,
    );
    console.log("DATE: " + date + " " + previousServiceDuration);
    if (date <= previousServiceDuration) return true;
    else return false;
  }

  console.log(precedente.data_prenotazione);
  console.log(successivo.data_prenotazione);

  let previousService = (await selectService(precedente.service_id));
  let previousServiceDuration = new Date(
    precedente.data_prenotazione.getTime() + previousService.durata * 1000 * 60,
  );
  console.log(
    "DATE(entrambi !undefined): " + date + " " + previousServiceDuration,
  );
  if (date <= previousServiceDuration) {
    return true;
  } else if (endDate >= successivo.data_prenotazione) {
    return true;
  } else return false;
}

export async function getPrenotationInfo(id:number) {
  let res = await db.select().from(prenotazioni).where(eq(prenotazioni.id, id));
  return res[0];
}

export async function deleteExpiredPrenotations() {
  return await db.delete(prenotazioni).where(lt(prenotazioni.data_prenotazione, new Date(Date.now())));
}

export async function updatePrenotation(id:number, newDate : Date) {
  await db.update(prenotazioni).set({data_prenotazione : newDate}).where(eq(prenotazioni.id, id)).returning();
}
