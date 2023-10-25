const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");

const sendEmail = asyncHandler(async (data, req, res) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  let info = await transporter.sendMail({
    from: "mateo.fortu@gmail.com",
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.htm
  })
});

module.exports = {
  sendEmail,
};
