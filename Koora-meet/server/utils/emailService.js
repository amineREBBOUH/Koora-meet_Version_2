const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.BASE_URL || 'http://localhost:5175'}/verify/${token}`;
  
  const mailOptions = {
    from: `"Koora Meet" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Activez votre compte Koora Meet 🦁',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #ef4444; text-align: center;">Bienvenue chez Koora Meet !</h2>
        <p>Merci de vous être inscrit. Pour activer votre compte et rejoindre la communauté des fans de 2030, cliquez sur le bouton ci-dessous :</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Activer mon compte</a>
        </div>
        <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
        <p style="color: #64748b; font-size: 12px;">${url}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="text-align: center; color: #94a3b8; font-size: 12px;">© 2026 Koora Meet - World Cup 2030 Fan Platform</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

const sendResetPasswordEmail = async (email, token) => {
  const url = `${process.env.BASE_URL || 'http://localhost:5175'}/reset-password/${token}`;
  
  const mailOptions = {
    from: `"Koora Meet" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Réinitialisation de votre mot de passe 🔑',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #ef4444; text-align: center;">Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Réinitialiser mon mot de passe</a>
        </div>
        <p>Ce lien expirera dans 1 heure.</p>
        <p>Si vous n'avez pas demandé ce changement, ignorez cet e-mail.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="text-align: center; color: #94a3b8; font-size: 12px;">© 2026 Koora Meet - World Cup 2030 Fan Platform</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail
};
