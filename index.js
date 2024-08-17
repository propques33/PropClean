import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

const appSettings = {
    databaseURL: "https://propclean-default-rtdb.firebaseio.com/"
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const dailyTasksRef = ref(database, "Daily Tasks");

const inputFieldEl = document.getElementById("input-field");
const dateFieldEl = document.getElementById("date-field");
const timeFieldEl = document.getElementById("time-field");
const addButtonEl = document.getElementById("add-button");
const shoppingListEl = document.getElementById("newtask");

addButtonEl.addEventListener("click", function() {
    let task = inputFieldEl.value;
    let date = dateFieldEl.value;
    let time = timeFieldEl.value;

    if (task && date && time) {
        let taskData = {
            task: task,
            date: date,
            time: time,
            status: "Incomplete" // Adding status for completeness
        };
        push(dailyTasksRef, taskData);

        clearInputFields();
    } else {
        alert("Please fill in all fields");
    }
});

onValue(dailyTasksRef, function(snapshot) {
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val());

        clearShoppingListEl();

        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i];
            let currentItemID = currentItem[0];
            let currentItemValue = currentItem[1];

            appendItemToShoppingListEl(currentItem);
        }
    } else {
        shoppingListEl.innerHTML = "No items here... yet";
    }
});

function clearShoppingListEl() {
    shoppingListEl.innerHTML = "";
}

function clearInputFields() {
    inputFieldEl.value = "";
    dateFieldEl.value = "";
    timeFieldEl.value = "";
}

function appendItemToShoppingListEl(item) {
    let itemID = item[0];
    let itemValue = item[1];

    let newEl = document.createElement("li");

    newEl.textContent = `${itemValue.task} - ${itemValue.date} - ${itemValue.time}`;

    newEl.addEventListener("click", function() {
        let exactLocationOfItemInDB = ref(database, `Daily Tasks/${itemID}`);

        remove(exactLocationOfItemInDB);
    });

    shoppingListEl.append(newEl);
}
onAuthStateChanged(auth, user => {
    if (user) {
        const userRef = ref(database, 'users/' + user.uid);
        onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            const userOffice = userData.office;
            document.body.classList.add(userOffice);
        });
    } else {
        window.location.href = 'index.html';
    }
});
