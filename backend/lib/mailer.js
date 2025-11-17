const nodemailer = require('nodemailer');

let transporter = null;

const initializeMailer = () => {
  if (transporter) return transporter;

  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpEmail || !smtpPass) {
    throw new Error('SMTP_EMAIL and SMTP_PASS environment variables are required');
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpEmail,
      pass: smtpPass,
    },
  });

  return transporter;
};

const sendOTPEmail = async (email, otp) => {
  try {
    const mailer = initializeMailer();

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Email Verification - Forward Africa',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              padding: 20px;
            }
            .container {
              max-width: 500px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              display: inline-block;
              width: 60px;
              height: 60px;
              background: linear-gradient(to right, #dc2626, #ef4444);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 24px;
              margin-bottom: 15px;
            }
            h1 {
              color: #1f2937;
              font-size: 24px;
              margin: 0;
            }
            p {
              color: #6b7280;
              line-height: 1.6;
              margin: 15px 0;
            }
            .otp-box {
              background-color: #f9fafb;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 25px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #dc2626;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .expiry {
              color: #ef4444;
              font-size: 14px;
              margin-top: 15px;
              font-weight: bold;
            }
            .footer {
              color: #9ca3af;
              font-size: 12px;
              text-align: center;
              margin-top: 30px;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">FA</div>
              <h1>Email Verification</h1>
            </div>
            
            <p>Welcome to Forward Africa!</p>
            <p>We're excited to have you join our learning community. To complete your registration, please verify your email address using the code below:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <div class="expiry">This code expires in 10 minutes</div>
            </div>
            
            <p>If you didn't request this verification code, you can safely ignore this email.</p>
            
            <p>Best regards,<br>Forward Africa Team</p>
            
            <div class="footer">
              <p>Forward Africa © 2024. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await mailer.sendMail(mailOptions);
    console.log('OTP email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

module.exports = {
  initializeMailer,
  sendOTPEmail,
};
