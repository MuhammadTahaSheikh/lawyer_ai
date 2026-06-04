// mfaLogin.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  multiFactor,
  RecaptchaVerifier,
  PhoneAuthProvider,
} from "firebase/auth";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase and Authentication
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Create an invisible reCAPTCHA verifier (ensure your HTML has a div with id "recaptcha-container")
const recaptchaVerifier = new RecaptchaVerifier(
  "recaptcha-container",
  { size: "invisible", callback: (response) => console.log("reCAPTCHA solved") },
  auth
);

/**
 * Sign in function that supports multi-factor authentication.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 */
export async function signInWithMFA(email, password) {
  try {
    // Attempt primary sign-in
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Primary sign-in successful:", userCredential);
    // If the user is signed in and has no MFA enrolled, signIn completes here.
  } catch (error) {
    // If MFA is required, the error code will be "auth/multi-factor-auth-required"
    if (error.code === "auth/multi-factor-auth-required") {
      const resolver = multiFactor(auth).getResolver(error);
      // For simplicity, assume the first enrolled factor (phone) is used
      const phoneInfoOptions = {
        multiFactorHint: resolver.hints[0],
        session: resolver.session,
      };
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        recaptchaVerifier
      );
      // Prompt the user to enter the SMS verification code
      const verificationCode = window.prompt("Enter the SMS verification code:");
      if (!verificationCode) {
        throw new Error("Verification code not provided.");
      }
      const phoneCredential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneAuthProvider.assertion(phoneCredential);
      const finalUserCredential = await resolver.resolveSignIn(multiFactorAssertion);
      console.log("MFA sign-in successful:", finalUserCredential);
    } else {
      console.error("Sign-in error:", error);
      throw error;
    }
  }
}

// Export auth if needed for other parts of your application
export { auth };