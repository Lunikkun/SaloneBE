import { boolean, PgUUID, uuid } from "drizzle-orm/pg-core";
import {
  insertUser,
  login,
  loginWithCookie,
  selectUser,
  selectUserFromID,
  updateUser,
} from "./db/users/handler.js";
import { config } from "dotenv";
import { Hono } from "Hono";
import { serve } from "@hono/node-server";
import { zValidator } from "@hono/zod-validator";
import z, { string } from "zod";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import {
  deleteExpiredSessions,
  getUserFromToken,
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
import { S3sendFile } from "../awsConnection.js";
import { selectAllServices } from "./db/saloonServices/handler.js";
import {
  selectLastRecensione,
  selectRecensioneByID,
} from "./db/recensioni/handler.js";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { selectAllStaffMembers } from "./db/staff/handler.js";

const app = new Hono();
app.use(
  "/*",
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    maxAge: 600,
    allowHeaders: [
      "X-Content-Type-Options",
      "Cookie",
      "Content-Type",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Credential",
    ],
  })
);

/*user.use(
  "/*",
  createMiddleware(async (c, next) => {
    const auth_cookie = getCookie(c, "ssid");
    if (auth_cookie) {
      const user = await getUserFromToken(auth_cookie);
      if (!user) return c.body("Unauthorized", { status: 401 });
      c.set("user", user);
    }
    await next();
  })
);
*/

app.post("/validatelogin", async (c) => {
  //console.log("PROVA ENDPOINT PER CHECK DEL COOKIE?");
  let token = getCookie(c, "ssid");
  //console.log(token);
  if (token !== undefined) {
    let res = await loginWithCookie(token);
    console.log(res);
    if (res.result) {
      return c.body(JSON.stringify(res), { status: 200 });
    } else return c.body(JSON.stringify(res.description), { status: 500 });
  } else
    return c.body(JSON.stringify("Token non presente nelle sessioni"), {
      status: 500,
    });
});

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
        return c.body(JSON.stringify(data));
      }
      const token: string | null = data["session"];
      if (token !== null) {
        setCookie(c, "ssid", token, {
          secure: true,
          path: "/",
          expires: new Date(Date.now() * 1000 * 60 * 60 * 24 * 7),
          sameSite: "None",
          partitioned: true,
        });
        c.status(200);
        return c.body(JSON.stringify(data), {
          headers: { "X-Content-Type-Options": "nosniff" },
        });
      }
    } catch (error) {
      console.log(error);
      return c.body(JSON.stringify(error), {
        headers: { "X-Content-Type-Options": "nosniff" },
        status: 500,
      });
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
    })
  ),
  async (c) => {
    const data = await c.req.json<{
      email: string;
      password: string;
      nome: string;
      cognome: string;
      isMale: boolean;
    }>();
    const { email, nome, cognome, password, isMale } = data;
    console.log(email, nome);
    let gender = "";
    if (isMale == true) gender = "Male";
    else gender = "Female";
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

/*
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
  let user = await insertUser({ mail, password, nome, cognome, gender });
    if (user == null) return c.body("Mail già presente", { status: 500 });
  return c.body(null, { status: 200 });
});
*/

app.post(
  "/reset-password",
  zValidator("json", z.object({ email: z.string().email() })),
  async (c) => {
    const { email } = await c.req.json<{ email: string }>();
    const token = await createPasswordResetToken(email);
    //LINK AL FRONTEND
    const link = "http://localhost:5173/" + token;
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
      return c.body("Token non valido", { status: 404 });
    password = await getHash(password);
    await updateUser(passwordResetSession["users"].mail, { password });
    await deleteResetSessions(passwordResetSession["users"].id);
    await deleteExpiredResetSessions();
    return c.body(token, { status: 200 });
  }
);

app.get("/servizi", async (c) => {
  try {
    let services = await selectAllServices();
    return c.body(JSON.stringify(services), { status: 200 });
  } catch (error) {
    return c.body(JSON.stringify(error));
  }
});

app.get("/ultimarecensione", async (c) => {
  try {
    console.log("route presa");
    let review = await selectLastRecensione();
    console.log(review);
    if (review) return c.body(JSON.stringify(review), { status: 200 });
    else return c.body(JSON.stringify("Nessuna recensione"), { status: 200 });
  } catch (error) {
    return c.body(JSON.stringify(error));
  }
});

app.get("/staff", async (c) => {
  try {
    let staff = await selectAllStaffMembers();
    return c.body(JSON.stringify(staff), { status: 200 });
  } catch (error) {
    return c.body(JSON.stringify(error), { status: 500 });
  }
});
app.route("/admin", admin);
app.route("/user", user);

serve({ port: 3000, fetch: app.fetch });
