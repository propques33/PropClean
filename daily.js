import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

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

// Initialize Firebase only if it hasn't been initialized already
if (!getApps().length) {
    initializeApp(firebaseConfig);
}

const database = getDatabase();
const auth = getAuth();

const shoppingListEl = document.getElementById("shopping-list");

function showShimmerEffect() {
    const shimmerCount = 5; // Number of shimmer placeholders
    shoppingListEl.innerHTML = "";
    for (let i = 0; i < shimmerCount; i++) {
      const shimmerEl = document.createElement("li");
      shimmerEl.className = "shimmer";
  
      const shimmerImg = document.createElement("div");
      shimmerImg.style.width = "95%";
      shimmerImg.style.height = "160px";
      shimmerImg.style.marginTop = "5px";
  
      const shimmerTextContainer = document.createElement("div");
      shimmerTextContainer.style.width = "95%";
      shimmerTextContainer.style.height = "140px";
      shimmerTextContainer.style.display = "flex";
      shimmerTextContainer.style.flexDirection = "column";
      shimmerTextContainer.style.justifyContent = "center";
      shimmerTextContainer.style.alignItems = "center";
  
      for (let j = 0; j < 3; j++) {
        const shimmerText = document.createElement("span");
        shimmerTextContainer.appendChild(shimmerText);
      }
  
      shimmerEl.appendChild(shimmerImg);
      shimmerEl.appendChild(shimmerTextContainer);
  
      shoppingListEl.appendChild(shimmerEl);
    }
  }
  
  function hideShimmerEffect() {
    const shimmerEls = document.querySelectorAll(".shimmer");
    shimmerEls.forEach(shimmerEl => shimmerEl.remove());
  }


onAuthStateChanged(auth, user => {
    if (user) {
        const userRef = ref(database, 'users/' + user.uid);
        onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                const companyName = userData.companyName;
                const subcompanyName = userData.subcompanyName;
                const role = userData.role;

                const tasksRef = ref(database, `companies/${companyName}/subcompanies/${subcompanyName}/tasks`);
                fetchAndDisplayTasks(tasksRef, companyName, subcompanyName);
                setInterval(() => {
                    fetchAndUpdateTaskStatuses(tasksRef, companyName, subcompanyName);
                }, 3600000); 
                startResetInterval(companyName, subcompanyName);
            } else {
                alert('User data not found.');
                window.location.href = 'index.html';
            }
        });
    } else {
        window.location.href = 'index.html';
    }
});

function fetchAndDisplayTasks(tasksRef, companyName, subcompanyName) {
    showShimmerEffect(); // Show shimmer effect while data is loading
  
    onValue(tasksRef, function(snapshot) {
      hideShimmerEffect(); // Hide shimmer effect once data is loaded
  
      if (snapshot.exists()) {
        let tasksArray = Object.entries(snapshot.val());
        
        let tasksFrom8AM = tasksArray.filter(task => parseTime(task[1].time) >= parseTime("00:00 AM"));
            let tasksBefore8AM = tasksArray.filter(task => parseTime(task[1].time) < parseTime("00:00 AM"));
        
            tasksFrom8AM.sort((a, b) => {
                const timeA = parseTime(a[1].time);
                const timeB = parseTime(b[1].time);
                return timeA - timeB;
            });

            tasksBefore8AM.sort((a, b) => {
                const timeA = parseTime(a[1].time);
                const timeB = parseTime(b[1].time);
                return timeA - timeB;
            });

            // Concatenate the two groups: from 8:00 AM onwards first, then before 8:00 AM
            tasksArray = tasksFrom8AM.concat(tasksBefore8AM);
        
        clearShoppingListEl();
  
        tasksArray.forEach(function(taskItem) {
          let taskData = taskItem[1];
          appendTaskToShoppingListEl(taskItem[0], taskData, companyName, subcompanyName);
        });
      } else {
        shoppingListEl.innerHTML = "No tasks found";
      }
    });
  }



function parseTime(timeString) {
    if (!timeString) {
        return Infinity; // Set a very high value for missing times to sort them to the end
    }
    const [time, period] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
}

function formatTimeToAMPM(timeString) {
    if (!timeString) return "Invalid Time";
    const [hours, minutes] = timeString.split(':');
    let hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12; // Convert 24-hour to 12-hour format
    return `${hour}:${minutes} ${period}`;
}

function clearShoppingListEl() {
    shoppingListEl.innerHTML = "";
}

