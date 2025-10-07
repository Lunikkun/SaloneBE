import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0
import { Prenotazione } from "./db/prenotazioni/schema";
import { User } from "./db/users/schema";
import { Service } from "./db/saloonServices/schema";

async function sendBookingReminder(user:User, selectedService : Service, dataPrenotazione: Date) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY!, //deve essere per forza presente l'API nell env
    // When you have an EU-domain, you must specify the endpoint:
    // url: "https://api.eu.mailgun.net"
  });
  try {
    const data = await mg.messages.create("sandbox9a42a9a6f38b4fdd8e2dbdc09b5306c5.mailgun.org", {
      from: "Mailgun Sandbox <postmaster@sandbox9a42a9a6f38b4fdd8e2dbdc09b5306c5.mailgun.org>",
      to: [user.mail],
      subject: "Conferma prenotazione effettuata",
      text: "Servizio: "+selectedService.nome+" prenotato in data: "+dataPrenotazione
    });

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}

export { sendBookingReminder }  