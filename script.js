
/* =================================
   FROGWOOD
   The Mushroom Wizard
   Game Engine - Version 0.1
================================= */

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Game world dimensions
const WORLD = {
    width: 2000,
    height: 1600,
    tileSize: 40
};

// Camera
const camera = {
    x: 0,
    y: 0
};

const player = {
    x: 1000,
    y: 800,
    speed: 3,
    size: 24,
    health: 100,
    maxHealth: 100
};

// Our first forest enemy: Grumble the Gnome
const grumble = {
    x: 1250,
    y: 800,
    speed: 0.9,
    size: 34,
    health: 50,
    maxHealth: 50,
    detectionRange: 280,
    attackRange: 35,
    attackCooldown: 0,
    wanderTimer: 0,
    wanderAngle: 0
};

// Keyboard input
const keys = {};

window.addEventListener("keydown", event => {
    keys[event.key.toLowerCase()] = true;

    if (
        ["arrowup", "arrowdown", "arrowleft", "arrowright", " "]
            .includes(event.key.toLowerCase())
    ) {
        event.preventDefault();
    }
});

window.addEventListener("keyup", event => {
    keys[event.key.toLowerCase()] = false;
});

// Deterministic random generator for world decoration
function random(seed) {
    const value = Math.sin(seed * 127.1) * 43758.5453;
    return value - Math.floor(value);
}

// Draw the forest ground
function drawGround() {
    ctx.fillStyle = "#263b30";
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    const tileSize = WORLD.tileSize;

    for (let y = 0; y < WORLD.height; y += tileSize) {
        for (let x = 0; x < WORLD.width; x += tileSize) {
            const variation = random(x * 0.1 + y * 0.2);

            if (variation > 0.65) {
                ctx.fillStyle = "rgba(125, 160, 105, 0.08)";
                ctx.fillRect(x, y, tileSize, tileSize);
            }

            if (variation < 0.15) {
                ctx.fillStyle = "rgba(10, 25, 20, 0.12)";
                ctx.fillRect(x + 5, y + 5, 3, 3);
            }
        }
    }
}

