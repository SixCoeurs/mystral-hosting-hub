import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP
let transporter = null;

function initTransporter() {
  if (transporter) return transporter;

  // Check if SMTP host is configured
  if (!process.env.SMTP_HOST) {
    console.warn('SMTP_HOST not configured - email features disabled');
    return null;
  }

  // Build transport config
  const transportConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 25,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  };

  // Add auth only if credentials are provided (not needed for local Postfix)
  if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    transportConfig.auth = {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    };
  }

  // For localhost, disable TLS verification
  if (process.env.SMTP_HOST === 'localhost' || process.env.SMTP_HOST === '127.0.0.1') {
    transportConfig.tls = {
      rejectUnauthorized: false,
    };
  }

  transporter = nodemailer.createTransport(transportConfig);

  // Verify connection
  transporter.verify((error, success) => {
    if (error) {
      console.error('SMTP connection error:', error);
    } else {
      console.log('SMTP server ready for messages (DKIM handled by OpenDKIM milter)');
    }
  });

  return transporter;
}

// Initialize on module load
initTransporter();

// Company info for emails
const COMPANY = {
  name: 'Mystral Hosting',
  email: process.env.SMTP_FROM || 'noreply@mystral.ch',
  website: process.env.APP_URL || 'https://mystral.ch',
  logo: process.env.APP_URL ? `${process.env.APP_URL}/logo.png` : 'https://mystral.ch/logo.png',
};

// Base email template
function baseTemplate(content, title = '') {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || COMPANY.name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      text-decoration: none;
      padding: 14px 30px;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      opacity: 0.9;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
      border-radius: 0 4px 4px 0;
    }
    .highlight {
      color: #667eea;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    table th, table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    table th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    .amount {
      font-size: 24px;
      font-weight: 700;
      color: #667eea;
    }
  </style>
</head>
<body>
  <div style="padding: 20px;">
    <div class="container">
      <div class="header">
        <h1>${COMPANY.name}</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${COMPANY.name}. Tous droits reserves.</p>
        <p><a href="${COMPANY.website}">${COMPANY.website}</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

