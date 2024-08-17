// logout.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const logoutButton = document.getElementById("logoutBtn");

// Add event listener for logout button
logoutButton.addEventListener("click", function() {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      console.log("Signed out successfully");
      window.location.href = "index.html"; // Redirect to login page after logout
    })
    .catch((error) => {
      // An error happened.
      console.error("Error signing out:", error);
    });
});

onAuthStateChanged(auth, user => {
  if (user) {
    const userRef = ref(database, 'users/' + user.uid);
    onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      if (userData) {
        const userOffice = userData.office;
        document.body.classList.add(userOffice);
      } else {
        console.error("User data not found");
      }
    });
  } else {
    window.location.href = 'index.html';
  }
});
