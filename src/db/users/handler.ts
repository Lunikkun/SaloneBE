import { eq } from "drizzle-orm";
import { db } from "../../dbConnection.js";
import { InsertUser, User, users } from "./schema.js";
import { QueryResult } from "pg";
import { getHash, verifyHash } from "../../argon.js";
import { createSession, getUserFromToken } from "../sessions/handler.ts";
import { S3sendFile } from "../../../awsConnection.ts";
import user from "../../userEndpoints.ts";

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
export async function selectUserFromID(
  user_id: Required<number>
): Promise<User> {
  let _result = await db.select().from(users).where(eq(users.id, user_id));
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
  { cognome, nome, password }: Partial<User>
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
    session: string | null;
    result: boolean;
    description: string | null;
    userData: {
      id: number;
      nome: string;
      cognome: string;
      gender: string;
      creationDate: Date | null;
    } | null;
  } = {
    session: null,
    result: false,
    description: "",
    userData: null,
  };

  if (!userToCheck) {
    res.session = null;
    res.description = "Utente non trovato";
    res.result = false;
    return res;
  }
  if (await verifyHash(password, userToCheck.password)) {
    res.session = await createSession(userToCheck);
    res.result = true;
    res.description = "Login avvenuto con successo";
    res.userData = {
      id: userToCheck.id,
      nome: userToCheck.nome,
      cognome: userToCheck.cognome,
      gender: userToCheck.gender,
      creationDate: userToCheck.creation_date,
    };
    return res; // Assign the value of 'res' before returning
  } else {
    res.description = "Password errata";
    res.result = false;
    res.session = null;
    res.userData = null;
    return res;
  }
  //TODO RETURNARE QUALCOSA DAL LOGIN, FORSE UN TOKEN O I DATI DI ACCESSO DELL'UTENTE
}

export async function loginWithCookie(sessionToken: string) {
  let userToCheck = await getUserFromToken(sessionToken);
  let res: {
    session: string | null;
    result: boolean;
    description: string | null;
    userData: {
      id: number;
      nome: string;
      cognome: string;
      gender: string;
      creationDate: Date | null;
    } | null;
  } = {
    session: null,
    result: false,
    description: "",
    userData: null,
  };

  if (!userToCheck) {
    res.session = null;
    res.description = "Utente non trovato";
    res.result = false;
    return res;
  } else {
    res.session = sessionToken;
    res.result = true;
    res.description = "Login avvenuto con successo";
    res.userData = {
      id: userToCheck.id,
      nome: userToCheck.nome,
      cognome: userToCheck.cognome,
      gender: userToCheck.gender,
      creationDate: userToCheck.creation_date,
    };
    return res;
  }
}
