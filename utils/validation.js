export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validateMobileNumber = (phone) => {
  if (!phone || !phone.trim()) {
    return 'Mobile number is required';
  }
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) {
    return 'Please enter a valid 10-digit mobile number';
  }
  return null;
};

export const validatePassword = (password, minLength = 8) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long`;
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain an uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain a lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain a number';
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain a special character';
  }
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

export const validateOTP = (otp) => {
  if (!otp || otp.length !== 4) {
    return 'Please enter the complete 4-digit code';
  }
  if (!/^\d{4}$/.test(otp)) {
    return 'OTP must contain numbers only';
  }
  return null;
};

// Mock Auth constants
export const MOCK_AUTH = {
  email: 'admin@technokrate.com',
  password: 'Admin@123',
  otp: '9999',
};