function appendTaskToShoppingListEl(taskId, taskData, companyName, subcompanyName) {
    console.log("cn"+companyName);
    console.log("scn"+subcompanyName);
    let newEl = document.createElement("li");
    newEl.setAttribute('data-task-id', taskId);
    newEl.style.display = "flex";
    newEl.style.flexDirection = "column";
    newEl.style.justifyContent = "between";
    newEl.style.alignItems = "center";
    newEl.style.border = "1px solid #ccc";
    newEl.style.borderRadius = "12px";
    newEl.style.padding = "5px";
    newEl.style.marginBottom = "18px";
    newEl.style.backgroundColor = "#fff";
    newEl.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.35)";
    
    // Create image element for the task
    let imgEl = document.createElement("img");
    imgEl.alt = taskData.task; 
    imgEl.style.width = "95%";
    imgEl.style.height = "160px";
    imgEl.style.borderRadius = "8px";
    imgEl.style.marginTop = "5px";
    imgEl.style.marginBottom = "24px";
    imgEl.style.objectFit = "cover";
    imgEl.style.boxShadow = "4px 4px 15px 0px rgb(51,94,247,0.2)";

    // Set image source from taskData.imageUrlAtt
    imgEl.src = taskData.imageUrlAtt || "reception.avif"; 

    // Create a container for the text details
    let textContainerEl = document.createElement("div");
    textContainerEl.style.display = "flex";
    textContainerEl.style.flexDirection = "column";
    textContainerEl.style.justifyContent = "center";
    textContainerEl.style.alignContent = "center";
    textContainerEl.style.height = "180px";
    textContainerEl.style.width = "95%";
    textContainerEl.style.position = "relative";

    // Create task detail elements
    let taskDescE1 = document.createElement("span");
    taskDescE1.textContent = "Task Details";
    taskDescE1.setAttribute('data-translate', 'Task Details');
    taskDescE1.style.fontSize = "20px";
    taskDescE1.style.fontWeight = "800";
    taskDescE1.style.backgroundColor = "#EAEFFE";
    taskDescE1.style.width = "120px";
    taskDescE1.style.padding = "5px";
    taskDescE1.style.textAlign = "center";
    taskDescE1.style.color = "#335EF7";
    taskDescE1.style.borderRadius = "5px";
    taskDescE1.style.margin = "0 auto";
    taskDescE1.style.marginTop = "20px";

    let taskDetailEl = document.createElement("span");
    taskDetailEl.textContent = taskData.task;
    taskDetailEl.setAttribute('data-translate', taskData.task);
    taskDetailEl.style.fontSize = "18px";
    taskDetailEl.style.fontWeight = "bold";
    taskDetailEl.style.textAlign = "left";
    taskDetailEl.style.margin = "0 auto";
    taskDetailEl.style.marginTop = "12px";
    taskDetailEl.style.width = "80%";
    
    let taskTimeHeadingEl = document.createElement("span");
    taskTimeHeadingEl.textContent = "Task Time";
    taskTimeHeadingEl.setAttribute('data-translate', 'Task Time');
    taskTimeHeadingEl.style.fontSize = "18px";
    taskTimeHeadingEl.style.fontWeight = "800";
    taskTimeHeadingEl.style.width = "90px";
    taskTimeHeadingEl.style.backgroundColor = "#EAEFFE";
    taskTimeHeadingEl.style.fontWeight = "bold";
    taskTimeHeadingEl.style.color = "#000";
    taskTimeHeadingEl.style.marginTop = "12px";
    taskTimeHeadingEl.style.marginLeft = "22px";
    taskTimeHeadingEl.style.textAlign = "center";
    taskTimeHeadingEl.style.padding = "2px 0px";
    taskTimeHeadingEl.style.borderRadius = "3px";

    let formattedTaskTime = formatTimeToAMPM(taskData.time);
    let timeDetailEl = document.createElement("span");
    timeDetailEl.textContent = formattedTaskTime;
    timeDetailEl.style.fontSize = "18px";
    timeDetailEl.style.fontWeight = "bold";
    timeDetailEl.style.color = "#335ef7";
    timeDetailEl.style.margin = "0 auto";
    timeDetailEl.style.marginTop = "8px";
    timeDetailEl.style.width = "80%";

    let uploadTime = new Date(taskData.uploadTime);
    let options = { hour: '2-digit', minute: '2-digit'};
    let formattedUploadTime = uploadTime.toLocaleTimeString([], options);

    if (formattedUploadTime==="Invalid Date") {
        formattedUploadTime = "Not Uploaded";
    }
    console.log(formattedUploadTime);


    let uploadTimeHeadingEl = document.createElement("span");
    uploadTimeHeadingEl.textContent = "Upload Time";
    uploadTimeHeadingEl.setAttribute('data-translate', 'Upload Time');
    uploadTimeHeadingEl.style.fontSize = "18px";
    uploadTimeHeadingEl.style.fontWeight = "800";
    uploadTimeHeadingEl.style.width = "120px";
    uploadTimeHeadingEl.style.backgroundColor = "#EAEFFE";
    uploadTimeHeadingEl.style.fontWeight = "bold";
    uploadTimeHeadingEl.style.color = "#000";
    uploadTimeHeadingEl.style.marginTop = "12px";
    uploadTimeHeadingEl.style.marginLeft = "22px";
    uploadTimeHeadingEl.style.textAlign = "center";
    uploadTimeHeadingEl.style.padding = "2px 0px";
    uploadTimeHeadingEl.style.borderRadius = "3px";

    let timeDetailE2 = document.createElement("span");
    timeDetailE2.textContent = formattedUploadTime;
    timeDetailE2.style.fontSize = "18px";
    timeDetailE2.style.fontWeight = "bold";
    timeDetailE2.style.color = "#335ef7";
    timeDetailE2.style.margin = "0 auto";
    timeDetailE2.style.marginTop = "8px";
    timeDetailE2.style.width = "80%";

    let assigned = document.createElement("span");
    assigned.textContent = "Assigned to";
    assigned.setAttribute('data-translate', 'Upload Time');
    assigned.style.fontSize = "18px";
    assigned.style.fontWeight = "800";
    assigned.style.width = "120px";
    assigned.style.backgroundColor = "#EAEFFE";
    assigned.style.fontWeight = "bold";
    assigned.style.color = "#000";
    assigned.style.marginTop = "12px";
    assigned.style.marginLeft = "22px";
    assigned.style.textAlign = "center";
    assigned.style.padding = "2px 0px";
    assigned.style.borderRadius = "3px";

    // Fetch the email for the assigned user ID
    fetchUserEmailById(taskData.assigned)
        .then(email => {
    let assignedDetail = document.createElement("span");
    assignedDetail.textContent = email;
    assignedDetail.style.fontSize = "18px";
    assignedDetail.style.fontWeight = "bold";
    assignedDetail.style.color = "#335ef7";
    assignedDetail.style.margin = "0 auto";
    assignedDetail.style.marginTop = "8px";
    assignedDetail.style.width = "80%";
    textContainerEl.appendChild(assignedDetail);
        })

    let statusEl = document.createElement("span");
    statusEl.className = "statusEl";
    statusEl.textContent=taskData.status;
    statusEl.setAttribute('data-translate', taskData.status);
    statusEl.style.display = "inline-block";
    statusEl.style.padding = "5px 8px";
    statusEl.style.borderRadius = "5px";
    statusEl.style.position = "absolute";
    statusEl.style.bottom = "-110px";
    statusEl.style.right = "0px";
    statusEl.style.fontSize = "20px";
    statusEl.style.fontWeight = "700";
    statusEl.style.color = "white";
    if (taskData.status.toLowerCase() === "complete") {
        statusEl.style.backgroundColor = "green";
    } else if (taskData.status.toLowerCase() === "incomplete") {
        statusEl.style.backgroundColor = "red";
    } else if(taskData.status.toLowerCase()==="approved") {
        statusEl.style.backgroundColor = "blue"; // Default color for other statuses
    }
    else{
        statusEl.style.backgroundColor = "gray";
    }
    statusEl.style.margin = "0 auto";
    statusEl.style.marginTop = "8px";


    // Append task details to the container
    textContainerEl.appendChild(taskDescE1);
    textContainerEl.appendChild(taskDetailEl);
    textContainerEl.appendChild(taskTimeHeadingEl);
    textContainerEl.appendChild(timeDetailEl);
    textContainerEl.appendChild(uploadTimeHeadingEl);
    textContainerEl.appendChild(timeDetailE2);
    textContainerEl.appendChild(assigned);
    textContainerEl.appendChild(statusEl);

    // Append image and text container to the list item
    newEl.appendChild(imgEl);
    newEl.appendChild(textContainerEl);

    newEl.addEventListener("click", function() {
        if (companyName && subcompanyName) {
            console.log(`Navigating to taskDetails.html with ID: ${taskId}, Company: ${companyName}, Subcompany: ${subcompanyName}`); // Debugging log
            window.location.href = `taskDetails.html?id=${taskId}&company=${companyName}&subcompany=${subcompanyName}`;
        } else {
            console.error("Company name or subcompany name is missing.");
        }
    });

    shoppingListEl.appendChild(newEl);
}

