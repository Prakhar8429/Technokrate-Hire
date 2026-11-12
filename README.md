# Technokrate Job - Mobile & Web App

A modern, high-fidelity job recruitment platform built with **React Native (0.86.3)** and **Expo Router (57.0.21)**.

---

## 📁 Complete Folder Structure

```text
Technokrate Job/
├── app/                              # Expo Router file-based screens & navigation
│   ├── _layout.jsx                   # Root layout with Stack navigator & theme header
│   ├── index.jsx                     # Entry route (redirects to /landing or /auth/login)
│   ├── landing.jsx                   # Role selection (Job Seeker vs Employer)
│   ├── dashboard.jsx                 # Super Admin & user overview dashboard
│   ├── notifications.jsx             # User notifications screen
│   │
│   ├── auth/                         # 🔐 Authentication Module
│   │   ├── _layout.jsx               # Auth stack navigator with transparent headers
│   │   ├── login.jsx                 # Login screen (Email, Password, Auto-fill mock credentials)
│   │   ├── register.jsx              # Sign up screen (Job Seeker / Employer registration)
│   │   ├── verify-account.jsx        # Account verification screen
│   │   ├── forgot-password.jsx       # Password recovery screen (dark yellow accent)
│   │   ├── verify-otp.jsx            # 4-digit OTP verification with timer & mock autofill
│   │   ├── reset-password.jsx        # New password & Confirm password setup
│   │   └── password-success.jsx      # Password reset success screen with purple badge
│   │
│   ├── (tabs)/                       # Main Tab navigation (Jobs, Applications, Messages, Profile)
│   ├── jobs/                         # Job search, job details, and filter screens
│   ├── onboarding/                   # User profile setup wizard
│   ├── plans/                        # Subscription & pricing plans
│   ├── profile/                      # User profile editing & settings
│   └── settings/                     # App configuration & preferences
│
├── components/                       # 🧩 Reusable UI Components
│   ├── AuthLayout.jsx                # Unified auth screen wrapper (header, back arrow, illustration)
│   ├── BrandLogo.jsx                 # Technokrate Hire official branding (centered logo)
│   ├── CustomInput.jsx               # Standard text input with touch focus handling
│   ├── PasswordInput.jsx             # Secure password input with eye toggle
│   ├── OTPInput.jsx                  # 4-box OTP input with auto-focus & backspace
│   ├── PrimaryButton.jsx             # Purple primary CTA button (#7000B0)
│   ├── CustomCheckbox.jsx            # Custom toggle checkbox for "Remember me"
│   ├── SearchBar.jsx                 # Interactive job search bar with filter trigger
│   ├── FilterSheet.jsx               # Bottom-sheet filter modal for search queries
│   ├── JobCard.jsx                   # Card item showing job details, badges & apply button
│   ├── ProfileStepper.jsx            # Step indicator for profile completion
│   └── illustrations/                # SVG / Custom decorative graphics
│
├── constants/                        # 🎨 Styling & Configuration
│   ├── colors.js                     # Exact brand color palette (Primary purple, dark yellow, lavender)
│   └── api.js                        # API endpoints and backend base configuration
│
├── services/                         # 🌐 API & Data Services
│   └── jobService.js                 # Complete job search, categories, and filter API integration
│
├── utils/                            # 🛠 Helpers & Utilities
│   └── validation.js                 # Email, password, OTP validation and mock credentials
│
├── assets/                           # 🖼 Images & Static Media
│   └── images/                       # Logo, success badge, hero graphics
│
├── app.json                          # Expo configuration
├── babel.config.js                   # Babel compiler settings
├── metro.config.js                   # Metro bundler config
└── package.json                      # Project dependencies and npm scripts
```

---

## 🎨 Design Tokens & Branding
- **Primary Purple**: `#7000B0` (Buttons, active tabs, header icons)
- **Halka Dark Yellow**: `#D49B00` (Links: Forgot Password, Sign Up, Back to Sign In)
- **Background Lavender**: `#F2E6F8` / Light cards `#F9F5FC`
- **Text Primary**: `#1E293B` / Dark Black `#111827`
- **Branding**: Logo centered with **SMART HIRING** (yellow) & **FASTER CAREERS** (cyan).

---

## 🚀 How to Open and Run in VS Code

### Step 1: Open VS Code
1. Open **Visual Studio Code**.
2. Click **File** > **Open Folder...** (or press `Ctrl + K Ctrl + O`).
3. Select this folder from your Desktop:
   `C:\Users\ravik\OneDrive\Desktop\Technokrate Job`
   *(Or open your terminal and run: `code "C:\Users\ravik\OneDrive\Desktop\Technokrate Job"`)*

### Step 2: Open Terminal in VS Code
- Press `Ctrl + ~` (or `Ctrl + Shift + \``) to open the built-in terminal.

### Step 3: Run the Development Server
Run this command:
```bash
npx expo start
```

### Step 4: Choose Where to Run
Once the Metro bundler starts:
- Press **`w`** to open in your **Web Browser** (Chrome / Edge).
- Press **`a`** to launch on the **Android Emulator** (Pixel 6).
- Or scan the displayed **QR Code** using the **Expo Go** app on your physical mobile phone.

---

## 🔑 Test Credentials (Mock Auth)
- **Admin Email**: `admin@technokrate.com`
- **Admin Password**: `Admin@123`
- **OTP Code**: `9999`
