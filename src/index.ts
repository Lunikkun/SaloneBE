import { PgUUID, uuid } from 'drizzle-orm/pg-core';
import { insertUser, selectUser, updateUser } from './db/users/handler.js';
import { InsertUser } from './db/users/schema.js';
import { config } from 'dotenv';
import koa from "koa"

const app = new koa( );

app.listen(3000, async()=>{
    console.log("Server avviato");
    //let u : InsertUser = {nome:"aadda", cognome: "ssccc", mail:"aabbp", password:"aaaa"}
    //await insertUser(u);
    //await updateUser("aabbp",{cognome: "Gattaro"});
    //let res = await selectUser("aabbp");
    //console.log(res);
   
});
