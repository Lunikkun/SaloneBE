import { insertService } from "./db/saloonServices/handler.js";
import { insertStaffMemberData } from "./db/staff/handler.js";
import { insertUser } from './db/users/handler.js';

 (async()=>{
    await insertUser({mail:"test@test.com", password:"inchiaro", nome:"test", cognome:"test"});
    await insertUser({mail:"halfsize0710@gmail.com", password:"inchiaro", nome:"test", cognome:"test"});
    await insertStaffMemberData({nome: "Carmelinda"});
    await insertStaffMemberData({nome: "Marco"});
    await insertService({durata:60,nome:"Taglio Corto", prezzo:"20.00", descrizione:"taglio di capelli corto"});
    await insertService({durata:30,nome:"Taglio Lungo", prezzo:"35.00", descrizione:"taglio di capelli lungo"});
    await insertService({durata:15,nome:"Barba + Taglio Corto", prezzo:"25.00", descrizione:"taglio di capelli con taglio barba"});    
    await insertService({durata:45,nome:"Solo Barba", prezzo:"10.00", descrizione:"rifinitura barba"});

})();
