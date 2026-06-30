const nodemailer = require('nodemailer');

const sendCredentialsEmail = async (email, name, password, role) => {
  // If not configured, immediately log to console and return
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`⚠️ SMTP credentials not set in environment variables. Falling back to console log:
=========================================
Credentials for ${name} (${role}):
Email: ${email}
Password: ${password}
=========================================`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"QBMS Portal" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to QBMS - Your Login Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4f46e5; margin-bottom: 20px;">Welcome to QBMS, ${name}!</h2>
        <p>Your account has been successfully registered in the **Question Bank Management System (QBMS)** as a <strong>${role.toUpperCase()}</strong>.</p>
        <p>Please find your temporary login credentials below:</p>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #374151; width: 120px;">Username/Email:</td>
              <td style="padding: 6px 0; color: #4b5563;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #374151;">Password:</td>
              <td style="padding: 6px 0; font-family: monospace; font-size: 16px; font-weight: bold; color: #4f46e5;">${password}</td>
            </tr>
          </table>
        </div>
        <p style="color: #ef4444; font-size: 13px; font-weight: 600;">Important: Please make sure to change your password under your profile settings after logging in for security purposes.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">This is an automated email. Please do not reply directly to this message.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Credentials email sent successfully to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send email via SMTP:', error.message);
    console.log(`🔑 Falling back to console logging:
=========================================
Credentials for ${name} (${role}):
Email: ${email}
Password: ${password}
=========================================`);
  }
};

module.exports = { sendCredentialsEmail };
