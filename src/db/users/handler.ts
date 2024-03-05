import { eq } from 'drizzle-orm';
import { db } from '../../dbConnection.js';
import { InsertUser, User, users } from './schema.js';
import { QueryResult } from 'pg';

//INSERT A USER INTO DB
export async function insertUser(u : InsertUser) : Promise<QueryResult> {
    return await db.insert(users).values(u);
}
//SELECT SINGLE USER
export async function selectUser(mail:string) : Promise<User>{
    let _result = await db.select().from(users).where(eq(users.mail, mail));
    return _result[0];
}

//SEELCT MULTIPLE USERS
export async function selectAllUsers() : Promise<User[]>{
    let _result = await db.select().from(users);
    return _result;
    //JFLAP
}