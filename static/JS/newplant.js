// Firebase references
const database = firebase.database();
const plantsRef = database.ref('plants');
const tipsRef = database.ref('tips');
const notificationRef = database.ref('notification');

const plantsList = document.getElementById('plants-list');
const tipsList = document.getElementById('tips-list');
const notificationList = document.getElementById('notification-List');

// Add new plant
function addCard() {
  let plantName = document.getElementById("frontText").value;
  let plantType = document.getElementById("backText").value;

  if (!plantName.trim() || !plantType.trim()) {
    alert("Please enter both a plant name and type.");
    return;
  }

  let plant = {
    name: plantName,
    type: plantType,
    moisture: Math.floor(Math.random() * 100)
  };

  const newPlantRef = plantsRef.push();
  newPlantRef.set(plant);

  document.getElementById("frontText").value = "";
  document.getElementById("backText").value = "";
}

// Display a plant card
function displayPlant(plant) {
  let cardContainer = document.getElementById("cardContainer");

  let card = document.createElement("div");
  card.classList.add("plant-card");
  card.setAttribute("data-id", plant.id);

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-front" onclick="flipCard('${plant.id}')">
        <h3>🌱 ${plant.name}</h3>
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
