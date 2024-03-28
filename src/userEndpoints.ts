import { Service } from "./db/saloonServices/schema";
import { User } from "./db/users/schema";
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
import {
  checkPrenotationOverlap,
  createPrenotation,
  selectNextPrenotation,
  selectPreviousPrenotation,
} from "./db/prenotazioni/handler";
import { getUserIDFromToken } from "./db/sessions/handler";
import { InsertPrenotazione, Prenotazione } from "./db/prenotazioni/schema";
import { selectService } from "./db/saloonServices/handler";
import { ne } from "drizzle-orm";
import { serve } from "@hono/node-server";

let user = new Hono();
let UserID: number;

user.use("/*", async (c, next) => {
  let cookie = getCookie(c, "ssid");
  console.log(cookie);
  if (!cookie) {
    return c.body("UNAUTHORIZED_PAGE", { status: 401 });
  }
  let uid = (await getUserIDFromToken(cookie))!;
  UserID = uid;
  console.log("va");
  await next();
});

user.post(
  "/prenota",
  zValidator(
    "json",
    z.object({
      data_prenotazione: z.string().datetime(),
      id_servizio: z.string(),
    })
  ),
  async (c) => {
    let { id_servizio, data_prenotazione } = await c.req.json<{
      id_servizio: number;
      data_prenotazione: Date;
    }>();
    data_prenotazione = new Date(data_prenotazione);
    if (data_prenotazione.getTime() < Date.now()) {
      return c.body("INVALID DATE", { status: 400 });
    }
    let serviceInfo: Service = (await selectService(id_servizio))[0];
    let overlap = await checkPrenotationOverlap(data_prenotazione, serviceInfo["durata"]*1000*60);
    if(overlap)
      return c.body("Data già prenotata", { status: 500 });
    else 
      {
        let prenotazione : InsertPrenotazione = {
          data_prenotazione,
           user_id : UserID,
          service_id : id_servizio
        }
        createPrenotation(prenotazione);
        return c.body("Prenotazione effettuata", {status:200})
      }
  }
);

export default user;
