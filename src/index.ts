import { PgUUID, uuid } from "drizzle-orm/pg-core";
import {
  insertUser,
  login,
  selectUser,
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
  invalidateCookie,
} from "./db/sessions/handler.js";
import user from "./userEndpoints.js";

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
  return c.body("SUCCESFULLY LOGGED OUT", {status:200});
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
  "/recupero_password",
  zValidator("json", z.object({ email: z.string().email() })),
  async (c) => {
    console.log(c.req.json());
  }
);
app.route("/user", user);

serve({ port: 3000, fetch: app.fetch });
