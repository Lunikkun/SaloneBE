import { Service } from "./db/saloonServices/schema";
import { User } from "./db/users/schema";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "Hono";
import {
  getCookie,
} from "hono/cookie";
import z from "zod";
import {
  checkPrenotationOverlap,
  createPrenotation,
  deleteExpiredPrenotations,
  deletePrenotation,
  getPrenotationInfo,
  selectPrenotation,
} from "./db/prenotazioni/handler";
import { getUserFromToken } from "./db/sessions/handler";
import { InsertPrenotazione } from "./db/prenotazioni/schema";
import { selectService } from "./db/saloonServices/handler";
import { createMiddleware } from "hono/factory";
import { emailOptions, transporter } from "./emailServiceData";
import { InsertRecensione } from "./db/recensioni/schema";
import { insertRecensione } from "./db/recensioni/handler";
import { sendBookingReminder } from "./mailgunSample";

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
    if (!auth_cookie) return c.body(JSON.stringify({error:"Unauthorized"}), { status: 401 });

    const user = await getUserFromToken(auth_cookie);
    if (!user) return c.body(JSON.stringify({error: "Unauthorized"}), { status: 401 });
    c.set("user", user);
    await next();
  })
);

user.post(
  "/prenota",
  zValidator(
    "json",
    z.object({
      data_prenotazione: z.string(),
      id_servizio: z.number(),
    })
  ),
  async (c) => {
    let { id_servizio, data_prenotazione, id_staff_member } = await c.req.json<{
      id_servizio: number;
      data_prenotazione: string;
      id_staff_member : number
    }>();
    const data_pren = new Date(data_prenotazione);
    if (data_pren.getTime() < Date.now()) {
      return c.body(JSON.stringify({error: "Data già prenotata"}), { status: 400 });
    }
    let serviceInfo: Service = await selectService(id_servizio);
    let overlap = await checkPrenotationOverlap(
      data_pren,
      serviceInfo["durata"] * 1000 * 60,
      id_staff_member
    );
    if (overlap) return c.body(JSON.stringify({error: "Data già prenotata"}), { status: 400 });
    else {
      const user = c.get("user");
      let prenotazione: InsertPrenotazione = {
        data_prenotazione: data_pren,
        user_id: user.id,
        service_id: id_servizio,
        staffMember : id_staff_member
      };
      await createPrenotation(prenotazione);
      sendBookingReminder(user, serviceInfo, data_pren)
      /*transporter.sendMail({
        from: emailOptions.from,
        to: user.mail,
        subject: "Conferma prenotazione",
        html:
          "Prenotazione effettuata a nome di: " +
          user.cognome +
          " " +
          user.nome +
          "<br> Servizio: " +
          serviceInfo["nome"] +
          "<br> In data: " +
          data_pren,
      });*/
      return c.body(JSON.stringify({success: "Prenotazione effettuata"}), { status: 200 });
    }
  }
);

user.post("/annulla/:id", async (c) => {
  let { id } = c.req.param();
  let user = c.get("user");
  let prenotationInfo = await getPrenotationInfo(parseInt(id));
  let serviceInfo = await selectService(prenotationInfo.service_id);
  if (prenotationInfo === undefined) {
    return c.body(JSON.stringify({error: "ID NON ESISTENTE"}), { status: 404 });
  } else if (prenotationInfo["user_id"] != c.get("user").id) {
    return c.body(JSON.stringify({error: "PRENOTAZIONE NON APPARTENTE ALL'UTENTE"}), { status: 500 });
  } else {
    await deleteExpiredPrenotations();
    await deletePrenotation(prenotationInfo);
    transporter.sendMail({
      from: emailOptions.from,
      to: user.mail,
      subject: "Conferma annullamento",
      html:
        "Prenotazione per: " +
        user.cognome +
        " " +
        user.nome +
        "<br> Servizio: " +
        serviceInfo.nome +
        "<br> In data: " +
        prenotationInfo.data_prenotazione +
        "Annullata con successo",
    });
    return c.body("PRENOTATIONE ANNULLATA CON SUCCESSO", { status: 200 });
  }
});

user.post(
  "/recensione",
  zValidator("json", z.object({ voto: z.number(), recensione: z.string() })),
  async (c) => {
    const {voto, recensione} = await c.req.json<{voto:number, recensione:string}>();
    const userReview : InsertRecensione = {
      id_utente : c.get("user").id,
      data_recensione : new Date(Date.now()),
      voto,
      recensione
    }
    await insertRecensione(userReview);
    return c.body(null, {status:200})
  }
);
user.get("/prenotazioni", async (c) => {
  console.log(c.get("user").id);
  let prenotations = await selectPrenotation(c.get("user").id);
  return c.body(JSON.stringify(prenotations), { status: 200 });
});
export default user;
