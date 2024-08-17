import { initializeApp } from "https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js";

const appSettings = {
    databaseURL: "https://propclean-default-rtdb.firebaseio.com/"
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const auth = getAuth(app);

const urlParams = new URLSearchParams(window.location.search);
const taskId = urlParams.get('id');
const office = urlParams.get('office');

let taskPath;
switch (office) {
    case 'workviaa':
        taskPath = `Workviaa/${taskId}`;
        break;
    case 'workdesq':
        taskPath = `Workdesq/${taskId}`;
        break;
    case 'sso':
        taskPath = `Sapna Sangeeta/${taskId}`;
        break;
    case 'karyasthal':
        taskPath = `Karyasthal/${taskId}`;
        break;
    case 'cubispace':
        taskPath = `Cubispace/${taskId}`;
        break;
    case 'worqspot':
        taskPath = `Worqspot/${taskId}`;
        break;
    default:
        document.getElementById("task-name").textContent = "Unknown office";
        console.error('Unknown office:', office);
        throw new Error('Unknown office');
}

console.log('Fetching task from path:', taskPath);

const taskRef = ref(database, taskPath);
onValue(taskRef, (snapshot) => {
    if (snapshot.exists()) {
        const taskData = snapshot.val();
        console.log('Task data retrieved:', taskData);

        const taskStatus = taskData.status ? taskData.status.toLowerCase() : 'unknown';
        console.log('Task status:', taskStatus);

        const uploadTime = new Date(taskData.uploadTime);
        const currentTime = new Date();
        const timeDifference = (currentTime - uploadTime) / (1000 * 60 * 60); // Time difference in hours
        console.log(uploadTime);
        console.log(currentTime);
        console.log(timeDifference);
        if (timeDifference >= 15 && taskStatus === "complete") {
            update(taskRef, { status: "incomplete" });
            taskData.status = "incomplete";
        }

        document.getElementById("task-name").textContent = `Task: ${taskData.task}`;
        document.getElementById("task-time").textContent = `Time: ${taskData.time}`;
        const statusButton = document.getElementById("status-button");

        // Remove any existing event listeners
        const newButton = statusButton.cloneNode(true);
        statusButton.parentNode.replaceChild(newButton, statusButton);

        if (taskData.status.toLowerCase() === "incomplete") {
            newButton.textContent = "Mark as Complete";
            newButton.classList.remove("completed");
            newButton.disabled = false;
            newButton.addEventListener("click", () => {
                window.location.href = `upload.html?id=${taskId}&office=${office}`;
            });
        } else if (taskData.status.toLowerCase() === "complete") {
            newButton.textContent = "Completed";
            newButton.classList.add("completed");
            newButton.disabled = true;
        } else {
            console.warn("Unknown task status:", taskData.status);
        }
    } else {
        document.getElementById("task-details").textContent = "Task not found";
        console.warn('Task not found at path:', taskPath);
    }
}, (error) => {
    console.error("Error fetching task details:", error);
    document.getElementById("task-name").textContent = "Error loading task details";
});

// Ensure user is authenticated before fetching task details
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('User authenticated:', user);
    } else {
        console.warn('User not authenticated');
        window.location.href = 'index.html'; // Redirect to login page if not authenticated
    }
});

