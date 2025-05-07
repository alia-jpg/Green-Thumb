// Firebase SDK v9+ Modular Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  remove,
  onValue
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-4v0x1X2g3z5J6k7l8m9n0p1q2r3s4t5",
  authDomain: "green-thumb-68d25.firebaseapp.com",
  databaseURL: "https://green-thumb-68d25-default-rtdb.firebaseio.com",
  projectId: "green-thumb-68d25",
  storageBucket: "green-thumb-68d25.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const plantsRef = ref(database, 'plants');
const tipsRef = ref(database, 'tips');
const notificationRef = ref(database, 'notification');

const plantsList = document.getElementById('plants-list');
const tipsList = document.getElementById('tips-list');
const notificationList = document.getElementById('notification-List');

// Add a new plant
document.getElementById('addPlantBtn').addEventListener('click', addCard);

function addCard() {
  const plantName = document.getElementById("frontText").value;
  const plantType = document.getElementById("backText").value;

  if (!plantName.trim() || !plantType.trim()) {
    alert("Please enter both a plant name and type.");
    return;
  }

  const plant = {
    name: plantName,
    type: plantType,
    moisture: 0
  };

  const newPlantRef = push(plantsRef);
  set(newPlantRef, plant).catch((error) => {
    console.error("Error adding plant:", error);
  });

  document.getElementById("frontText").value = "";
  document.getElementById("backText").value = "";
}

// Display a plant card
function displayPlant(plant) {
  const cardContainer = document.getElementById("cardContainer");

  const card = document.createElement("div");
  card.classList.add("plant-card");
  card.setAttribute("data-id", plant.id);

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-front" onclick="flipCard('${plant.id}')">
        <h3>🌱 ${plant.name} 🌱</h3>
        <p>${plant.type}</p>
      </div>
      <div class="card-back" onclick="flipCard('${plant.id}')">
        <p>Soil Moisture:</p>
        <div class="moisture-bar">
          <div class="moisture-fill" id="moisture-${plant.id}" style="width: ${plant.moisture}%"></div>
        </div>
        <button class="water-btn" onclick="waterPlant('${plant.id}'); event.stopPropagation();">Water Plant</button>
        <button onclick="removePlant('${plant.id}'); event.stopPropagation();">Remove</button>
      </div>
    </div>
  `;

  cardContainer.appendChild(card);
}

// Flip card
window.flipCard = function (id) {
  const card = document.querySelector(`[data-id="${id}"] .card-inner`);
  card.classList.toggle("flipped");
};

// Water a plant
window.waterPlant = function (id) {
  const moistureBar = document.getElementById(`moisture-${id}`);
  const newMoisture = Math.min(100, Math.floor(Math.random() * 20 + 80));

  moistureBar.style.width = `${newMoisture}%`;

  const plantRef = ref(database, `plants/${id}`);
  update(plantRef, { moisture: newMoisture });

  showNotification(`Watering ${newMoisture >= 100 ? 'finished' : 'started'} for this plant`, 'success');
};

// Remove a plant
window.removePlant = function (id) {
  const plantRef = ref(database, `plants/${id}`);
  remove(plantRef).then(() => {
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) card.remove();
  });
};

// Notification System
function showNotification(message, type) {
  const container = document.querySelector('.notification-container') || createNotificationContainer();
  const notification = document.createElement('div');
  notification.classList.add('notification', type);
  notification.innerHTML = `
    <span>${message}</span>
    <button class="close-btn" onclick="this.parentElement.remove()">×</button>
  `;
  container.appendChild(notification);
  setTimeout(() => notification.remove(), 5000);
}

function createNotificationContainer() {
  const container = document.createElement('div');
  container.classList.add('notification-container');
  document.body.appendChild(container);
  return container;
}

// Load all plants and lists
function loadPlants() {
  onValue(plantsRef, (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById("cardContainer");
    container.innerHTML = '';

    if (data) {
      Object.keys(data).forEach(id => {
        displayPlant({ id, ...data[id] });
      });
    }
  });

  onValue(tipsRef, (snapshot) => {
    const data = snapshot.val();
    if (tipsList) {
      tipsList.innerHTML = '';
      for (let id in data) {
        const li = document.createElement('li');
        li.textContent = data[id];
        tipsList.appendChild(li);
      }
    }
  });

  onValue(notificationRef, (snapshot) => {
    const data = snapshot.val();
    if (notificationList) {
      notificationList.innerHTML = '';
      for (let id in data) {
        const item = data[id];
        if (!item || !item.name || !item.type) continue;

        const li = document.createElement('li');
        li.textContent = `${item.name} - ${item.type}`;
        notificationList.appendChild(li);
      }
    }
  });
// Listen for live moisture sensor updates
const sensorMoistureRef = ref(database, 'sensorData/moisture/value');

onValue(sensorMoistureRef, (snapshot) => {
  const moistureValue = snapshot.val();

  // Log to confirm it's working
  console.log("Live moisture reading:", moistureValue);

  // Example: Update a special moisture display bar or value
  const moistureDisplay = document.getElementById('live-moisture-value');
  if (moistureDisplay) {
    moistureDisplay.textContent = `${moistureValue}`;
  }
});

}
loadPlants();
