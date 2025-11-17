const crypto = require('crypto');

class OTPService {
  constructor() {
    this.otpStore = new Map();
    this.OTP_LENGTH = 6;
    this.OTP_EXPIRY_TIME = 10 * 60 * 1000;
    this.MAX_ATTEMPTS = 5;
  }

  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  sendOTP(email) {
    const otp = this.generateOTP();
    const expiresAt = Date.now() + this.OTP_EXPIRY_TIME;

    this.otpStore.set(email, {
      otp,
      expiresAt,
      attempts: 0,
      sentAt: Date.now(),
    });

    console.log(`OTP for ${email}: ${otp} (expires at ${new Date(expiresAt).toISOString()})`);

    return otp;
  }

  verifyOTP(email, otp) {
    const record = this.otpStore.get(email);

    if (!record) {
      return {
        valid: false,
        message: 'No OTP found for this email. Please request a new one.',
      };
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(email);
      return {
        valid: false,
        message: 'OTP has expired. Please request a new one.',
      };
    }

    if (record.attempts >= this.MAX_ATTEMPTS) {
      this.otpStore.delete(email);
      return {
        valid: false,
        message: 'Maximum OTP attempts exceeded. Please request a new one.',
      };
    }

    record.attempts += 1;

    if (record.otp !== otp) {
      return {
        valid: false,
        message: `Incorrect OTP. You have ${this.MAX_ATTEMPTS - record.attempts} attempts remaining.`,
      };
    }

    this.otpStore.delete(email);
    return {
      valid: true,
      message: 'Email verified successfully.',
    };
  }

  getOTPStatus(email) {
    const record = this.otpStore.get(email);

    if (!record) {
      return {
        exists: false,
        message: 'No OTP request found for this email.',
      };
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(email);
      return {
        exists: false,
        message: 'OTP has expired.',
      };
    }

    const timeRemaining = Math.ceil((record.expiresAt - Date.now()) / 1000);

    return {
      exists: true,
      attemptsRemaining: this.MAX_ATTEMPTS - record.attempts,
      timeRemainingSeconds: timeRemaining,
    };
  }

  clearOTP(email) {
    this.otpStore.delete(email);
  }
}

module.exports = new OTPService();
