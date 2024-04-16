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
import { getUserFromToken, getUserIDFromToken } from "./db/sessions/handler";
import { InsertPrenotazione, Prenotazione } from "./db/prenotazioni/schema";
import { selectService } from "./db/saloonServices/handler";
import { ne } from "drizzle-orm";
import { serve } from "@hono/node-server";
import { createMiddleware } from "hono/factory";

let user = new Hono();
declare module "hono" {
  interface ContextVariableMap {
    user: User;
  }
}
user.use(
  "/*",
  createMiddleware(async (c, next) => {
    const auth_cookie = getCookie(c, "ssid");
    if (!auth_cookie) return c.body("Unauthorized", { status: 401 });

    const user = await getUserFromToken(auth_cookie);
    if (!user) return c.body("Unauthorized", { status: 401 });

    c.set("user", user);
    await next();
  }),
);

user.post(
  "/prenota",
  zValidator(
    "json",
    z.object({
      data_prenotazione: z.string(),
      id_servizio: z.number(),
    }),
  ),
  async (c) => {
    let { id_servizio, data_prenotazione } = await c.req.json<{
      id_servizio: number;
      data_prenotazione: string;
    }>();
    const data_pren = new Date(data_prenotazione);
    if (data_pren.getTime() < Date.now()) {
      return c.body("INVALID DATE", { status: 400 });
    }
    let serviceInfo: Service = (await selectService(id_servizio))[0];
    let overlap = await checkPrenotationOverlap(
      data_pren,
      serviceInfo["durata"] * 1000 * 60,
    );
    if (overlap) return c.body("Data già prenotata", { status: 500 });
    else {
      const user = c.get("user");
      let prenotazione: InsertPrenotazione = {
        data_prenotazione: data_pren,
        user_id: user.id,
        service_id: id_servizio,
      };
      await createPrenotation(prenotazione);
      return c.body("Prenotazione effettuata", { status: 200 });
    }
  },
);

user.post("/annulla/:id", async (c) => {
  let { id } = c.req.param();

  let prenotationInfo = await getPrenotationInfo(parseInt(id));
  if (prenotationInfo === undefined) {
    return c.body("ID NON ESISTENTE", { status: 404 });
  } else if (prenotationInfo["user_id"] != c.get("user").id) {
    return c.body("PRENOTAZIONE NON APPARTENTE ALL'UTENTE", { status: 500 });
  } else {
    await deleteExpiredPrenotations();
    await deletePrenotation(prenotationInfo);
    return c.body("PRENOTATIONE ANNULLATA CON SUCCESSO", { status: 200 });
  }
});

user.get("/prenotazioni", async (c) => {
  console.log(c.get("user").id);
  let prenotations = await selectPrenotation(c.get("user").id);
  return c.body(JSON.stringify(prenotations), { status: 200 });
});
export default user;
