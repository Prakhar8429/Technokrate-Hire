# TECHNOKRATE HIRE - ANDROID RELEASE & INTEGRATION SUMMARY

=====================================================
 TECHNOKRATE HIRE - ANDROID RELEASE & KEYSTORE CREDENTIALS
=====================================================

## 1. APP & PACKAGE DETAILS
-----------------------------------------------------
- **App Name**       : Technokrate Hire
- **Package Name**   : `com.technokrate.hire`
- **Version Code**   : `1`
- **Version Name**   : `1.0.0`
- **Min SDK**        : `24` (Android 7.0+ Nougat)
- **Target SDK**     : `35` (Android 15)
- **Compile SDK**    : `35` (Android 15)
- **Deep Link Scheme**: `technokratejob://`

---

## 2. KEYSTORE CREDENTIALS (SIGNING & PLAY STORE)
-----------------------------------------------------
- **Keystore File**  : `android/app/technokrate-release.keystore`
- **Store Password** : `technokrate123`
- **Key Alias**      : `technokrate-key`
- **Key Password**   : `technokrate123`
- **Keystore Type**  : `PKCS12`
- **Algorithm**      : `RSA 2048-bit (SHA256withRSA)`
- **Validity**       : `10,000 Days` (Valid until: `08-March-2054`)

---

## 3. CERTIFICATE FINGERPRINTS
-----------------------------------------------------
- **SHA-1**:
  `03:33:3D:1D:03:49:F1:30:19:71:14:2E:7C:9A:17:47:33:BC:D2:5C`

- **SHA-256**:
  `2A:A2:59:D3:D8:D9:F4:FA:0D:21:72:85:EC:2E:6C:EF:1B:2A:9D:EC:57:B3:85:CA:76:E2:79:E0:F4:EB:F2:E0`

---

## 4. DISTINGUISHED NAME (DName)
-----------------------------------------------------
`CN=Technokrate Hire, OU=Mobile Development, O=Technokrate, L=Nagpur, ST=Maharashtra, C=IN`

---

## 5. GENERATED PRODUCTION ARTIFACTS
-----------------------------------------------------
1. **Google Play Console Bundle (AAB)**:
   - Location: `Technokrate-Hire.aab` / `Technokrate-Hire-release.aab`
   - Desktop: `~/Desktop/Technokrate-Hire.aab`
   - Signed with: `technokrate-release.keystore` (SHA256withRSA)
   - Target SDK: 35 (Android 15 Ready)

2. **Standalone Installable APK**:
   - Location: `Technokrate-Hire.apk` / `Technokrate-Hire-release.apk`
   - Desktop: `~/Desktop/Technokrate-Hire.apk`
   - Dual-Signed: v1 (JAR signing) + v2 (APK Signature Scheme v2)
   - Universal 16KB / 4KB Page Alignment: Verified 100% Android 14/15 compatible

---

## 6. HOW TO RUN & BUILD (EASY COMMANDS)
-----------------------------------------------------
All commands are configured in `package.json` for seamless execution:

### Run Development:
```bash
# Start Expo development server (interactive menu)
npm start

# Run directly on Android device or emulator
npm run android

# Run on Web browser (opens automatically on http://localhost:8081)
npm run web
# or use: ./start-web.sh

# Build production web bundle to dist/
npm run web:build

# Preview production web build locally
npm run web:preview
```

### Build Production Release:
```bash
# Build & Sign both Production AAB (for Play Store) and APK (for direct testing)
npm run build:release

# Build & Sign Production AAB only
npm run build:aab

# Build & Sign Release APK only
npm run build:apk
```

### Native Gradle Commands:
```bash
# Build APK using Gradle
npm run gradle:assemble

# Build AAB using Gradle
npm run gradle:bundle

# Clean Gradle build cache
npm run clean
```

---

## 7. INTEGRATED CONFIGURATION FILES
-----------------------------------------------------
- `android/app/src/main/AndroidManifest.xml`: Fully synchronized with all permissions, scheme `technokratejob`, queries, and application theme.
- `app.json`: Updated with `com.technokrate.hire`, `versionCode: 1`, permissions, and app identity.
- `android/build.gradle`: Configured with `minSdkVersion = 24`, `targetSdkVersion = 35`, `compileSdkVersion = 35`.
- `android/gradle.properties`: Keystore credentials and SDK 35 build properties integrated.
- `android/app/build.gradle`: Release signing block wired with `technokrate-release.keystore` and automatic fallback.
