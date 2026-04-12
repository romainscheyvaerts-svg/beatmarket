// ============================================================================
// 📧 BeatMarket — Service d'envoi d'emails (Resend)
// ============================================================================

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@beatmarket.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Envoie un email de réinitialisation de mot de passe
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: `BeatMarket <${FROM_EMAIL}>`,
      to: email,
      subject: 'Réinitialiser votre mot de passe — BeatMarket',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
            <!-- Logo -->
            <div style="text-align:center;margin-bottom:32px;">
              <h1 style="color:#a78bfa;font-size:24px;font-weight:bold;margin:0;">🎵 BeatMarket</h1>
            </div>
            
            <!-- Card -->
            <div style="background-color:#111;border:1px solid #333;border-radius:16px;padding:32px;">
              <h2 style="color:#fff;font-size:20px;margin:0 0 16px 0;">
                Réinitialiser votre mot de passe
              </h2>
              <p style="color:#999;font-size:14px;line-height:1.6;margin:0 0 24px 0;">
                Vous avez demandé la réinitialisation de votre mot de passe sur BeatMarket. 
                Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
              </p>
              
              <!-- Button -->
              <div style="text-align:center;margin:32px 0;">
                <a href="${resetUrl}" 
                   style="display:inline-block;background-color:#7c3aed;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:600;">
                  Réinitialiser mon mot de passe
                </a>
              </div>
              
              <p style="color:#666;font-size:12px;line-height:1.5;margin:0 0 8px 0;">
                Ce lien expire dans <strong style="color:#999;">1 heure</strong>.
              </p>
              <p style="color:#666;font-size:12px;line-height:1.5;margin:0 0 16px 0;">
                Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.
              </p>
              
              <!-- Fallback URL -->
              <div style="border-top:1px solid #333;padding-top:16px;margin-top:16px;">
                <p style="color:#666;font-size:11px;line-height:1.5;margin:0;word-break:break-all;">
                  Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
                  <a href="${resetUrl}" style="color:#a78bfa;">${resetUrl}</a>
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align:center;margin-top:24px;">
              <p style="color:#555;font-size:11px;margin:0;">
                © ${new Date().getFullYear()} BeatMarket — Marketplace de beats européenne
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}