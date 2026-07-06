import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

transport.verify()
  .then(() => console.log("SMTP connection successful"))
  .catch(console.error);

export async function sendEmail(
  to: string,
  body: string,
  subject?: string
) {
  const info = await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USERNAME,
    to,
    subject: subject || "Test",
    text: body,
  });

  console.log(info.messageId);
}