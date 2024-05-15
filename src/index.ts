import { PgUUID, uuid } from "drizzle-orm/pg-core";
import {
  insertUser,
  login,
  selectUser,
  selectUserFromID,
  updateUser,
} from "./db/users/handler.js";
import { config } from "dotenv";
import { Hono } from "Hono";
import { serve } from "@hono/node-server";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import {
  deleteExpiredSessions,
  getUserIDFromToken,
  invalidateCookie,
} from "./db/sessions/handler.js";
import { InsertPrenotazione } from "./db/prenotazioni/schema.js";
import user from "./userEndpoints.js";
import {
  createPasswordResetToken,
  deleteExpiredResetSessions,
  deleteResetSessions,
  selectUserFromResetToken,
  sendResetEmail,
} from "./db/password_reset/handler.js";
import { User } from "./db/users/schema.js";
import { PasswordReset } from "./db/password_reset/schema.js";
import { getHash } from "./argon.js";
import admin from "./adminEndpoint.js";
import busboy from "busboy";
import { S3sendFile } from "../awsConnection.js";

const app = new Hono();

app.post(
  "/login",
  zValidator(
    "json",
    z.object({
      email: z.string().email(),
      password: z.string(),
    })
  ),
  async (c) => {
    const { email, password } = await c.req.json();
    try {
      const data = await login(email, password);
      console.log(data);
      if (data["result"] === false) {
        c.status(400);
        return c.body(data.description + " " + data.result);
      }
      const token: string = data["session"];
      setCookie(c, "ssid", token, { httpOnly: true });
      c.status(200);
      return c.body("Succesful");
    } catch (error) {
      console.log(error);
      return c.body(JSON.stringify(error), { status: 500 });
    }
  }
);

app.post("/logout", async (c) => {
  let cookie = getCookie(c, "ssid");
  if (!cookie) {
    throw new Error("Cookie non presente");
  }
  c.set("adminUser", {
    id: -1,
    cognome: "",
    nome: "",
    mail: "",
    password: "",
    isAdmin: false,
    gender: "",
    creation_date: null,
  });
  c.set("user", {
    id: -1,
    cognome: "",
    nome: "",
    mail: "",
    password: "",
    gender: "",
    isAdmin: false,
    creation_date: null,
  });
  deleteCookie(c, "ssid");
  await invalidateCookie(cookie);
  await deleteExpiredSessions();
  return c.body("SUCCESFULLY LOGGED OUT", { status: 200 });
});

/*
app.post(
  "/register",
  zValidator(
    "json",
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
      nome: z.string(),
      cognome: z.string(),
      isMale: z.boolean(),
      immagine: z.string(),
    })
  ),
  async (c) => {
    const data = await c.req.json<{
      email: string;
      password: string;
      nome: string;
      cognome: string;
      gender: string;
    }>();
    const { email, nome, cognome, password, gender } = data;
    console.log(email, nome);
    let user = await insertUser({
      mail: email,
      password,
      nome,
      cognome,
      gender,
    });
    if (user == null) return c.body("Mail già presente", { status: 500 });
    return c.body(null, { status: 200 });
  }
);
*/

app.post("/registerform", async (c) => {
  const data = await c.req.parseBody();
  //console.log(data['email']+" "+data["immagine"]);
  
  const mail = data.email as string;
  const password = data.password as string;
  const nome = data.nome as string;
  const cognome = data.cognome as string;
  const gender = data.gender as string;
  const immagine = data.immagine as File;
  //DA INSERIRE SALVATAGGIO SU AWS S3 IMMAGINE E DARE UN ID PER IL RETRIEVE
  
  console.log(mail, immagine, nome, cognome, password, gender); 
  let user = await insertUser({ mail, password, nome, cognome, gender }, immagine);
    if (user == null) return c.body("Mail già presente", { status: 500 });
  return c.body(null, { status: 200 });
});

app.post(
  "/reset-password",
  zValidator("json", z.object({ email: z.string().email() })),
  async (c) => {
    const { email } = await c.req.json<{ email: string }>();
    const token = await createPasswordResetToken(email);
    const link = "http://localhost:3000/reset-password/" + token;
    console.log(c.req.json());
    await sendResetEmail(email, link);
    return c.body(null, { status: 200 });
  }
);

app.get("/reset-password/:token", async (c) => {
  const { token } = c.req.param();

  return c.redirect("/reset-password-apply/" + token);
});
app.post(
  "/reset-password-apply/:token",
  zValidator("json", z.object({ password: z.string().min(8) })),
  async (c) => {
    const { token } = c.req.param();
    let { password } = await c.req.json<{ password: string }>();
    const passwordResetSession = await selectUserFromResetToken(token);
    if (passwordResetSession === undefined)
      return c.body(null, { status: 404 });
    password = await getHash(password);
    await updateUser(passwordResetSession["users"].mail, { password });
    await deleteResetSessions(passwordResetSession["users"].id);
    await deleteExpiredResetSessions();
    return c.body(token, { status: 200 });
  }
);
app.route("/admin", admin);
app.route("/user", user);

serve({ port: 3000, fetch: app.fetch });
