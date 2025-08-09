import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"TaskPilot" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: "Verify your email for TaskPilot",
    html: `
      <p>Hi,</p>
      <p>Thanks for signing up for TaskPilot! Please verify your email by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify my email</a></p>
      <p>This link will expire in 30 minutes.</p>
      <p>If you did not sign up, please ignore this email.</p>
      <p>Thanks,<br/>TaskPilot Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendVerificationSuccessEmail(email: string) {
  const mailOptions = {
    from: `"TaskPilot" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: "Your TaskPilot email has been verified!",
    html: `
      <p>Hi,</p>
      <p>Congratulations! Your email address has been successfully verified.</p>
      <p>You can now log in and start using TaskPilot.</p>
      <p>Thanks for joining us!<br/>TaskPilot Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Sent verification success email to ${email}`);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"TaskPilot" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: "Reset your TaskPilot password",
    html: `
      <p>Hi,</p>
      <p>You requested to reset your TaskPilot password. Click the link below to set a new password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Thanks,<br/>TaskPilot Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
