import { eq } from "drizzle-orm";
import { db } from "../../dbConnection.js";
import { InsertUser, User, users } from "./schema.js";
import { QueryResult } from "pg";
import { getHash, verifyHash } from "../../argon.js";
import { createSession } from "../sessions/handler.ts";

//INSERT A USER INTO DB
export async function insertUser(u: InsertUser) {
  let altreadyExist = await selectUser(u["mail"]);
  u.password = await getHash(u.password);
  console.log(altreadyExist);
  if (altreadyExist) {
    return null;
  }
  return await db.insert(users).values(u).returning();
}
//SELECT SINGLE USER
export async function selectUser(mail: Required<string>): Promise<User> {
  let _result = await db.select().from(users).where(eq(users.mail, mail));
  return _result[0];
}
export async function selectUserFromID(user_id: Required<number>): Promise<User> {
  let _result = await db.select().from(users).where(eq(users.id, user_id))
  return _result[0];
}
//SELECT MULTIPLE USERS
export async function selectAllUsers(): Promise<User[]> {
  let _result = await db.select().from(users);
  return _result;
  //JFLAP
}
//REMOVE USER
export async function removeUser(mail: Required<string>): Promise<QueryResult> {
  return await db.delete(users).where(eq(users.mail, mail));
}
//MODIFY USER INFO
export async function updateUser(
  mail: Required<string>,
  { cognome, nome, password }: Partial<User>,
) {
  return await db
    .update(users)
    .set({ cognome: cognome, nome: nome, password: password })
    .where(eq(users.mail, mail))
    .returning();
}

export async function login(mail: string, password: string) {
  let userToCheck: User = await selectUser(mail);
  let res: {
    session: string;
    result: boolean;
    description: string;
  } = {
    session: "",
    result: false,
    description: "",
  };

  if (!userToCheck) {
    res.session = "";
    res.description = "Utente non trovato";
    res.result = false;
    return res;
  }
  if (await verifyHash(password, userToCheck.password)) {
    res.session = await createSession(userToCheck);
    res.result = true;
    res.description = "Login avvenuto con successo";
    return res; // Assign the value of 'res' before returning
  } else {
    res.description = "Password errata";
    res.result = false;
    res.session = "";
    return res;
  }
  //TODO RETURNARE QUALCOSA DAL LOGIN, FORSE UN TOKEN O I DATI DI ACCESSO DELL'UTENTE
}