function fetchUserEmailById(userId) {
    return new Promise((resolve, reject) => {
        const userRef = ref(database, 'users/' + userId);
        onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData && userData.email) {
                resolve(userData.email);
            } else {
                reject("No email found for user ID");
            }
        }, (error) => {
            reject(error);
        });
    });
}

function fetchAndUpdateTaskStatuses(tasksRef, companyName, subcompanyName) {
    onValue(tasksRef, function(snapshot) {
        if (snapshot.exists()) {
            let tasksArray = Object.entries(snapshot.val());

            tasksArray.forEach(function(taskItem) {
                let taskId = taskItem[0];
                let taskData = taskItem[1];

                // Update task status on the page if it's incomplete
                let taskEl = document.querySelector(`li[data-task-id="${taskId}"]`);
                if (taskEl) {
                    let statusEl = taskEl.querySelector("span:last-child");
                    if (taskData.status.toLowerCase() === "incomplete") {
                        statusEl.textContent = "incomplete";
                        statusEl.style.backgroundColor = "red";
                    } else if (taskData.status.toLowerCase() === "complete") {
                        statusEl.textContent = "complete";
                        statusEl.style.backgroundColor = "green";
                    } else {
                        statusEl.textContent = taskData.status;
                        statusEl.style.backgroundColor = "grey";
                    }
                }
            });
        }
    });
}
// setInterval(() => {
//     fetchAndUpdateTaskStatuses();
// }, 3600000);

