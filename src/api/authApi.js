import client from './client';
import { saveToken, saveUser, clearAuth } from '../storage/authStorage';

/**
 * Normalize phone number to E.164 format (+91...)
 */
const normalizePhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/[\s-+]/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('91')) return cleaned.slice(2);
  return cleaned;
};

/**
 * 1. Register Jobseeker (Send Signup OTP)
 * Live endpoint: POST /auth/jobseeker/signup/send-otp
 * Body: { fullName, mobileNumber, email, password }
 */
export const registerJobseeker = async ({ fullName, mobileNumber, email, password }) => {
  const formattedMobile = normalizePhone(mobileNumber);
  const payload = {
    fullName: fullName?.trim(),
    mobileNumber: formattedMobile,
    email: email?.trim()?.toLowerCase(),
    password,
  };

  try {
    // Primary endpoint from PDF Page 9: POST /api/auth/jobseeker/signup/send-otp
    const response = await client.post('/auth/jobseeker/signup/send-otp', payload);
    return response.data;
  } catch (err) {
    // Fallback if legacy register route is active
    if (err.response?.status === 404) {
      const response = await client.post('/auth/jobseeker/register', payload);
      if (response.data?.token) {
        await saveToken(response.data.token);
      }
      if (response.data) {
        await saveUser(response.data);
      }
      return response.data;
    }
    throw err;
  }
};

/**
 * 2. Verify Signup OTP & Complete Account Creation
 * Live endpoint: POST /auth/jobseeker/signup/verify-otp
 * Body: { mobileNumber, otp }
 */
export const verifySignupOtp = async ({ mobileNumber, otp }) => {
  const formattedMobile = normalizePhone(mobileNumber);
  const payload = {
    mobileNumber: formattedMobile,
    otp: String(otp)?.trim(),
  };

  const response = await client.post('/auth/jobseeker/signup/verify-otp', payload);

  if (response.data?.token) {
    await saveToken(response.data.token);
  }
  if (response.data) {
    const u = response.data.user || response.data;
    const parts = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    const resolvedName = u.fullName || (parts.length > 0 ? parts : undefined);
    const userData = {
      _id: u._id,
      fullName: resolvedName || u.fullName,
      email: u.email,
      mobileNumber: u.mobileNumber,
      role: u.role || 'JOB_SEEKER',
      isVerified: true,
      profileCompleted: u.profileCompleted || false,
    };
    await saveUser(userData);
  }

  return response.data;
};

/**
 * 3. Login Jobseeker with Email & Password
 * Live endpoint: POST /auth/jobseeker/login
 * Body: { email, password }
 */
export const loginJobseeker = async ({ email, password }) => {
  const payload = {
    email: email?.trim()?.toLowerCase(),
    password,
  };

  const response = await client.post('/auth/jobseeker/login', payload);

  if (response.data?.token) {
    await saveToken(response.data.token);
  }
  if (response.data) {
    const u = response.data.user || response.data;
    const parts = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    const resolvedName = u.fullName || (parts.length > 0 ? parts : undefined);
    const userData = {
      _id: u._id,
      fullName: resolvedName || u.fullName,
      email: u.email,
      mobileNumber: u.mobileNumber,
      role: u.role || 'JOB_SEEKER',
      isVerified: u.isVerified,
      profileCompleted: u.profileCompleted,
    };
    await saveUser(userData);
  }

  return response.data;
};

/**
 * 4. Send Login OTP (Mobile Login)
 * Live endpoint: POST /auth/jobseeker/send-login-otp
 * Body: { mobileNumber }
 */
export const sendLoginOtp = async ({ mobileNumber }) => {
  const payload = {
    mobileNumber: normalizePhone(mobileNumber),
  };
  const response = await client.post('/auth/jobseeker/send-login-otp', payload);
  return response.data;
};

/**
 * 5. Verify Login OTP (Mobile Login)
 * Live endpoint: POST /auth/jobseeker/verify-otp
 * Body: { mobileNumber, otp }
 */
