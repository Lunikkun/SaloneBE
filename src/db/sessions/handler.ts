import { boolean } from "drizzle-orm/mysql-core";
import { db } from "../../dbConnection.js";
import { User } from "../users/schema.js";
import { sessions, Session, InsertSession } from "./schema.js";
import { eq } from "drizzle-orm";


export function generateToken() : string {
    //IPOTESI: AGGIUNGERE IL PARAMETO NUMERICO TIME_PASSED
    //USARLO PER RENDERE UNIVOCI I TOKEN DIVIDIVENDO %64 IN 64 CLASSI DI EQ.
    //POTREBBE NON FUNZIONARE PER CLASSI DI EQ UGUALI NONOSTANTE TEMPI DIVERSI
    const array = new Uint8Array(256);
    let token : string = ""
    const dict = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789?!"
    crypto.getRandomValues(array);
    array.forEach(elem=>{
            let value = Math.floor(elem/4);
            token+=dict[value];
            //console.log("value ", value, " Dict ", dict[value])
    });
    //console.log(token);
    return token;
}

export async function isPresent(token : string) : Promise<boolean>{
    
    let value = await db.select().from(sessions).where(eq(sessions.token, token));
    if(value[0]){
        return true
    }else{
        return false
    }
}

export async function createSession(users : User) : Promise<string>{
   
    let session : InsertSession = {}
    session.user_id = users.id;
    session.created_at = new Date();
    session.expires_at = new Date(Date.now()+1000*60*60*24*7);
    session.token = generateToken();

    console.log("token presente?: ", await isPresent(session.token));
    //isPresent(session.token).then(value=>console.log(value));
    if((await isPresent(session.token)) === false){
        await db.insert(sessions).values(session);
        return session.token;
    }
    else
        return "ERROR"
        console.error("Token già esistente");
    
}

