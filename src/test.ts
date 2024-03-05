import { InsertService } from './db/saloonServices/schema.js';
import { insertService, selectService } from "./db/saloonServices/handler.js";

 (async()=>{
    await insertService({nome:"Taglio Corto", prezzo:"20.00", descrizione:"taglio di capelli corto"});
    await insertService({nome:"Taglio Lungo", prezzo:"35.00", descrizione:"taglio di capelli lungo"});
    await insertService({nome:"Barba + Taglio Corto", prezzo:"25.00", descrizione:"taglio di capelli con taglio barba"});    
    await insertService({nome:"Solo Barba", prezzo:"10.00", descrizione:"rifinitura barba"});

    //let res = await selectService(0);
})();