// Initial fetch to ensure data is loaded on page load
onAuthStateChanged(auth, user => {
    if (user) {
        const userRef = ref(database, 'users/' + user.uid);
        onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                const companyName = userData.companyName;
        const subcompanyName = userData.subcompanyName;
        const role = userData.role;
                const tasksRef = ref(database, `companies/${companyName}/subcompanies/${subcompanyName}/tasks`);
        fetchAndDisplayTasks(tasksRef, companyName, subcompanyName);
        setInterval(() => {
            fetchAndUpdateTaskStatuses(tasksRef, companyName, subcompanyName);
          }, 3600000);

          // Start reset interval check every 5 minutes
          startResetInterval(companyName, subcompanyName);
            } else {
                alert('User data not found.');
                window.location.href = 'index.html';
            }
        });
    } else {
        window.location.href = 'index.html';
    }
});

// Modified Reset Logic
let hasResetTasksToday = false; // Flag to ensure single reset per day

// Function to start the reset interval check every 5 minutes
function startResetInterval(companyName, subcompanyName) {
    setInterval(() => {
        console.log("Checking if task reset is needed...");
        checkAndResetIfNeeded(companyName, subcompanyName);
    }, 5 * 60 * 1000); // 5-minute interval
}

// Function to reset tasks
function resetTasks(companyName, subcompanyName) {
    const tasksRef = ref(database, `companies/${companyName}/subcompanies/${subcompanyName}/tasks`);
  
    onValue(tasksRef, (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const taskId = childSnapshot.key;
        const taskRef = ref(database, `companies/${companyName}/subcompanies/${subcompanyName}/tasks/${taskId}`);
        update(taskRef, {
          status: "incomplete",
          imageUrl: null,
          completedBy: null,
          uploadTime: null,
          rating: 0
        }).then(() => {
          console.log(`Tasks for ${companyName} - ${subcompanyName} have been reset.`);
        }).catch((error) => {
          console.error(`Error resetting tasks for ${companyName} - ${subcompanyName}:`, error);
        });
      });
    });
  }
  
  // Reset logic with date tracking
let lastResetDate = null; // Tracks the date when tasks were last reset

function checkAndResetIfNeeded(companyName, subcompanyName) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const todayDate = now.toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

    // Check if the time is 12:10 AM or later and tasks haven't been reset today
    if (currentHour === 23 && currentMinute >= 55 && lastResetDate !== todayDate) {
        console.log("Resetting tasks at:", now.toLocaleString());
        resetTasks(companyName, subcompanyName);
        lastResetDate = todayDate; // Update the last reset date to today
    }
}
  

