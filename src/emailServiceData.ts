import nodemailer  from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: "smtp.outlook.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.MAIL_MAIL,
      pass: process.env.MAIL_PW,
    },
  });

export const emailOptions = {from: "securepassassist@outlook.com"}