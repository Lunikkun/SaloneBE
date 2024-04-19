import { eq } from 'drizzle-orm';
import { db } from "../../dbConnection";
import { InsertRecensione, Recensione, recensioni } from "./schema";

export async function selectRecensioneByID(review_id:number) {
    let res = await db.select().from(recensioni).where(eq(recensioni.id, review_id));
    return res[0];
}

export async function selectRecensioniByUserID(user_id:number) {
    let res = await db.select().from(recensioni).where(eq(recensioni.id_utente, user_id));
    return res
}

export async function selectAllRecensioni() {
    let res = await db.select().from(recensioni);
    return res
}

export async function insertRecensione(recensione:InsertRecensione) {
    return await db.insert(recensioni).values(recensione);
}

export async function deleteRecensione(recensione_id:number) {
    return await db.delete(recensioni).where(eq(recensioni.id, recensione_id));
}

