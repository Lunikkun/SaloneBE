import { eq } from "drizzle-orm";
import { db } from "../../dbConnection";
import { generateToken } from "../sessions/handler";
import { InsertPasswordReset, password_reset } from "./schema";
import { emailOptions, transporter } from "../../emailServiceData";
import { selectUser } from "../users/handler";
export async function createPasswordResetToken(email:string) {
    const token = generateToken();
    const user = await selectUser(email);
    if(user === undefined) return new Error("Email non esistente")
    await db.delete(password_reset).where(eq(password_reset.user_id, user.id));
    insertPasswordReset({user_id : user.id, token, expires_at : new Date(Date.now()+1000*60*60)});
    return token;
}


export async function insertPasswordReset(password_reset_data : InsertPasswordReset) {
    await db.insert(password_reset).values(password_reset_data);
}

export async function sendResetEmail(email : string, link : string) {
    await transporter.sendMail({from: emailOptions.from, to : email, subject: "PASSWORD RESET", html : "Clicca qui per reimpostare la password: <br> <a href="+link+">"+link+"</a>"})
}