export const verifyLoginOtp = async ({ mobileNumber, otp }) => {
  const payload = {
    mobileNumber: normalizePhone(mobileNumber),
    otp: String(otp)?.trim(),
  };

  const response = await client.post('/auth/jobseeker/verify-otp', payload);

  if (response.data?.token) {
    await saveToken(response.data.token);
  }
  if (response.data) {
    const u = response.data.user || response.data;
    const parts = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    const resolvedName = u.fullName || (parts.length > 0 ? parts : undefined);
    const userData = {
      _id: u._id,
      fullName: resolvedName || u.fullName,
      email: u.email,
      mobileNumber: u.mobileNumber,
      role: u.role || 'JOB_SEEKER',
      isVerified: true,
      profileCompleted: u.profileCompleted || false,
    };
    await saveUser(userData);
  }

  return response.data;
};

/**
 * 6. Send Account Verification OTP
 * Live endpoint: POST /auth/jobseeker/send-verification-otp
 * Body: { email, method }
 */
export const sendVerificationOtp = async ({ email, method = 'email' }) => {
  const payload = {
    email: email?.trim()?.toLowerCase(),
    method: method || 'email',
  };

  const response = await client.post('/auth/jobseeker/send-verification-otp', payload);
  return response.data;
};

/**
 * 7. Verify Account OTP (Handles both signup mobile verification and email verification)
 */
export const verifyAccountOtp = async ({ email, mobileNumber, otp }) => {
  const cleanEmail = email?.trim()?.toLowerCase();
  const cleanOtp = String(otp)?.trim();

  // Try primary account verification endpoint (API 4 in PRD)
  if (cleanEmail) {
    try {
      const response = await client.post('/auth/jobseeker/verify-account', {
        email: cleanEmail,
        otp: cleanOtp,
      });
      if (response.data?.token) {
        await saveToken(response.data.token);
      }
      return response.data;
    } catch (e) {
      // If user is already verified or not found on /verify-account, fallback to mobile signup verify
      if (!mobileNumber) throw e;
    }
  }

  // Fallback to mobile signup OTP verification
  if (mobileNumber) {
    return await verifySignupOtp({ mobileNumber, otp: cleanOtp });
  }

  throw new Error('Email or mobile number is required to verify account');
};

/**
 * 8. Forgot Password — Send OTP
 * Live endpoint: POST /auth/jobseeker/forget-pass-sendotp
 * Body: { email }
 */
export const sendForgotPasswordOtp = async ({ email }) => {
  const payload = {
    email: email?.trim()?.toLowerCase(),
  };

  const response = await client.post('/auth/jobseeker/forget-pass-sendotp', payload);
  return response.data;
};

/**
 * 9. Forgot Password — Verify OTP
 * Live endpoint: POST /auth/jobseeker/verify-pass-otp
 * Body: { email, otp }
 */
export const verifyPasswordOtp = async ({ email, otp }) => {
  const payload = {
    email: email?.trim()?.toLowerCase(),
    otp: String(otp)?.trim(),
  };

  const response = await client.post('/auth/jobseeker/verify-pass-otp', payload);
  return response.data;
};

/**
 * 10. Reset Password
 * Live endpoint: PATCH /auth/jobseeker/resetpassword
 * Body: { email, newPassword }
 */
export const resetPassword = async ({ email, newPassword }) => {
  const payload = {
    email: email?.trim()?.toLowerCase(),
    newPassword,
  };

  const response = await client.patch('/auth/jobseeker/resetpassword', payload);
  return response.data;
};

/**
 * Logout
 */
export const logoutJobseeker = async () => {
  await clearAuth();
};

export default {
  registerJobseeker,
  verifySignupOtp,
  loginJobseeker,
  sendLoginOtp,
  verifyLoginOtp,
  sendVerificationOtp,
  verifyAccountOtp,
  sendForgotPasswordOtp,
  verifyPasswordOtp,
  resetPassword,
  logoutJobseeker,
};
