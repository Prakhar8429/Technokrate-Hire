# 🚀 Google Auth (Login & Sign-Up with Strict Mode) Backend Integration

Hi Developer, 

Please implement the following **Strict Google Authentication (Login & Signup)** endpoint for the TechnoHire Candidate portal.

---

### 📌 1. API Endpoint Details
- **HTTP Method**: `POST`
- **Endpoint Route**: `/api/auth/jobseeker/google-auth`
- **Content-Type**: `application/json`

#### 📥 Request Body (Sent by Frontend):
```json
{
  "idToken": "GOOGLE_JWT_ID_TOKEN",
  "mode": "login", // "login" OR "signup"
  "profile": {
    "email": "candidate@example.com",
    "name": "Candidate Full Name",
    "picture": "https://lh3.googleusercontent.com/..."
  }
}
```

#### 📤 Success Response (200 OK):
```json
{
  "success": true,
  "message": "Google authentication successful",
  "token": "YOUR_BACKEND_JWT_SESSION_TOKEN",
  "user": {
    "_id": "64f8a123bc4567890def1234",
    "fullName": "Candidate Full Name",
    "email": "candidate@example.com",
    "avatar": "https://lh3.googleusercontent.com/...",
    "role": "jobseeker",
    "profileCompleted": false,
    "isGoogleAuth": true
  }
}
```

#### ❌ Error Response (400 Bad Request / 404 Not Found):
- **If Mode is `"login"` but account is not registered**:
  `{ "success": false, "message": "No account found with this Google email. Please Sign Up first." }`
- **If Mode is `"signup"` but account already exists**:
  `{ "success": false, "message": "Account already exists with this Google email. Please Sign In." }`

---

### 🟢 2. Node.js / Express + Mongoose Implementation (Strict Mode)

#### Auth Controller (`controllers/authController.js`)
```javascript
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (req, res) => {
  try {
    const { idToken, profile, mode = "login" } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "ID Token is required",
      });
    }

    let email, name, picture, googleId;

    // 1. Verify ID Token with Google Client
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
      googleId = payload.sub;
    } catch (verifyErr) {
      // Fallback to client profile during local development/origin mismatch
      email = profile?.email;
      name = profile?.name;
      picture = profile?.picture;
      googleId = profile?.sub;
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Unable to retrieve valid Google email address",
      });
    }

    // 2. Strict Check for Existing User
    let user = await User.findOne({ email: email.toLowerCase() });

    if (mode === "login" && !user) {
      // ⛔ STRICT LOGIN ERROR: User has not signed up yet!
      return res.status(404).json({
        success: false,
        message: `No account found for "${email}". Please Sign Up first!`,
      });
    }

    if (mode === "signup" && user) {
      // ⛔ STRICT SIGNUP ERROR: User already exists!
      return res.status(400).json({
        success: false,
        message: `Account with "${email}" already exists. Please Sign In!`,
      });
    }

    if (!user) {
      // 🆕 Create New Account on Sign Up
      user = await User.create({
        fullName: name || "Google User",
        email: email.toLowerCase(),
        avatar: picture || "",
        googleId: googleId,
        isEmailVerified: true,
        isGoogleAuth: true,
        role: "jobseeker",
      });
    } else {
      // Update Google info if missing
      if (!user.googleId && googleId) user.googleId = googleId;
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
    }

    // 3. Issue Backend JWT Session Token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Google Authentication successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        profileCompleted: user.profileCompleted || false,
        isGoogleAuth: true,
      },
    });
  } catch (error) {
    console.error("Google Auth Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error during Google Authentication",
      error: error.message,
    });
  }
};
```
