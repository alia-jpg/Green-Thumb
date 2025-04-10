const firebaseConfig = {
  apiKey: "AIzaSyD-4v0x1X2g3z5J6k7l8m9n0p1q2r3s4t5",
  authDomain: "green-thumb-68d25.firebaseapp.com",
  databaseURL: "https://green-thumb-68d25-default-rtdb.firebaseio.com",
  projectId: "green-thumb-68d25",
  storageBucket: "green-thumb-68d25.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Initialize Firebase (only if not already initialized)
let app;
if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app(); // use existing app
}


// Firebase references
const database = firebase.database(app);
const plantsRef = database.ref('plants');
const tipsRef = database.ref('tips');
const notificationRef = database.ref('notification');

const plantsList = document.getElementById('plants-list');
const tipsList = document.getElementById('tips-list');
const notificationList = document.getElementById('notification-List');

function addCard() {
  let plantName = document.getElementById("frontText").value;
  let plantType = document.getElementById("backText").value;

  console.log(plantName);

  if (!plantName.trim() || !plantType.trim()) {
    alert("Please enter both a plant name and type.");
    return;
  }

  // Create a plant object with random moisture value
  let plant = {
    name: plantName,
    type: plantType,
    moisture: Math.floor(Math.random() * 100) // Random moisture value
  };

  // Push the new plant data into Firebase and update the UI
  const newPlantRef = plantsRef.push(); // Firebase reference for new plant
  newPlantRef.set(plant)  // Store the plant in Firebase
    .then(() => {
      console.log('Plant added successfully!');
      displayPlant({ id: newPlantRef.key, ...plant }); // Call displayPlant immediately with the added data
    })
    .catch((error) => {
      console.error('Error adding plant:', error);
    });

  // Clear the input fields after adding the plant
  document.getElementById("frontText").value = "";
  document.getElementById("backText").value = "";
}

// Display a plant card
function displayPlant(plant) {
  let cardContainer = document.getElementById("cardContainer");

  // Create a new card div
  let card = document.createElement("div");
  card.classList.add("plant-card");
  card.setAttribute("data-id", plant.id);

  // Card content
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

  // Append the new card to the container
  cardContainer.appendChild(card);
}


// Flip a plant card
function flipCard(id) {
  let card = document.querySelector(`[data-id="${id}"] .card-inner`);
  card.classList.toggle("flipped");
}

// Notification system
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

// Water plant
function waterPlant(id) {
  const moistureBar = document.getElementById(`moisture-${id}`);
  const newMoisture = Math.min(100, Math.random() * 20 + 80);

  moistureBar.style.width = newMoisture + "%";
  plantsRef.child(id).update({ moisture: newMoisture });

  showNotification(`Watering ${newMoisture >= 100 ? 'finished' : 'started'} for this plant`, 'success');
}

// Remove plant
function removePlant(id) {
  plantsRef.child(id).remove();
  document.querySelector(`[data-id='${id}']`).remove();
}

// Load plants + other data from Firebase
function loadPlants() {
  plantsRef.on("value", (snapshot) => {
    const data = snapshot.val();
    document.getElementById("cardContainer").innerHTML = '';
    if (data) {
      Object.keys(data).forEach(id => {
        const plant = data[id];
        plant.id = id;
        displayPlant(plant);
      });
    }
  });

  tipsRef.on('value', (snapshot) => {
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

  notificationRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (notificationList) {
      notificationList.innerHTML = '';
      for (let id in data) {
        const li = document.createElement('li');
        li.textContent = `${data[id].name} - ${data[id].type}`;
        notificationList.appendChild(li);
      }
    }
  });
}

// Call loadPlants when the page loads
document.addEventListener("DOMContentLoaded", loadPlants);
