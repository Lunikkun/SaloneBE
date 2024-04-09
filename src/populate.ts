import { InsertService } from "./db/saloonServices/schema.js";
import { insertService, selectService } from "./db/saloonServices/handler.js";
import { insertUser } from "./db/users/handler.js";

(async () => {
  await insertUser({
    mail: "test@test.com",
    password: "inchiaro",
    nome: "test",
    cognome: "test",
  });
  await insertUser({
    mail: "root@root.com",
    password: "chiarissima",
    nome: "root",
    cognome: "root",
  });
  await insertUser({
    mail: "blu@cielo.com",
    password: "limpida",
    nome: "blu",
    cognome: "blu",
  });
  await insertUser({
    mail: "ildemone@slayer.com",
    password: "strabismo",
    nome: "slayer",
    cognome: "demon",
  });

  await insertService({
    durata: 60,
    nome: "Taglio Corto",
    prezzo: "20.00",
    descrizione: "taglio di capelli corto",
  });
  await insertService({
    durata: 30,
    nome: "Taglio Lungo",
    prezzo: "35.00",
    descrizione: "taglio di capelli lungo",
  });
  await insertService({
    durata: 15,
    nome: "Barba + Taglio Corto",
    prezzo: "25.00",
    descrizione: "taglio di capelli con taglio barba",
  });
  await insertService({
    durata: 45,
    nome: "Solo Barba",
    prezzo: "10.00",
    descrizione: "rifinitura barba",
  });
  //let res = await selectService(0);
})();
