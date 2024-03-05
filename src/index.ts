import { PgUUID, uuid } from 'drizzle-orm/pg-core';
import { insertUser } from './db/users/handler.js';
import { InsertUser } from './db/users/schema.js';
import { config } from 'dotenv';
import koa from "koa"

const app = new koa( );

app.listen(3000, async()=>{
    console.log("Server avviato");
    let u : InsertUser = {nome:"aaa", cognome: "ccc", mail:"aa", password:"aa"}
    await insertUser(u);

});