// Draw trees
function drawTree(x, y, size = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);

    // Tree shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.beginPath();
    ctx.ellipse(5, 12, 30, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk
    ctx.fillStyle = "#594332";
    ctx.fillRect(-7, -5, 14, 30);

    // Leaves
    ctx.fillStyle = "#19372c";
    ctx.beginPath();
    ctx.arc(0, -20, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#294d37";
    ctx.beginPath();
    ctx.arc(-10, -27, 17, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#3d6140";
    ctx.beginPath();
    ctx.arc(8, -32, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// Draw glowing mushrooms
function drawMushroom(x, y, color = "#b68acb") {
    ctx.save();

    // Glow
    const glow = ctx.createRadialGradient(
        x, y, 2,
        x, y, 30
    );

    glow.addColorStop(0, color + "66");
    glow.addColorStop(1, color + "00");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.fillStyle = "#d7cbb4";
    ctx.fillRect(x - 3, y - 2, 6, 13);

    // Cap
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y - 4, 12, Math.PI, 0);
    ctx.fill();

    // Spots
    ctx.fillStyle = "#f0e5e9";
    ctx.beginPath();
    ctx.arc(x - 5, y - 9, 2, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 12, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// Generate forest decorations
const trees = [];
const mushrooms = [];

for (let i = 0; i < 180; i++) {
    const x = random(i + 10) * WORLD.width;
    const y = random(i + 500) * WORLD.height;

    // Keep a small clearing around the starting position.
    const distance = Math.hypot(x - player.x, y - player.y);

    if (distance > 170) {
        trees.push({
            x,
            y,
            size: 0.8 + random(i + 900) * 0.7
        });
    }
}

// Mushroom inventory
let mushroomCount = 0;

const mushroomCounter = document.getElementById("mushroom-count");

// Update the inventory display
function updateInventory() {
    mushroomCounter.textContent = mushroomCount;
}

const mushroomColors = [
    "#b68acb",
    "#d28a75",
    "#d6bc75",
    "#8db8a0"
];

for (let i = 0; i < 65; i++) {
    mushrooms.push({
        x: random(i + 1200) * WORLD.width,
        y: random(i + 1600) * WORLD.height,
        color: mushroomColors[i % mushroomColors.length]
    });
}

// Collect nearby mushrooms
function collectMushrooms() {
    for (let i = mushrooms.length - 1; i >= 0; i--) {
        const mushroom = mushrooms[i];

        const distance = Math.hypot(
            player.x - mushroom.x,
            player.y - mushroom.y
        );

        if (distance < 30) {
            mushrooms.splice(i, 1);

            mushroomCount++;

            updateInventory();

            console.log("Mushroom collected! 🍄", mushroomCount);
        }
    }
}

// Draw the wizard frog
function drawPlayer() {
    const x = player.x;
    const y = player.y;

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.ellipse(x, y + 15, 17, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = "#78b879";
    ctx.beginPath();
    ctx.ellipse(x, y + 3, 17, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#b3dc8e";
    ctx.beginPath();
    ctx.arc(x - 9, y - 8, 7, 0, Math.PI * 2);
    ctx.arc(x + 9, y - 8, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#17251f";
    ctx.beginPath();
    ctx.arc(x - 9, y - 8, 3, 0, Math.PI * 2);
    ctx.arc(x + 9, y - 8, 3, 0, Math.PI * 2);
    ctx.fill();

    // Wizard hat
    ctx.fillStyle = "#79649e";
    ctx.beginPath();
    ctx.ellipse(x, y - 15, 17, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x - 12, y - 15);
    ctx.lineTo(x + 2, y - 43);
    ctx.lineTo(x + 13, y - 15);
    ctx.closePath();
    ctx.fill();

    // Hat star
    ctx.fillStyle = "#e8d58a";
    ctx.font = "11px Georgia";
    ctx.fillText("✦", x - 3, y - 22);
}



// Draw Grumble the Swamp Ogre
function drawGrumble() {
    const x = grumble.x;
    const y = grumble.y;

    ctx.save();

    // Dark ground shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.ellipse(x, y + 27, 36, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Massive legs
    ctx.fillStyle = "#354c32";
    ctx.beginPath();
    ctx.ellipse(x - 16, y + 18, 13, 17, -0.2, 0, Math.PI * 2);
    ctx.ellipse(x + 16, y + 18, 13, 17, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Feet
    ctx.fillStyle = "#263a29";
    ctx.beginPath();
    ctx.ellipse(x - 19, y + 29, 12, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 19, y + 29, 12, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Huge hunched body
    ctx.fillStyle = "#526f3d";
    ctx.beginPath();
    ctx.ellipse(x, y + 1, 32, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = "#71834b";
    ctx.beginPath();
    ctx.ellipse(x, y + 12, 20, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shoulder muscles
    ctx.fillStyle = "#405d35";
    ctx.beginPath();
    ctx.arc(x - 26, y - 10, 13, 0, Math.PI * 2);
    ctx.arc(x + 26, y - 10, 13, 0, Math.PI * 2);
    ctx.fill();

    // Thick arms
    ctx.strokeStyle = "#526f3d";
    ctx.lineWidth = 13;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - 25, y - 5);
    ctx.lineTo(x - 34, y + 14);
    ctx.moveTo(x + 25, y - 5);
    ctx.lineTo(x + 34, y + 14);
    ctx.stroke();

    // Ogre head
    ctx.fillStyle = "#69834b";
    ctx.beginPath();
    ctx.ellipse(x, y - 25, 24, 23, 0, 0, Math.PI * 2);
    ctx.fill();

    // Heavy brow
    ctx.fillStyle = "#35452d";
    ctx.beginPath();
    ctx.ellipse(x, y - 34, 23, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing angry eyes
    ctx.shadowColor = "#ffb52e";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#ffd45c";
    ctx.beginPath();
    ctx.ellipse(x - 9, y - 27, 5, 4, -0.2, 0, Math.PI * 2);
    ctx.ellipse(x + 9, y - 27, 5, 4, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Dark pupils
    ctx.fillStyle = "#251b12";
    ctx.beginPath();
    ctx.arc(x - 9, y - 27, 2, 0, Math.PI * 2);
    ctx.arc(x + 9, y - 27, 2, 0, Math.PI * 2);
    ctx.fill();

    // Crooked nose
    ctx.fillStyle = "#405633";
    ctx.beginPath();
    ctx.ellipse(x, y - 18, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.fillStyle = "#281d19";
    ctx.beginPath();
    ctx.ellipse(x, y - 8, 13, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Yellow tusks
    ctx.fillStyle = "#f0dfaa";
    ctx.beginPath();
    ctx.moveTo(x - 11, y - 10);
    ctx.lineTo(x - 7, y + 1);
    ctx.lineTo(x - 3, y - 9);
    ctx.closePath();

    ctx.moveTo(x + 11, y - 10);
    ctx.lineTo(x + 7, y + 1);
    ctx.lineTo(x + 3, y - 9);
    ctx.closePath();
    ctx.fill();

    // Mossy head growths
    ctx.fillStyle = "#304c30";
    ctx.beginPath();
    ctx.arc(x - 19, y - 40, 6, 0, Math.PI * 2);
    ctx.arc(x + 18, y - 42, 7, 0, Math.PI * 2);
    ctx.fill();

    // Enormous tree-root club
    ctx.strokeStyle = "#493522";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + 31, y + 12);
    ctx.lineTo(x + 47, y - 5);
    ctx.stroke();

    // Club head
    ctx.fillStyle = "#63472c";
    ctx.beginPath();
    ctx.ellipse(x + 49, y - 10, 12, 17, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Knots on club
    ctx.fillStyle = "#a17a46";
    ctx.beginPath();
    ctx.arc(x + 47, y - 14, 3, 0, Math.PI * 2);
    ctx.arc(x + 53, y - 5, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// Move player
function updatePlayer() {
    let dx = 0;
    let dy = 0;

    if (keys["w"] || keys["arrowup"]) dy -= 1;
    if (keys["s"] || keys["arrowdown"]) dy += 1;
    if (keys["a"] || keys["arrowleft"]) dx -= 1;
    if (keys["d"] || keys["arrowright"]) dx += 1;

    // Normalize diagonal movement
    const length = Math.hypot(dx, dy);

    if (length > 0) {
        dx /= length;
        dy /= length;
    }

    player.x += dx * player.speed;
    player.y += dy * player.speed;

    // Keep frog inside the world
    player.x = Math.max(
        player.size,
        Math.min(WORLD.width - player.size, player.x)
    );

    player.y = Math.max(
        player.size,
        Math.min(WORLD.height - player.size, player.y)
    );
}

// Update camera
function updateCamera() {
    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;

    camera.x = Math.max(
        0,
        Math.min(WORLD.width - canvas.width, camera.x)
    );

    camera.y = Math.max(
        0,
        Math.min(WORLD.height - canvas.height, camera.y)
    );
}

// Render everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    ctx.translate(-camera.x, -camera.y);

    drawGround();

    for (const mushroom of mushrooms) {
        drawMushroom(
            mushroom.x,
            mushroom.y,
            mushroom.color
        );
    }

    for (const tree of trees) {
        drawTree(tree.x, tree.y, tree.size);
    }

    drawPlayer();

    drawGrumble();

    ctx.restore();
}

// Main game loop
function gameLoop() {
    updatePlayer();
    collectMushrooms();
    updateCamera();
    draw();

    requestAnimationFrame(gameLoop);
}

// Start the game
updateCamera();
gameLoop();

console.log("Frogwood has awakened! 🐸");
