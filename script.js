// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, onAuthStateChanged,signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, set ,query, orderByChild, equalTo, get } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAn2hwFs7g1StFNAGVbiOxTTcLbuNq1le0",
  authDomain: "propclean.firebaseapp.com",
  databaseURL: "https://propclean-default-rtdb.firebaseio.com",
  projectId: "propclean",
  storageBucket: "propclean.appspot.com",
  messagingSenderId: "795234019311",
  appId: "1:795234019311:web:369566b90b91139164781a",
  measurementId: "G-CE3LFP4HSJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);

// DOM Elements
const submitButton = document.getElementById("submit");
const signupButton = document.getElementById("sign-up");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const main = document.getElementById("main");
const createacct = document.getElementById("create-acct");
const googleSignInButton = document.getElementById("google-sign-in");

const signupEmailIn = document.getElementById("email-signup");
const confirmSignupEmailIn = document.getElementById("confirm-email-signup");
const signupPasswordIn = document.getElementById("password-signup");
const confirmSignUpPasswordIn = document.getElementById("confirm-password-signup");
const createacctbtn = document.getElementById("create-acct-btn");
const officeSignupIn = document.getElementById("office-signup");

const returnBtn = document.getElementById("return-btn");
const forgotPasswordLink = document.getElementById("forgot-password") ? document.getElementById("forgot-password").querySelector("a") : null;
const googleSignUpButton = document.getElementById("google-sign-up");

const adminEmails = [
  "shanvishukla39@gmail.com",
  "thomas@propques.com",
  "amdixit1711@gmail.com",
  "sales@karyasthal.com",
  "aman.sales@workdesq.com",
  "cm.aamir@worqspot.com",
  "ops@workviaa.com",
  "sapnasangeetaoffices@gmail.com",
  "prashant.m@cubispace.com",
  "cubispace@gmail.com",
  "karyasthal@gmail.com",
  "workdesq@gmail.com",
  "workvia@gmail.com",
  "sapnasangeeta@gmail.com",
  "worqspot@gmail.com"
];


// Variables
let email, password, signupEmail, signupPassword, confirmSignupEmail, confirmSignUpPassword, office;


// Function to check if user is blocked
function checkUserBlockStatus(user) {
  // If the user's email is in the admin email list, skip the blocked check
  if (adminEmails.includes(user.email)) {
    return Promise.resolve(false);
  }

  // Otherwise, check the blocked status in the database
  return get(ref(database, 'users/' + user.uid)).then((snapshot) => {
    const userData = snapshot.val();
    return userData.blocked;
  });
}

// Check authentication state when the page loads
// Check authentication state when the page loads
onAuthStateChanged(auth, (user) => {
  if (user) {
    checkUserBlockStatus(user).then(isBlocked => {
      if (isBlocked) {
        signOut(auth).then(() => {
          window.alert("Your account has been blocked. Please contact the administrator.");
        });
      } else {
        // Ensure the currently logged-in user is not overwritten by previous credentials
        const storedAdminEmail = localStorage.getItem('adminEmail');
        if (storedAdminEmail && user.email === storedAdminEmail) {
          // Re-authenticate only if the stored email matches the current user
          const adminPassword = localStorage.getItem('adminPassword');
          if (adminPassword) {
            signInWithEmailAndPassword(auth, storedAdminEmail, adminPassword)
              .then(() => {
                console.log("Re-authenticated as admin after page reload.");
              })
              .catch((error) => {
                console.error("Error re-authenticating admin:", error);
              });
          }
        }
        window.location.href = "land.html"; // Redirect to the landing page if the user is not blocked
      }
    });
  }
});




// Google Sign-In
googleSignInButton.addEventListener("click", function() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;

      // Clear any previous credentials in localStorage
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminPassword');

      checkUserBlockStatus(user).then(isBlocked => {
        if (isBlocked) {
          signOut(auth).then(() => {
            window.alert("Your account has been blocked. Please contact the administrator.");
          });
        } else {
          window.location.href = "land.html"; // Redirect to landing page
        }
      });
    })
    .catch((error) => {
      console.error("Error signing in with Google:", error);
      handleAuthError(error);
    });
});

// Google Sign-Up
googleSignUpButton.addEventListener("click", function() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      // Clear any previous credentials in localStorage
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminPassword');

      // Check if user already exists in the database
      get(ref(database, 'users/' + user.uid)).then((snapshot) => {
        if (!snapshot.exists()) {
          // If user does not exist, save the user data
          set(ref(database, 'users/' + user.uid), {
            email: user.email,
            office: 'defaultOffice', // Change this to your default office value or logic to determine office
            blocked: false
          });
        }
      }).then(() => {
        window.location.href = "land.html";
      });
    })
    .catch((error) => {
      console.error("Error signing up with Google:", error);
      handleAuthError(error);
    });
});

// script.js
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
      document.getElementById('splash-screen').style.display = 'none';
      document.getElementById('main-content').style.display = 'block';
  }, 2000); // Adjust the timeout duration as needed
});


