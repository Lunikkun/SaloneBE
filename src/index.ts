import { PgUUID, uuid } from 'drizzle-orm/pg-core';
import { insertUser, login, selectUser, updateUser } from './db/users/handler.js';
import { InsertUser } from './db/users/schema.js';
import { config } from 'dotenv';
import koa from "koa"

const app = new koa( );

app.listen(3000, async()=>{
    console.log("Server avviato");
    //let u : InsertUser = {nome:"aadda", cognome: "ssccc", mail:"costantino@costantino.com", password:"chiaro"}
    //await insertUser(u);
    await updateUser("costantino@costantino.com",{cognome: "Panemarzio"});
    let res = await login("costantino@costantino.com", "chiaro");
    console.log(res);
   
});
