import type { NextApiRequest, NextApiResponse } from 'next';
import otpService from '../../../backend/lib/otpService';
import { validateEmail } from '../../../src/utils/validation';

interface VerifyOTPRequest {
  email: string;
  otp: string;
}

interface VerifyOTPResponse {
  message?: string;
  valid?: boolean;
  error?: string;
  attemptsRemaining?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyOTPResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, otp } = req.body as VerifyOTPRequest;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ error: emailValidation.message });
    }

    if (!otp || typeof otp !== 'string' || otp.length !== 6) {
      return res.status(400).json({ error: 'OTP must be a 6-digit code' });
    }

    const result = otpService.verifyOTP(email, otp);

    if (!result.valid) {
      const otpStatus = otpService.getOTPStatus(email);
      return res.status(400).json({
        valid: false,
        error: result.message,
        attemptsRemaining: otpStatus.exists ? otpStatus.attemptsRemaining : 0,
      });
    }

    return res.status(200).json({
      valid: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error in verify-otp endpoint:', error);
    return res.status(500).json({
      error: error.message || 'Failed to verify OTP',
    });
  }
}
