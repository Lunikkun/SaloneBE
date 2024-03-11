import { eq } from 'drizzle-orm';
import { db } from '../../dbConnection.js';
import { InsertUser, User, users } from './schema.js';
import { QueryResult } from 'pg';
import { getHash, verifyHash } from '../../argon.js';

//INSERT A USER INTO DB
export async function insertUser(u : InsertUser) : Promise<QueryResult> {
    u.password = await getHash(u.password);
    return await db.insert(users)
                    .values(u);
}
//SELECT SINGLE USER
export async function selectUser(mail:Required<string>) : Promise<User>{
    let _result = await db.select()
                        .from(users)
                        .where(eq(users.mail, mail));
    return _result[0];
}
//SELECT MULTIPLE USERS
export async function selectAllUsers() : Promise<User[]>{
    let _result = await db
                        .select()
                        .from(users);
    return _result;
    //JFLAP
}
//REMOVE USER
export async function removeUser(mail:Required<string>) : Promise<QueryResult> {
   return await db.delete(users)
            .where(eq(users.mail, mail));
}
//MODIFY USER INFO
export async function updateUser(mail:Required<string>, {cognome, nome, password} : Partial<User>) {
        return(
        await db.update(users)
        .set({cognome:cognome, nome:nome, password:password})
        .where(eq(users.mail, mail))
        .returning()
        )
}

export async function login(mail:Required<string>, password:Required<string>) {
    
   let userToCheck : User = await selectUser(mail);
   if(await verifyHash(password, userToCheck.password)){
        console.log("verificato");
   }else{
        console.log("non verificato");
   }
   //TODO RETURNARE QUALCOSA DAL LOGIN, FORSE UN TOKEN O I DATI DI ACCESSO DELL'UTENTE
}