// Send email helper
async function sendEmail(to, subject, html, text = null) {
  const transport = initTransporter();

  if (!transport) {
    console.warn('Email not sent (SMTP not configured):', subject, 'to:', to);
    return { success: false, error: 'SMTP not configured' };
  }

  try {
    const info = await transport.sendMail({
      from: `"${COMPANY.name}" <${COMPANY.email}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    console.log('Email sent:', info.messageId, 'to:', to);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

// Email: Verification email
export async function sendVerificationEmail(user, verificationToken) {
  const verificationUrl = `${COMPANY.website}/verify-email?token=${verificationToken}`;

  const content = `
    <h2>Bienvenue ${user.first_name} !</h2>
    <p>Merci de vous etre inscrit sur ${COMPANY.name}.</p>
    <p>Pour activer votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>

    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">Verifier mon email</a>
    </div>

    <div class="info-box">
      <p><strong>Ce lien expire dans 24 heures.</strong></p>
      <p>Si vous n'avez pas cree de compte, vous pouvez ignorer cet email.</p>
    </div>

    <p>Ou copiez ce lien dans votre navigateur :</p>
    <p style="word-break: break-all; font-size: 12px; color: #666;">${verificationUrl}</p>
  `;

  return sendEmail(
    user.email,
    `Confirmez votre email - ${COMPANY.name}`,
    baseTemplate(content, 'Verification Email')
  );
}

// Email: Welcome email (after verification)
export async function sendWelcomeEmail(user) {
  const content = `
    <h2>Bienvenue sur ${COMPANY.name}, ${user.first_name} !</h2>
    <p>Votre compte a ete active avec succes. Vous pouvez maintenant profiter de tous nos services d'hebergement.</p>

    <div class="info-box">
      <h3>Prochaines etapes :</h3>
      <ul>
        <li>Decouvrez nos offres d'hebergement</li>
        <li>Configurez votre premier serveur</li>
        <li>Contactez notre support si besoin</li>
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="${COMPANY.website}/dashboard" class="button">Acceder a mon espace</a>
    </div>

    <p>Si vous avez des questions, notre equipe est disponible 24h/24.</p>
  `;

  return sendEmail(
    user.email,
    `Bienvenue sur ${COMPANY.name} !`,
    baseTemplate(content, 'Bienvenue')
  );
}

// Email: Password reset
export async function sendPasswordResetEmail(user, resetToken) {
  const resetUrl = `${COMPANY.website}/reset-password?token=${resetToken}`;

  const content = `
    <h2>Reinitialisation de mot de passe</h2>
    <p>Bonjour ${user.first_name},</p>
    <p>Vous avez demande la reinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>

    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">Reinitialiser mon mot de passe</a>
    </div>

    <div class="info-box">
      <p><strong>Ce lien expire dans 1 heure.</strong></p>
      <p>Si vous n'avez pas demande cette reinitialisation, vous pouvez ignorer cet email. Votre mot de passe restera inchange.</p>
    </div>

    <p>Ou copiez ce lien dans votre navigateur :</p>
    <p style="word-break: break-all; font-size: 12px; color: #666;">${resetUrl}</p>
  `;

  return sendEmail(
    user.email,
    `Reinitialisation de mot de passe - ${COMPANY.name}`,
    baseTemplate(content, 'Reset Password')
  );
}

// Email: Purchase confirmation
export async function sendPurchaseConfirmationEmail(user, order) {
  const content = `
    <h2>Confirmation de commande</h2>
    <p>Bonjour ${user.first_name},</p>
    <p>Merci pour votre achat ! Votre paiement a ete confirme avec succes.</p>

    <table>
      <tr>
        <th>Description</th>
        <th style="text-align: right;">Montant</th>
      </tr>
      <tr>
        <td>${order.description || 'Service Mystral'}</td>
        <td style="text-align: right;">${order.amount.toFixed(2)} EUR</td>
      </tr>
      ${order.discount ? `
      <tr>
        <td>Reduction (${order.billingCycle})</td>
        <td style="text-align: right;">-${order.discount.toFixed(2)} EUR</td>
      </tr>
      ` : ''}
      <tr>
        <th>Total</th>
        <th style="text-align: right;" class="amount">${order.total.toFixed(2)} EUR</th>
      </tr>
    </table>

    <div class="info-box">
      <p><strong>Numero de facture :</strong> ${order.invoiceNumber}</p>
      <p><strong>Cycle de facturation :</strong> ${order.billingLabel}</p>
      <p><strong>Prochaine echeance :</strong> ${order.nextDueDate}</p>
    </div>

    <div style="text-align: center;">
      <a href="${COMPANY.website}/account?tab=billing" class="button">Voir mes factures</a>
    </div>

    <p>Votre service sera active sous peu. Vous recevrez une notification des qu'il sera pret.</p>
  `;

  return sendEmail(
    user.email,
    `Confirmation de paiement - ${COMPANY.name}`,
    baseTemplate(content, 'Payment Confirmation')
  );
}

// Email: Service activated
export async function sendServiceActivatedEmail(user, service) {
  const content = `
    <h2>Votre service est actif !</h2>
    <p>Bonjour ${user.first_name},</p>
    <p>Excellente nouvelle ! Votre service a ete active et est maintenant pret a l'utilisation.</p>

    <div class="info-box">
      <h3>Details du service :</h3>
      <p><strong>Service :</strong> ${service.name || 'Serveur Mystral'}</p>
      ${service.ip ? `<p><strong>Adresse IP :</strong> ${service.ip}</p>` : ''}
      ${service.hostname ? `<p><strong>Hostname :</strong> ${service.hostname}</p>` : ''}
    </div>

    <div style="text-align: center;">
      <a href="${COMPANY.website}/dashboard" class="button">Gerer mon service</a>
    </div>

    <p>Besoin d'aide pour commencer ? Notre documentation et notre support sont la pour vous.</p>
  `;

  return sendEmail(
    user.email,
    `Votre service est actif - ${COMPANY.name}`,
    baseTemplate(content, 'Service Activated')
  );
}

// Email: Invoice reminder
export async function sendInvoiceReminderEmail(user, invoice) {
  const content = `
    <h2>Rappel de facture</h2>
    <p>Bonjour ${user.first_name},</p>
    <p>Nous vous rappelons que votre facture <strong>${invoice.invoiceNumber}</strong> arrive a echeance.</p>

    <div class="info-box">
      <p><strong>Montant :</strong> <span class="amount">${invoice.total.toFixed(2)} EUR</span></p>
      <p><strong>Date d'echeance :</strong> ${invoice.dueDate}</p>
    </div>

    <div style="text-align: center;">
      <a href="${COMPANY.website}/account?tab=billing" class="button">Payer maintenant</a>
    </div>

    <p>Si vous avez deja effectue le paiement, veuillez ignorer ce message.</p>
  `;

  return sendEmail(
    user.email,
    `Rappel: Facture ${invoice.invoiceNumber} - ${COMPANY.name}`,
    baseTemplate(content, 'Invoice Reminder')
  );
}

// Email: Password changed notification
export async function sendPasswordChangedEmail(user) {
  const content = `
    <h2>Mot de passe modifie</h2>
    <p>Bonjour ${user.first_name},</p>
    <p>Votre mot de passe a ete modifie avec succes.</p>

    <div class="info-box">
      <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
      <p>Si vous n'etes pas a l'origine de cette modification, contactez immediatement notre support.</p>
    </div>

    <div style="text-align: center;">
      <a href="${COMPANY.website}/contact" class="button">Contacter le support</a>
    </div>
  `;

  return sendEmail(
    user.email,
    `Mot de passe modifie - ${COMPANY.name}`,
    baseTemplate(content, 'Password Changed')
  );
}

// Email: Login from new device/location
export async function sendNewLoginAlertEmail(user, loginInfo) {
  const content = `
    <h2>Nouvelle connexion detectee</h2>
    <p>Bonjour ${user.first_name},</p>
    <p>Une nouvelle connexion a ete detectee sur votre compte.</p>

    <div class="info-box">
      <p><strong>Date :</strong> ${loginInfo.date || new Date().toLocaleString('fr-FR')}</p>
      <p><strong>Adresse IP :</strong> ${loginInfo.ip || 'Inconnue'}</p>
      <p><strong>Appareil :</strong> ${loginInfo.device || 'Inconnu'}</p>
      ${loginInfo.location ? `<p><strong>Localisation :</strong> ${loginInfo.location}</p>` : ''}
    </div>

    <p>Si c'etait vous, vous pouvez ignorer ce message.</p>
    <p>Si vous ne reconnaissez pas cette activite, nous vous recommandons de changer votre mot de passe immediatement.</p>

    <div style="text-align: center;">
      <a href="${COMPANY.website}/account?tab=security" class="button">Verifier la securite</a>
    </div>
  `;

  return sendEmail(
    user.email,
    `Nouvelle connexion - ${COMPANY.name}`,
    baseTemplate(content, 'New Login Alert')
  );
}

// Test email function
export async function sendTestEmail(to) {
  const content = `
    <h2>Email de test</h2>
    <p>Cet email confirme que votre configuration SMTP fonctionne correctement.</p>

    <div class="info-box">
      <p><strong>Serveur SMTP :</strong> ${process.env.SMTP_HOST}</p>
      <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
    </div>

    <p>Votre serveur email est pret a envoyer des notifications !</p>
  `;

  return sendEmail(
    to,
    `Test email - ${COMPANY.name}`,
    baseTemplate(content, 'Test Email')
  );
}

export default {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPurchaseConfirmationEmail,
  sendServiceActivatedEmail,
  sendInvoiceReminderEmail,
  sendPasswordChangedEmail,
  sendNewLoginAlertEmail,
  sendTestEmail,
};
