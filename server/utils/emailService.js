const { Resend } = require("resend");
const { getResendApiKey, getEmailFrom } = require("../config/env");

const getResendClient = () => new Resend(getResendApiKey());

const passwordResetTemplate = (resetUrl) => `
  <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
    <h2 style="margin-bottom:16px">Resetiranje lozinke</h2>
    <p>Primili smo zahtjev za resetiranje vaše lozinke na platformi <strong>Atletikum</strong>.</p>
    <p style="margin:24px 0">
      <a href="${resetUrl}"
         style="background:#228be6;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600">
        Resetiraj lozinku
      </a>
    </p>
    <p>Ili kopirajte sljedeću poveznicu u preglednik:</p>
    <p style="word-break:break-all;color:#555">${resetUrl}</p>
    <p>Poveznica vrijedi <strong>15 minuta</strong>.</p>
    <p style="color:#888;font-size:13px;margin-top:24px">
      Ako niste vi zatražili ovu akciju, možete ignorirati ovaj e-mail.
    </p>
  </div>
`;

const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  const resend = getResendClient();

  await resend.emails.send({
    from: getEmailFrom(),
    to: toEmail,
    subject: "Resetiranje lozinke — Atletikum",
    html: passwordResetTemplate(resetUrl),
    text: `Kliknite na sljedeću poveznicu za resetiranje lozinke: ${resetUrl}\n\nPoveznica vrijedi 15 minuta.\n\nAko niste vi zatražili ovu akciju, možete ignorirati ovaj e-mail.`,
  });
};

module.exports = { sendPasswordResetEmail };
