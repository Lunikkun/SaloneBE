import { Hono } from "Hono";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { getUserFromToken } from "./db/sessions/handler";
import { User } from "./db/users/schema";
import { zValidator } from "@hono/zod-validator";
import { insertUser } from "./db/users/handler";
import z from "zod"

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

    const adminUser = await getUserFromToken(auth_cookie);
    if (!adminUser || !adminUser.isAdmin) return c.body("Unauthorized, not Admin", { status: 401 });

    c.set("adminUser", adminUser);
    await next();
  })
);

admin.get("/", async c=>{
    console.log(c.get("adminUser"));
})

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
      let user = await insertUser({ mail: email, password, nome, cognome, isAdmin: true });
      if (user == null) return c.body("Mail già presente", { status: 500 });
      return c.body(null, { status: 200 });
    }
);

export default admin;
