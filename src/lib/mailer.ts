import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;
const smtpFrom = process.env.SMTP_FROM || smtpUser;

const transporter =
  smtpHost && smtpUser && smtpPassword
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPassword },
      })
    : null;

export async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
  if (!transporter) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] Email yuborilmadi (SMTP sozlanmagan). Qabul qiluvchi: ${to}, mavzu: ${subject}`);
      return true;
    }
    console.error("SMTP sozlanmagan: email yuborib bo'lmadi");
    return false;
  }

  try {
    await transporter.sendMail({ from: smtpFrom, to, subject, html });
    return true;
  } catch (e) {
    console.error("Email yuborishda xatolik:", e);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
  return sendMail(
    email,
    "Reja — parolni tiklash",
    `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #6366F1;">Parolni tiklash</h2>
        <p>Hisobingiz uchun parolni tiklash so'ralgan. Quyidagi tugma orqali yangi parol o'rnating:</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #6366F1; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Parolni tiklash
          </a>
        </p>
        <p style="color: #6B7280; font-size: 13px;">Link 1 soat davomida amal qiladi. Agar bu so'rovni siz yubormagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.</p>
      </div>
    `
  );
}
