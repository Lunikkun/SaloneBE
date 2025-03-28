import { eq } from "drizzle-orm";
import { db } from "./../../dbConnection.js";
import { InsertService, Service, saloonServices } from "./schema.js";

export async function insertService(service: InsertService) {
  return await db.insert(saloonServices).values(service).returning();
}

export async function selectService(id: number) {
  let res = await db
    .select()
    .from(saloonServices)
    .where(eq(saloonServices.id, id));
    return res[0]
  }

export async function selectAllServices() {
  return await db.select().from(saloonServices);
}

export async function deleteService(id: number) {
  return await db
    .delete(saloonServices)
    .where(eq(saloonServices.id, id))
    .returning();
}
export async function updateService(
  id: number,
  { nome, prezzo, durata, descrizione }: Partial<Service>,
) {
  return await db
    .update(saloonServices)
    .set({ nome: nome, prezzo: prezzo, durata:durata, descrizione: descrizione })
    .where(eq(saloonServices.id, id))
    .returning();
}
