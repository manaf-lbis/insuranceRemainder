const { BrevoClient } = require('@getbrevo/brevo');

// Initialize the Brevo Client using v4 SDK syntax
const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY
});

const SENDER = {
  name: process.env.EMAIL_SENDER_NAME || 'NOTIFYCSC',
  email: process.env.EMAIL_USER || 'code.brocamp@gmail.com',
};

/**
 * Send OTP email for signup or forgot-password
 */
const sendOtpEmail = async (toEmail, toName, otp, type = 'signup') => {
  const isSignup = type === 'signup';
  const subject = isSignup
    ? 'Verify Your Email - NOTIFYCSC'
    : 'Password Reset OTP - NOTIFYCSC';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f9f9f9; border-radius: 12px; overflow:hidden;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 32px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">${isSignup ? '📧 Email Verification' : '🔑 Password Reset'}</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-weight: bold; letter-spacing: 1px;">NOTIFYCSC</p>
      </div>
      <div style="padding: 32px;">
        <p style="color: #333; font-size: 16px;">Hello <strong>${toName}</strong>,</p>
        <p style="color: #555;">${isSignup ? 'Welcome to NOTIFYCSC! Use the OTP below to verify your email:' : 'Use the OTP below to reset your password:'}</p>
        <div style="background: #fff; border: 2px dashed #1e3a8a; border-radius: 8px; text-align: center; padding: 24px; margin: 24px 0;">
          <p style="font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #1e3a8a; margin: 0;">${otp}</p>
        </div>
        <p style="color: #888; font-size: 13px;">⚠️ This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
      <div style="background: #f0f0f0; padding: 16px; text-align: center;">
        <p style="color: #aaa; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} NOTIFYCSC. All rights reserved.</p>
      </div>
    </div>`;

  return client.transactionalEmails.sendTransacEmail({
    to: [{ email: toEmail, name: toName }],
    sender: SENDER,
    subject: subject,
    htmlContent: htmlContent,
  });
};

/**
 * Send welcome email after first verified login
 */
const sendWelcomeEmail = async (toEmail, toName, role) => {
  const roleName = role === 'vle' ? 'VLE' : 'Akshaya';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f9f9f9; border-radius: 12px; overflow:hidden;">
      <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 32px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">🎉 Welcome to NOTIFYCSC!</h1>
      </div>
      <div style="padding: 32px;">
        <p style="color: #333; font-size: 16px;">Hello <strong>${toName}</strong>,</p>
        <p style="color: #555;">Great news! Your <strong>${roleName}</strong> account has been <strong>approved by the Admin</strong> and is now active.</p>
        <p style="color: #555;">You can now log in and access your dashboard to manage your documents and services.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/vle/login" 
             style="background: linear-gradient(135deg, #11998e, #38ef7d); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">
            Go to Dashboard →
          </a>
        </div>
      </div>
      <div style="background: #f0f0f0; padding: 16px; text-align: center;">
        <p style="color: #aaa; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} NOTIFYCSC. All rights reserved.</p>
      </div>
    </div>`;

  return client.transactionalEmails.sendTransacEmail({
    to: [{ email: toEmail, name: toName }],
    sender: SENDER,
    subject: `Welcome to NOTIFYCSC, ${toName}! 🎉`,
    htmlContent: htmlContent,
  });
};

/**
 * Send email when document is approved or rejected
 */
const sendDocumentStatusEmail = async (toEmail, toName, docTitle, status, reason = '') => {
  const isApproved = status === 'approved';
  const subject = isApproved
    ? `Verified: Your document "${docTitle}" is live! ✅`
    : `Update regarding your document contribution: "${docTitle}"`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f9f9f9; border-radius: 12px; overflow:hidden; border: 1px solid #eee;">
      <div style="background: ${isApproved ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : 'linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)'}; padding: 32px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">${isApproved ? '✅ Document Approved' : 'ℹ️ Document Update'}</h1>
      </div>
      <div style="padding: 32px;">
        <p style="color: #333; font-size: 16px;">Hello <strong>${toName}</strong>,</p>
        <p style="color: #555; line-height: 1.6;">
          ${isApproved
      ? `Great news! Your document <strong>"${docTitle}"</strong> has been reviewed and approved by our team. It is now available in the public Resource Library.`
      : `Our team has reviewed your recent contribution <strong>"${docTitle}"</strong>. Unfortunately, it could not be approved at this time.`}
        </p>
        
        ${!isApproved && reason ? `
        <div style="background: #fff0f0; border-left: 4px solid #ff4d4d; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 13px; color: #cc0000; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Rejection Reason:</p>
          <p style="margin: 8px 0 0; font-size: 15px; color: #444;">${reason}</p>
        </div>
        ` : ''}

        <p style="color: #777; font-size: 14px; margin-top: 24px;">
          ${isApproved
      ? 'Thank you for contributing to the community library! Your help makes our platform better.'
      : 'Please review the reason above and feel free to re-upload the document with the necessary corrections.'}
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/vle/contributions" 
             style="background: #2563eb; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
            View My Contributions
          </a>
        </div>
      </div>
      <div style="background: #f0f0f0; padding: 16px; text-align: center;">
        <p style="color: #aaa; font-size: 11px; margin: 0; letter-spacing: 0.5px; text-transform: uppercase;">Sent by ${SENDER.name} Admin Team</p>
      </div>
    </div>`;

  return client.transactionalEmails.sendTransacEmail({
    to: [{ email: toEmail, name: toName }],
    sender: SENDER,
    subject: subject,
    htmlContent: htmlContent,
  });
};

module.exports = { sendOtpEmail, sendWelcomeEmail, sendDocumentStatusEmail };

