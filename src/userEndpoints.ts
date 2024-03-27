import { User } from './db/users/schema';
import { zValidator } from "@hono/zod-validator";
import { Hono } from "Hono";
import { json } from "drizzle-orm/pg-core";
import {
  getCookie,
  getSignedCookie,
  setCookie,
  setSignedCookie,
  deleteCookie,
} from "hono/cookie";
import z from "zod";
import { createPrenotation } from "./db/prenotazioni/handler";
import { getUserIDFromToken } from "./db/sessions/handler";
import { InsertPrenotazione } from "./db/prenotazioni/schema";

let user = new Hono();
let UserID : number

user.use("/*", async (c, next) => {
  let cookie = getCookie(c, "ssid");
  console.log(cookie); 
  if (!cookie) {
    return c.body("UNAUTHORIZED_PAGE", { status: 401 });
  }
  let uid = (await getUserIDFromToken(cookie))!;
  UserID = uid;
  console.log("va")
  await next();
});

user.post(
  "/prenota",
  zValidator(
    "json",
    z.object({
      data_prenotazione: z.string().datetime(),
      id_servizio : z.string()
    })
  ),
  async (c) => {
    let { id_servizio, data_prenotazione } = await c.req.json<{id_servizio : number, data_prenotazione : Date}>();
    data_prenotazione = new Date(data_prenotazione);
    console.log(data_prenotazione+" "+id_servizio+ " "+UserID);
    if(data_prenotazione.getTime()<Date.now()){
      return c.body("INVALID DATE", {status:400})
    }
    let prenotazione : InsertPrenotazione = {
      data_prenotazione,
      user_id: UserID,
      service_id : id_servizio
    }
    createPrenotation(prenotazione);

    return c.body("OK");
  }
);

export default user;
