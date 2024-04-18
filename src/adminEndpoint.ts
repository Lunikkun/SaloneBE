import { Hono } from "Hono";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { getUserFromToken } from "./db/sessions/handler";
import { User } from "./db/users/schema";
import { zValidator } from "@hono/zod-validator";
import { insertUser, selectUser, selectUserFromID } from "./db/users/handler";
import z from "zod";
import {
  checkPrenotationOverlap,
  deleteExpiredPrenotations,
  deletePrenotation,
  getPrenotationInfo,
  selectPrenotation,
  updatePrenotation,
} from "./db/prenotazioni/handler";
import { selectService } from "./db/saloonServices/handler";
import { emailOptions, transporter } from "./emailServiceData";

let admin = new Hono();
declare module "hono" {
  interface ContextVariableMap {
    adminUser: User;
  }
}
admin.use(
  "/*",
  createMiddleware(async (c, next) => {
    
    const auth_cookie = getCookie(c, "ssid");
    if (!auth_cookie) return c.body("Unauthorized", { status: 401 });
    console.log(auth_cookie);
    const adminUser = await getUserFromToken(auth_cookie);
    console.log(adminUser)
    if (!adminUser || !adminUser.isAdmin)
      return c.body("Unauthorized, not Admin", { status: 401 });

    c.set("adminUser", adminUser);
    await next();
  })
);

admin.get("/", async (c) => {
  let adminData = c.get("adminUser");
  return c.body(adminData.id+" "+adminData.isAdmin, {status : 200});
});

//UN ADMIN LOGGATO CREA UN ALTRO ACCOUNT ADMIN
admin.post(
  "/recommend",
  zValidator(
    "json",
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
      nome: z.string(),
      cognome: z.string(),
    })
  ),
  async (c) => {
    const { email, password, nome, cognome } = await c.req.json();
    let user = await insertUser({
      mail: email,
      password,
      nome,
      cognome,
      isAdmin: true,
    });
    const userData = await selectUser(email);
    transporter.sendMail({
      from: emailOptions.from,
      to: userData.mail,
      subject: "Aggiunta STAFF",
      html:
        userData.cognome +
        " " +
        userData.nome + " Sei appena stato promosso ad admin"
    });
    if (user == null) return c.body("Mail già presente", { status: 500 });
    return c.body(null, { status: 200 });
  }
);

admin.post(
  "/reschedule",
  zValidator(
    "json",
    z.object({ id_prenotazione: z.number(), data_prenotazione: z.string().datetime() })
  ),
  async (c) => {
    const { id_prenotazione, data_prenotazione } = await c.req.json<{
      id_prenotazione: number;
      data_prenotazione: string;
    }>();
    let prenotationInfo = await getPrenotationInfo(id_prenotazione);
    const userData = await selectUserFromID(prenotationInfo.user_id);
    const serviceInfo = await selectService(prenotationInfo["service_id"]);
    let overlap = await checkPrenotationOverlap(
      new Date(data_prenotazione),
      serviceInfo["durata"]
    );
    if (!overlap) {
      await updatePrenotation(id_prenotazione, new Date(data_prenotazione))
      transporter.sendMail({
        from: emailOptions.from,
        to: userData.mail,
        subject: "CONFERMA MODIFICA ORARIO",
        html:
          "Prenotazione ID:"+ prenotationInfo.id+" a nome di: " +
          userData.cognome +
          " " +
          userData.nome +
          "<br> Servizio: " +
          serviceInfo["nome"] +
          "<br> In data: " +
          data_prenotazione
      });
      return c.body("DATA MODIFICATA", { status: 200 });
    } else {
      return c.body("IMPOSSIBILE PRENOTARE DATA", { status: 500 });
    }
  }
);

admin.post("/annulla/:id", async (c) => {
  let { id } = c.req.param();
  let prenotationInfo = await getPrenotationInfo(parseInt(id));
  let serviceInfo = await selectService(prenotationInfo.service_id);
  const user = await selectUserFromID(prenotationInfo["id"]);
  if (prenotationInfo === undefined) {
    return c.body("ID NON ESISTENTE", { status: 404 });
  }
  else {
    await deleteExpiredPrenotations();
    await deletePrenotation(prenotationInfo);
    transporter.sendMail({
      from: emailOptions.from,
      to: user.mail,
      subject: "Annullamento appuntamento",
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

export default admin;
