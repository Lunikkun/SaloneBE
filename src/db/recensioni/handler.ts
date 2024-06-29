import { count, desc, eq } from 'drizzle-orm';
import { db } from "../../dbConnection";
import { InsertRecensione, Recensione, recensioni } from "./schema";
import { users } from '../users/schema';
import user from '../../userEndpoints';

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

export async function selectLastRecensione() {
    let res = await db.select({descrizione : recensioni.recensione, voto: recensioni.voto, data: recensioni.data_recensione, nome: users.nome}).from(recensioni).innerJoin(users, eq(recensioni.id_utente, users.id)).orderBy(desc(recensioni.data_recensione));
    return res[0]
}