document.addEventListener("DOMContentLoaded", function() {
  const continueButton = document.getElementById("continue-button");

  continueButton.addEventListener("click", function() {
    const selectedOrganisation = document.getElementById("office-signup").value;
    const user = auth.currentUser;

    if (selectedOrganisation && user) {
      const userRef = ref(database, 'users/' + user.uid);
      set(userRef, {
        email: user.email,
        office: selectedOrganisation,
        blocked: false
      })
      .then(() => {
        console.log("Organisation saved successfully.");
        window.location.href = "land.html";
      })
      .catch((error) => {
        console.error("Error saving organisation:", error);
        window.alert("Error occurred. Try again.");
      });
    } else {
      window.alert("Please select an organisation.");
    }
  });
});


// Email Sign-Up
createacctbtn.addEventListener("click", function() {
  signupEmail = signupEmailIn.value;
  confirmSignupEmail = confirmSignupEmailIn.value;
  signupPassword = signupPasswordIn.value;
  confirmSignUpPassword = confirmSignUpPasswordIn.value;
  office = officeSignupIn.value;

  if (validateSignUpInputs(signupEmail, confirmSignupEmail, signupPassword, confirmSignUpPassword, office)) {
    console.log("Checking if email exists in database...");
    const emailQuery = query(ref(database, 'users'), orderByChild('email'), equalTo(signupEmail));
    get(emailQuery)
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log("Email already exists.");
          window.alert("Error: An account with the given email ID already exists.");
        } else {
          console.log("Email does not exist. Proceeding to create account...");
          createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
            .then((userCredential) => {
              const user = userCredential.user;
              console.log("User created:", user);
              return set(ref(database, 'users/' + user.uid), {
                email: signupEmail,
                office: office,
                blocked: false 
              });
            })
            .then(() => {
              console.log("User data saved in database.");
              window.alert("Success! Account created.");
              window.location.href = "index.html";
            })
            .catch((error) => {
              console.error("Error occurred during sign-up:", error);
              window.alert("Error occurred. Try again.");
            });
        }
      })
      .catch((error) => {
        console.error("Error occurred during email check:", error);
        window.alert("Error occurred. Try again.");
      });
  }
});


// Email Sign-In
submitButton.addEventListener("click", function() {
  email = emailInput.value;
  password = passwordInput.value;

  // Clear any previously stored credentials in localStorage
  localStorage.removeItem('adminEmail');
  localStorage.removeItem('adminPassword');

  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;
    const userRef = ref(database, 'users/' + user.uid);
    get(userRef).then((snapshot) => {
      const userData = snapshot.val();
      if (adminEmails.includes(user.email)) {
        localStorage.setItem('adminEmail', user.email);
        localStorage.setItem('adminPassword', password);
        window.alert("Success! Welcome back, admin!");
        window.location.href = "land.html";
      } else if (userData.blocked) {
        auth.signOut().then(() => {
          window.alert("Your account has been blocked. Please contact the administrator.");
        });
      } else {
        window.alert("Success! Welcome back!");
        window.location.href = "land.html";
      }
    });
  })
    .catch((error) => {
      console.error("Error occurred during sign-in:", error);
      if (error.code === "auth/invalid-email") {
        window.alert("Invalid email format. Please check and try again.");
      } else if (error.code === "auth/wrong-password") {
        window.alert("Incorrect password. Please try again.");
      } else if (error.code === "auth/user-not-found") {
        window.alert("No user found with this email. Please sign up first.");
      } else {
        window.alert("Error occurred. Try again.");
      }
    });
});

// Toggle Sign-Up Form
signupButton.addEventListener("click", function() {
  main.style.display = "none";
  createacct.style.display = "block";
});

// Return to Login Form
returnBtn.addEventListener("click", function() {
  main.style.display = "block";
  createacct.style.display = "none";
});

// Password Reset
if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener("click", function() {
    email = emailInput.value;
    if (!email) {
      window.alert("Please enter your email to reset password.");
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        window.alert("Password reset email sent. Check your inbox.");
      })
      .catch((error) => {
        console.error("Error occurred during password reset:", error);
        window.alert("Error occurred. Try again.");
      });
  });
}

// Helper functions
function validateSignUpInputs(email, confirmEmail, password, confirmPassword, office) {
  if (email !== confirmEmail) {
    window.alert("Email fields do not match. Try again.");
    return false;
  }
  if (password !== confirmPassword) {
    window.alert("Password fields do not match. Try again.");
    return false;
  }
  if (!email || !confirmEmail || !password || !confirmPassword || !office) {
    window.alert("Please fill out all required fields.");
    return false;
  }
  return true;
}

function handleAuthError(error) {
  if (error.code === "auth/account-exists-with-different-credential") {
    window.alert("Account exists with different credential. Please sign in using your email and password.");
  } else {
    window.alert("Error occurred. Please try again.");
  }
}
