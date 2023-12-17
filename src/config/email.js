import nodemailer from 'nodemailer';
import config from './config.js';

const emailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: config.mail.user,
    pass: config.mail.pass
  },
  secure: false,
  tls: {
    rejectUnauthorized: false
  }
});

export default emailTransporter