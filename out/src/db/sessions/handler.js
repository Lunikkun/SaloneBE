var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { db } from "../../dbConnection.js";
import { sessions } from "./schema.js";
import { eq } from "drizzle-orm";
export function generateToken() {
    //IPOTESI: AGGIUNGERE IL PARAMETO NUMERICO TIME_PASSED
    //USARLO PER RENDERE UNIVOCI I TOKEN DIVIDIVENDO %64 IN 64 CLASSI DI EQ.
    //POTREBBE NON FUNZIONARE PER CLASSI DI EQ UGUALI NONOSTANTE TEMPI DIVERSI
    const array = new Uint8Array(256);
    let token = "";
    const dict = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789?!";
    crypto.getRandomValues(array);
    array.forEach(elem => {
        let value = Math.floor(elem / 4);
        token += dict[value];
        console.log("value ", value, " Dict ", dict[value]);
    });
    console.log(token);
    return token;
}
export function isPresent(token) {
    return __awaiter(this, void 0, void 0, function* () {
        let value = yield db.select().from(sessions).where(eq(sessions.token, token));
        if (value) {
            return true;
        }
        else {
            console.log("[DEBUG] - RISULTATO RICERCA: ", value);
            return false;
        }
    });
}
export function createSession(users) {
    return __awaiter(this, void 0, void 0, function* () {
        let session = {};
        session.user_id = users.id;
        session.created_at = new Date();
        session.expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
        session.token = generateToken();
        if (!isPresent)
            yield db.insert(sessions).values(session);
        else
            console.log("Token già esistente");
    });
}
