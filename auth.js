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

// ADD THIS: We need Firestore to look up usernames
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBg3KRIIvzkTA8OnrEBsln-aPcjU9DrBA4", // Note: Keep your keys private in production!
  authDomain: "netccusa.firebaseapp.com",
  projectId: "netccusa",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize the "Phonebook"

// 1. CHECK IF ALREADY LOGGED IN
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.replace("dashboard.html");
  }
});

window.recaptchaVerifier = new RecaptchaVerifier(auth, 'loginBtn', { 'size': 'invisible' });

// 2. THE LOGIN LOGIC
document.getElementById("loginBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value.toLowerCase().trim();
  const password = document.getElementById("password").value;

  if(!username || !password) {
      alert("Please enter credentials");
      return;
  }

  try {
    // LOOKUP STEP: Find the email associated with this username
    const userRef = doc(db, "usernames", username); 
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("Username not found.");
      return;
    }

    const email = userSnap.data().email; // We found the email!

    // Now login normally using the email we found
    await signInWithEmailAndPassword(auth, email, password);
    window.location.replace("dashboard.html");

  } catch (err) {
    // ... (Your 2FA code stays exactly the same here)
    if (err.code === 'auth/multi-factor-auth-required') {
        // [Existing 2FA logic here]
    } else {
      alert("Login Error: " + err.message);
    }
  }
});