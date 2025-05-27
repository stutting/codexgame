const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ---------------------------------------------------------------------------
// Game configuration and physics constants
// ---------------------------------------------------------------------------
const GRAVITY = 0.6;            // Downward acceleration applied every frame
const FLAP_STRENGTH = -12;      // Upward velocity when the player jumps
const GROUND_Y = canvas.height - 50;
const SCROLL_SPEED = 4;         // Horizontal speed of ground and objects
const MAX_HEALTH = 3;           // Player hit points before game over

// ---------------------------------------------------------------------------
// Simple player representation.  Uses an object literal for brevity.
// The player can repeatedly "flap" upward, similar to Flappy Bird.
// ---------------------------------------------------------------------------
const player = {
    x: 100,
    y: GROUND_Y - 40,
    width: 30,
    height: 40,
    vy: 0,

    draw() {
        ctx.fillStyle = '#ff0';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    update() {
        // Basic physics integration
        this.vy += GRAVITY;
        this.y += this.vy;

        // Prevent the player from falling through the ground
        if (this.y + this.height >= GROUND_Y) {
            this.y = GROUND_Y - this.height;
            this.vy = 0;
        }
    }
};

// ---------------------------------------------------------------------------
// Gameplay state variables
// ---------------------------------------------------------------------------
let obstacles = [];        // Rectangular hazards the player must avoid
let items = [];            // Collectables that grant score or health
let score = 0;             // Points collected from items
let distance = 0;          // Tracks how far the player has traveled
let health = MAX_HEALTH;   // Current player hit points
let gameOver = false;

// Timers for spawning objects at regular intervals
let lastObstacleTime = 0;
let lastItemTime = 0;
let lastFrame = performance.now();

// Create a new obstacle with random dimensions
function spawnObstacle() {
    const height = 30 + Math.random() * 40;
    obstacles.push({
        x: canvas.width + 20,
        y: GROUND_Y - height,
        width: 20 + Math.random() * 30,
        height
    });
}

// Create an item the player can collect. Half of the items restore health,
// the rest increase the score.
function spawnItem() {
    const heal = Math.random() < 0.5;
    items.push({
        x: canvas.width + 20,
        y: GROUND_Y - 80 - Math.random() * 120,
        radius: 10,
        heal
    });
}

function update(time = 0) {
    if (gameOver) return;

    // Calculate delta time so movement is consistent regardless of frame rate
    const dt = time - lastFrame;
    lastFrame = time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Track distance travelled for simple progression metric
    distance += SCROLL_SPEED * (dt / 16);

    // Regularly spawn obstacles and items
    if (time - lastObstacleTime > 1500) {
        spawnObstacle();
        lastObstacleTime = time;
    }
    if (time - lastItemTime > 2000) {
        spawnItem();
        lastItemTime = time;
    }

    // Update obstacles
    obstacles.forEach((obs) => {
        obs.x -= SCROLL_SPEED;

        ctx.fillStyle = '#964B00';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });
    obstacles = obstacles.filter(o => o.x + o.width > 0);

    // Update items
    items.forEach((item) => {
        item.x -= SCROLL_SPEED;
        ctx.fillStyle = item.heal ? '#f00' : '#0f0';

        ctx.beginPath();
        ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        ctx.fill();
    });
    items = items.filter(i => i.x + i.radius > 0);

    // Player update and draw
    player.update();
    player.draw();

    // Collision detection with obstacles
    obstacles.forEach((o, idx) => {
        if (player.x < o.x + o.width &&
            player.x + player.width > o.x &&
            player.y < o.y + o.height &&
            player.y + player.height > o.y) {
            obstacles.splice(idx, 1);
            health -= 1;
            if (health <= 0) gameOver = true;
        }
    });

    // Collision detection with items
    items.forEach((it, idx) => {
        const dx = player.x + player.width / 2 - it.x;
        const dy = player.y + player.height / 2 - it.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < it.radius + player.width / 2) {
            if (it.heal && health < MAX_HEALTH) {
                health += 1;
            } else {
                score += 1;
            }
            items.splice(idx, 1);
        }
    });

    // Draw ground
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

    // HUD display
    ctx.fillStyle = '#fff';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`Health: ${health}`, 10, 40);
    ctx.fillText(`Distance: ${Math.floor(distance)}`, 10, 60);
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '40px sans-serif';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
    } else {
        requestAnimationFrame(update);
    }
}

// Called whenever the player presses the jump key. Gives the player an
// immediate upward velocity, enabling multiple flaps in the air.
function jump() {
    player.vy = FLAP_STRENGTH;
}

// Basic input handler. Space bar or up arrow performs a flap.
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        jump();
    }
});

// Start the main loop
requestAnimationFrame(update);
