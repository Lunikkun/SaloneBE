var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { insertUser } from './db/users/handler.js';
import koa from "koa";
const app = new koa();
app.listen(3000, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Server avviato");
    let u = { nome: "aaa", cognome: "ccc", mail: "aa", password: "aa" };
    yield insertUser(u);
}));
