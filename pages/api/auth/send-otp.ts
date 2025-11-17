import type { NextApiRequest, NextApiResponse } from 'next';
import { sendOTPEmail } from '../../../backend/lib/mailer';
import otpService from '../../../backend/lib/otpService';
import { validateEmail } from '../../../src/utils/validation';

interface SendOTPRequest {
  email: string;
}

interface SendOTPResponse {
  message?: string;
  error?: string;
  timeRemainingSeconds?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SendOTPResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body as SendOTPRequest;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ error: emailValidation.message });
    }

    const otpStatus = otpService.getOTPStatus(email);
    if (otpStatus.exists && otpStatus.timeRemainingSeconds > 0) {
      return res.status(429).json({
        error: `Please wait ${otpStatus.timeRemainingSeconds} seconds before requesting a new OTP`,
        timeRemainingSeconds: otpStatus.timeRemainingSeconds,
      });
    }

    const otp = otpService.sendOTP(email);

    await sendOTPEmail(email, otp);

    return res.status(200).json({
      message: 'OTP sent successfully to your email',
    });
  } catch (error: any) {
    console.error('Error in send-otp endpoint:', error);

    if (error.message && error.message.includes('SMTP')) {
      return res.status(500).json({
        error: 'Email service is currently unavailable. Please try again later.',
      });
    }

    return res.status(500).json({
      error: error.message || 'Failed to send OTP',
    });
  }
}
