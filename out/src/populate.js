var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { insertService } from "./db/saloonServices/handler.js";
import { insertUser } from './db/users/handler.js';
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield insertUser({ mail: "test@test.com", password: "inchiaro", nome: "test", cognome: "test" });
    yield insertUser({ mail: "root@root.com", password: "chiarissima", nome: "root", cognome: "root" });
    yield insertUser({ mail: "blu@cielo.com", password: "limpida", nome: "blu", cognome: "blu" });
    yield insertUser({ mail: "ildemone@slayer.com", password: "strabismo", nome: "slayer", cognome: "demon" });
    yield insertService({ code: "TC", nome: "Taglio Corto", prezzo: "20.00", descrizione: "taglio di capelli corto" });
    yield insertService({ code: "TL", nome: "Taglio Lungo", prezzo: "35.00", descrizione: "taglio di capelli lungo" });
    yield insertService({ code: "BT", nome: "Barba + Taglio Corto", prezzo: "25.00", descrizione: "taglio di capelli con taglio barba" });
    yield insertService({ code: "SB", nome: "Solo Barba", prezzo: "10.00", descrizione: "rifinitura barba" });
    //let res = await selectService(0);
}))();
