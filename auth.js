import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  getMultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBOND-wraRXGL0jB8xK2zHnDMBXBhA5WRk",
  authDomain: "otp-client-login.firebaseapp.com",
  projectId: "otp-client-login",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Recaptcha - attaches to the login button
window.recaptchaVerifier = new RecaptchaVerifier(auth, 'loginBtn', {
  'size': 'invisible'
});

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (err) {
    if (err.code === 'auth/multi-factor-auth-required') {
      const resolver = getMultiFactorResolver(auth, err);
      
      // Send the SMS to the first enrolled factor
      const phoneInfoOptions = {
        multiFactorHint: resolver.hints[0],
        session: resolver.session
      };
      
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, window.recaptchaVerifier);
      
      const code = prompt("2FA Required. Enter the 6-digit code sent to your phone:");
      if (code) {
        const cred = PhoneAuthProvider.credential(verificationId, code);
        const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
        await resolver.resolveSignIn(multiFactorAssertion);
        window.location.href = "dashboard.html";
      }
    } else {
      alert("Login Error: " + err.message);
    }
  }
});