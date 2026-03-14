const nodemailer = require("nodemailer");

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (
    !user ||
    !pass ||
    pass === "your-16-digit-gmail-app-password"
  ) {
    throw new Error("SMTP email settings are missing");
  }

  if (host) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
};

const sendResetEmail = async ({ to, name, resetLink }) => {
  const transporter = createTransporter();
  const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from: fromEmail,
    to,
    subject: "Reset your Jai Jalaram Packaging password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>Password Reset Request</h2>
        <p>Hello ${name || "User"},</p>
        <p>We received a request to reset your password.</p>
        <p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 18px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
};

module.exports = sendResetEmail;
