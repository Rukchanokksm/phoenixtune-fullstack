// ─── Translation messages — English default, Thai secondary ──────────────────

export type Locale = "en" | "th"
export const DEFAULT_LOCALE: Locale = "en"
export const LOCALES: Locale[] = ["en", "th"]

// Use a shared schema so the type widens across locales (no literal narrowing).
type Schema = {
  nav: Record<
    | "home" | "games" | "forums" | "tunes" | "calculator" | "search"
    | "signIn" | "register" | "profile" | "myTunes" | "savedTunes" | "settings" | "signOut" | "soon",
    string
  >
  footer: Record<
    | "tagline" | "platformTitle" | "gamesTitle" | "contactTitle"
    | "browseTunes" | "tuneCalculator" | "forums" | "uploadTune"
    | "discord" | "facebook" | "reportBug"
    | "privacy" | "terms" | "copyright",
    string
  >
  auth: Record<
    | "loginTitle" | "forgotTitle" | "changeTitle"
    | "tabLogin" | "tabForgot" | "tabChange"
    | "email" | "password" | "newPassword" | "confirmPassword" | "oldPassword"
    | "signInButton" | "signingIn" | "resetButton" | "resetting" | "changeButton" | "changing"
    | "noAccount" | "signUp" | "hasAccount"
    | "forgotHint" | "changeHint"
    | "strengthEasy" | "strengthMedium" | "strengthStrong"
    | "registerTitle" | "registerSubtitle"
    | "username" | "usernamePlaceholder" | "usernameHint" | "usernameChecking"
    | "gender" | "male" | "female" | "unspecified"
    | "country" | "countryNone" | "birthday" | "birthdayHint"
    | "uploadAvatar" | "registerButton" | "registering" | "required"
    | "errInvalidCred" | "errEmailNotConfirmed" | "errTooManyReq"
    | "errFillEmailPw" | "errFillEmail" | "errPwMin8" | "errPwMismatch"
    | "errFillAll" | "errPwSame" | "errInvalidEmail"
    | "errUsernameMin3" | "errUsernameTaken" | "errFillUsername"
    | "errAvatarSize" | "errGeneric"
    | "okResetDone" | "okChangeDone" | "pwMatch" | "pwNoMatch",
    string
  >
}

