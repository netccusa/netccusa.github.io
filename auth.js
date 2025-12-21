import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  getMultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Make sure this matches your config precisely
const firebaseConfig = {
  apiKey: "AIzaSyBg3KRIIvzkTA8OnrEBsln-aPcjU9DrBA4",
  authDomain: "netccusa.firebaseapp.com",
  projectId: "netccusa",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// CHECK IF ALREADY LOGGED IN
// This prevents the "spazzing" by moving logged-in users away from the login page
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.replace("dashboard.html");
  }
});

// Initialize Recaptcha
window.recaptchaVerifier = new RecaptchaVerifier(auth, 'loginBtn', {
  'size': 'invisible'
});

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if(!email || !password) {
      alert("Please enter credentials");
      return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.replace("dashboard.html");
  } catch (err) {
    if (err.code === 'auth/multi-factor-auth-required') {
      const resolver = getMultiFactorResolver(auth, err);
      
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
        window.location.replace("dashboard.html");
      }
    } else {
      alert("Login Error: " + err.message);
    }
  }
});