import { Service } from "./db/saloonServices/schema";
import { User, users } from "./db/users/schema";
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
  deleteExpiredPrenotations,
  deletePrenotation,
  getPrenotationInfo,
  selectNextPrenotation,
  selectPrenotation,
  selectPreviousPrenotation,
} from "./db/prenotazioni/handler";
import {
  deleteExpiredSessions,
  getUserIDFromToken,
} from "./db/sessions/handler";
import { InsertPrenotazione, Prenotazione } from "./db/prenotazioni/schema";
import { selectService } from "./db/saloonServices/handler";
import { ne } from "drizzle-orm";
import { serve } from "@hono/node-server";
import { use } from "hono/jsx";

let user = new Hono();
let UserID: number;

user.use("/*", async (c, next) => {
  let cookie = getCookie(c, "ssid");
  console.log(cookie);
  if (!cookie) {
    return c.body("UNAUTHORIZED_PAGE", { status: 401 });
  }
  let uid = await getUserIDFromToken(cookie);
  if (uid === null || uid === undefined) {
    return c.body("TOKEN INESISTENTE", { status: 404 });
  }
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
    let overlap = await checkPrenotationOverlap(
      data_prenotazione,
      serviceInfo["durata"] * 1000 * 60
    );
    if (overlap) return c.body("Data già prenotata", { status: 500 });
    else {
      let prenotazione: InsertPrenotazione = {
        data_prenotazione,
        user_id: UserID,
        service_id: id_servizio,
      };
      createPrenotation(prenotazione);
      return c.body("Prenotazione effettuata", { status: 200 });
    }
  }
);

user.post("/annulla/:id", async (c) => {
  let { id } = c.req.param();

  let prenotationInfo = await getPrenotationInfo(parseInt(id));
  if (prenotationInfo === undefined) {
    return c.body("ID NON ESISTENTE", { status: 404 });
  } else if (prenotationInfo["user_id"] != UserID) {
    return c.body("PRENOTAZIONE NON APPARTENTE ALL'UTENTE", { status: 500 });
  } else {
    await deleteExpiredPrenotations();
    await deletePrenotation(prenotationInfo);
    return c.body("PRENOTATIONE ANNULLATA CON SUCCESSO", { status: 200 });
  }
});

user.get("/prenotazioni", async (c) => {
  console.log(UserID);
  let prenotations = await selectPrenotation(UserID);
  return c.body(JSON.stringify(prenotations), { status: 200 });
});
export default user;
