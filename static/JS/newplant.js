document.addEventListener("DOMContentLoaded", loadPlants);

function addCard() {
    let plantName = document.getElementById("frontText").value;
    let plantType = document.getElementById("backText").value;

    if (!plantName.trim() || !plantType.trim()) {
        alert("Please enter both a plant name and type.");
        return;
    }

    let plant = {
        id: Date.now(), // unique id
        name: plantName,
        type: plantType,
        moisture: Math.floor(Math.random() * 100) // soil moisture
    };

    let plants = JSON.parse(localStorage.getItem("plants")) || [];
    plants.push(plant);
    localStorage.setItem("plants", JSON.stringify(plants));

    displayPlant(plant);
    document.getElementById("frontText").value = "";
    document.getElementById("backText").value = "";
}

// Flippable plant card
function displayPlant(plant) {
    let cardContainer = document.getElementById("cardContainer");

    let card = document.createElement("div");
    card.classList.add("plant-card");
    card.setAttribute("data-id", plant.id);

    card.innerHTML = `
        <div class="card-inner">
            <!-- Front Side -->
            <div class="card-front" onclick="flipCard(${plant.id})">
                <h3>🌱 ${plant.name}</h3>
                <p>${plant.type}</p>
            </div>
            <div class="card-back" onclick="flipCard(${plant.id})">
                <p>Soil Moisture:</p>
                <div class="moisture-bar">
                    <div class="moisture-fill" id="moisture-${plant.id}" style="width: ${plant.moisture}%"></div>
                </div>
                <button class="water-btn" onclick="waterPlant(${plant.id}); event.stopPropagation();">Water Plant</button>
                <button onclick="removePlant(${plant.id}); event.stopPropagation();">Remove</button>
            </div>
        </div>
    `;

    cardContainer.appendChild(card);
}

// Flip card
function flipCard(id) {
    let card = document.querySelector(`[data-id="${id}"] .card-inner`);
    card.classList.toggle("flipped");
}

// Function to show notification
function showNotification(message, type) {
    const notificationContainer = document.querySelector('.notification-container') || createNotificationContainer();
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-btn" onclick="this.parentElement.remove()">×</button>
    `;
    notificationContainer.appendChild(notification);

    // Automatically remove notification after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Function to create notification container if it doesn't exist
function createNotificationContainer() {
    const container = document.createElement('div');
    container.classList.add('notification-container');
    document.body.appendChild(container);
    return container;
}

// Simulated water function (updates moisture value)
function waterPlant(id) {
    let moistureBar = document.getElementById(`moisture-${id}`);
    let newMoisture = Math.min(100, Math.random() * 20 + 80); // Simulated increase

    moistureBar.style.width = newMoisture + "%";

    let plants = JSON.parse(localStorage.getItem("plants")) || [];
    let updatedPlants = plants.map(plant => {
        if (plant.id === id) {
            plant.moisture = newMoisture;
            if (newMoisture === 100) {
                showNotification(`Watering finished for ${plant.name}`, 'success');
            } else {
                showNotification(`Watering started for ${plant.name}`, 'warning');
            }
        }
        return plant;
    });

    localStorage.setItem("plants", JSON.stringify(updatedPlants));
}

// Remove plant function
function removePlant(id) {
    let plants = JSON.parse(localStorage.getItem("plants")) || [];
    plants = plants.filter(plant => plant.id !== id);
    localStorage.setItem("plants", JSON.stringify(plants));
    document.querySelector(`[data-id='${id}']`).remove();
}

// Load stored plants on page load
function loadPlants() {
    let plants = JSON.parse(localStorage.getItem("plants")) || [];
    plants.forEach(displayPlant);
}
