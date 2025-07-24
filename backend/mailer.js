const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // не 465!
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: 'wjxc eolp btdj qsxu'
  },
  tls: {
    rejectUnauthorized: false 
  } 
});
module.exports = transporter;