export const MESSAGES: Record<Locale, Schema> = {
  en: {
    // ─── Navbar ───────────────────────────────────────────────────────────
    nav: {
      home:        "Home",
      games:       "Games",
      forums:      "Forums",
      tunes:       "Tunes",
      calculator:  "Calculator",
      search:      "Search tunes, cars, or tuners...",
      signIn:      "Sign in",
      register:    "Register",
      profile:     "Profile",
      myTunes:     "My Tunes",
      savedTunes:  "Saved Tunes",
      settings:    "Settings",
      signOut:     "Sign out",
      soon:        "SOON",
    },
    // ─── Footer ───────────────────────────────────────────────────────────
    footer: {
      tagline:        "Community platform for sharing and finding tune settings",
      platformTitle:  "Platform",
      gamesTitle:     "Games",
      contactTitle:   "Contact",
      browseTunes:    "Browse Tunes",
      tuneCalculator: "Tune Calculator",
      forums:         "Forums",
      uploadTune:     "Upload Tune",
      discord:        "Discord Community",
      facebook:       "Facebook Page",
      reportBug:      "Report a Bug",
      privacy:        "Privacy Policy",
      terms:          "Terms of Service",
      copyright:      "Built with ❤ for the racing community",
    },
    // ─── Auth pages ───────────────────────────────────────────────────────
    auth: {
      // Login
      loginTitle:      "Sign in",
      forgotTitle:     "Reset password",
      changeTitle:     "Change password",
      tabLogin:        "Sign in",
      tabForgot:       "Forgot password",
      tabChange:       "Change",
      email:           "Email",
      password:        "Password",
      newPassword:     "New password",
      confirmPassword: "Confirm new password",
      oldPassword:     "Current password",
      signInButton:    "Sign in →",
      signingIn:       "Signing in...",
      resetButton:     "Reset password →",
      resetting:       "Resetting...",
      changeButton:    "Change password →",
      changing:        "Changing...",
      noAccount:       "No account yet?",
      signUp:          "Sign up",
      hasAccount:      "Already have an account?",
      forgotHint:      "Enter your registered email and set a new password",
      changeHint:      "You must be logged in to change your password",
      strengthEasy:    "Easy to guess",
      strengthMedium:  "Medium",
      strengthStrong:  "Strong",
      // Register
      registerTitle:   "Sign up",
      registerSubtitle:"Join the tuner community and share your setup",
      username:        "Username",
      usernamePlaceholder: "e.g., yourname",
      usernameHint:    "This will be shown on your tune pages",
      usernameChecking:"Checking...",
      gender:          "Gender",
      male:            "Male",
      female:          "Female",
      unspecified:     "Prefer not to say",
      country:         "Country",
      countryNone:     "— Not specified —",
      birthday:        "Birthday",
      birthdayHint:    "Optional — shown on profile only",
      uploadAvatar:    "Upload avatar",
      registerButton:  "Sign up →",
      registering:     "Signing up...",
      // Common
      required:        "Required",
      // Errors
      errInvalidCred:  "Invalid email or password",
      errEmailNotConfirmed: "Please confirm your email first",
      errTooManyReq:   "Too many attempts — please wait a moment",
      errFillEmailPw:  "Please enter email and password",
      errFillEmail:    "Please enter email",
      errPwMin8:       "Password must be at least 8 characters",
      errPwMismatch:   "Passwords do not match",
      errFillAll:      "Please fill in all fields",
      errPwSame:       "New password must differ from old password",
      errInvalidEmail: "Invalid email format",
      errUsernameMin3: "Username must be at least 3 characters",
      errUsernameTaken:"Username is already taken",
      errFillUsername: "Please enter a username",
      errAvatarSize:   "File size must not exceed 2MB",
      errGeneric:      "An error occurred",
      // Success
      okResetDone:     "Password reset successful — back to sign in",
      okChangeDone:    "Password changed successfully!",
      pwMatch:         "Passwords match",
      pwNoMatch:       "Passwords do not match",
    },
  },
  th: {
    nav: {
      home:        "หน้าแรก",
      games:       "เกม",
      forums:      "ฟอรั่ม",
      tunes:       "Tune",
      calculator:  "เครื่องคำนวณ",
      search:      "ค้นหา tune, รถ, หรือ tuner...",
      signIn:      "เข้าสู่ระบบ",
      register:    "สมัครสมาชิก",
      profile:     "โปรไฟล์",
      myTunes:     "Tune ของฉัน",
      savedTunes:  "Tune ที่บันทึก",
      settings:    "ตั้งค่า",
      signOut:     "ออกจากระบบ",
      soon:        "เร็วๆ นี้",
    },
    footer: {
      tagline:        "Community platform สำหรับแชร์และค้นหา tune setting",
      platformTitle:  "แพลตฟอร์ม",
      gamesTitle:     "เกม",
      contactTitle:   "ติดต่อ",
      browseTunes:    "ดู Tune ทั้งหมด",
      tuneCalculator: "เครื่องคำนวณ Tune",
      forums:         "ฟอรั่ม",
      uploadTune:     "อัปโหลด Tune",
      discord:        "Discord Community",
      facebook:       "Facebook Page",
      reportBug:      "แจ้งบั๊ก",
      privacy:        "นโยบายความเป็นส่วนตัว",
      terms:          "ข้อกำหนดการให้บริการ",
      copyright:      "สร้างด้วย ❤ เพื่อชุมชนนักแข่ง",
    },
    auth: {
      loginTitle:      "เข้าสู่ระบบ",
      forgotTitle:     "รีเซ็ตรหัสผ่าน",
      changeTitle:     "เปลี่ยนรหัสผ่าน",
      tabLogin:        "เข้าสู่ระบบ",
      tabForgot:       "ลืมรหัสผ่าน",
      tabChange:       "เปลี่ยน",
      email:           "อีเมล",
      password:        "รหัสผ่าน",
      newPassword:     "รหัสผ่านใหม่",
      confirmPassword: "ยืนยันรหัสผ่านใหม่",
      oldPassword:     "รหัสผ่านเดิม",
      signInButton:    "เข้าสู่ระบบ →",
      signingIn:       "กำลังเข้าสู่ระบบ...",
      resetButton:     "รีเซ็ตรหัสผ่าน →",
      resetting:       "กำลังรีเซ็ต...",
      changeButton:    "เปลี่ยนรหัสผ่าน →",
      changing:        "กำลังเปลี่ยน...",
      noAccount:       "ยังไม่มีบัญชี?",
      signUp:          "สมัครสมาชิก",
      hasAccount:      "มีบัญชีแล้ว?",
      forgotHint:      "กรอก email ที่ใช้สมัคร และ password ใหม่ที่ต้องการตั้ง",
      changeHint:      "ต้องเข้าสู่ระบบก่อนถึงจะเปลี่ยนรหัสผ่านได้",
      strengthEasy:    "คาดเดาง่าย",
      strengthMedium:  "ปานกลาง",
      strengthStrong:  "คาดเดายาก",
      registerTitle:   "สมัครสมาชิก",
      registerSubtitle:"เข้าร่วมชุมชน tuner และแชร์ setup ของคุณ",
      username:        "ชื่อผู้ใช้",
      usernamePlaceholder: "เช่น yourname",
      usernameHint:    "ชื่อนี้จะแสดงในหน้า tune ของคุณ",
      usernameChecking:"กำลังตรวจสอบ...",
      gender:          "เพศ",
      male:            "ชาย",
      female:          "หญิง",
      unspecified:     "ไม่ระบุ",
      country:         "ประเทศ",
      countryNone:     "— ไม่ระบุ —",
      birthday:        "วันเกิด",
      birthdayHint:    "ไม่บังคับ — ใช้แสดงบนโปรไฟล์เท่านั้น",
      uploadAvatar:    "อัปโหลดรูปโปรไฟล์",
      registerButton:  "สมัครสมาชิก →",
      registering:     "กำลังสมัคร...",
      required:        "จำเป็น",
      errInvalidCred:  "email หรือ password ไม่ถูกต้อง",
      errEmailNotConfirmed: "กรุณายืนยัน email ก่อน",
      errTooManyReq:   "ลองเข้าสู่ระบบบ่อยเกินไป รอสักครู่แล้วลองใหม่",
      errFillEmailPw:  "กรุณากรอก email และ password",
      errFillEmail:    "กรุณากรอก email",
      errPwMin8:       "password ต้องมีอย่างน้อย 8 ตัวอักษร",
      errPwMismatch:   "password ทั้งสองช่องไม่ตรงกัน",
      errFillAll:      "กรุณากรอกข้อมูลให้ครบ",
      errPwSame:       "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม",
      errInvalidEmail: "รูปแบบ email ไม่ถูกต้อง",
      errUsernameMin3: "username ต้องมีอย่างน้อย 3 ตัวอักษร",
      errUsernameTaken:"username นี้ถูกใช้ไปแล้ว",
      errFillUsername: "กรุณากรอก username",
      errAvatarSize:   "ขนาดไฟล์ต้องไม่เกิน 2MB",
      errGeneric:      "เกิดข้อผิดพลาด",
      okResetDone:     "เปลี่ยนรหัสผ่านสำเร็จแล้ว — กลับไปเข้าสู่ระบบได้เลย",
      okChangeDone:    "เปลี่ยนรหัสผ่านสำเร็จแล้ว!",
      pwMatch:         "password ตรงกัน",
      pwNoMatch:       "password ไม่ตรงกัน",
    },
  },
}

export type Messages = Schema
