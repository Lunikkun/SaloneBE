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
  selectUserFromResetToken,
  sendResetEmail,
} from "./db/password_reset/handler.js";
import { User } from "./db/users/schema.js";
import { PasswordReset } from "./db/password_reset/schema.js";
import { getHash } from "./argon.js";

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
      return c.body("JSON.stringify(error)", { status: 500 });
    }
  }
);

app.post("/logout", async (c) => {
  let cookie = getCookie(c, "ssid");
  if (!cookie) {
    throw new Error("Cookie non presente");
  }
  deleteCookie(c, "ssid");
  await invalidateCookie(cookie);
  await deleteExpiredSessions();
  return c.body("SUCCESFULLY LOGGED OUT", { status: 200 });
});

app.post(
  "/register",
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
    let user = await insertUser({ mail: email, password, nome, cognome });
    if (user == null) return c.body("Mail già presente", { status: 500 });

    return c.body(null, { status: 200 });
  }
);

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

  return c.redirect("/reset-password-apply/"+token);
});
app.post(
  "/reset-password-apply/:token",
  zValidator("json", z.object({ password: z.string() })),
  async (c) => {
    const { token } = c.req.param();
    let { password } = await c.req.json<{ password: string }>();
    const passwordResetSession = await selectUserFromResetToken(token);
    password = await getHash(password);
    await updateUser(passwordResetSession["users"].mail, { password });
    return c.body(token, { status: 200 });
  }
);
app.route("/user", user);

serve({ port: 3000, fetch: app.fetch });
