const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const gravity = 0.6;
const groundY = canvas.height - 50;
const scrollSpeed = 4;

// Player object
const player = {
    x: 100,
    y: groundY - 40,
    width: 30,
    height: 40,
    vy: 0,
    jumping: false,
    draw() {
        ctx.fillStyle = '#ff0';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    update() {
        this.vy += gravity;
        this.y += this.vy;
        if (this.y + this.height >= groundY) {
            this.y = groundY - this.height;
            this.vy = 0;
            this.jumping = false;
        }
    }
};

// Platform and obstacle arrays
let obstacles = [];
let items = [];
let offsetX = 0;
let score = 0;
let gameOver = false;

function spawnObstacle() {
    const height = 30 + Math.random() * 40;
    obstacles.push({
        x: canvas.width + Math.random() * 200,
        y: groundY - height,
        width: 20 + Math.random() * 30,
        height: height
    });
}

function spawnItem() {
    items.push({
        x: canvas.width + Math.random() * 300,
        y: groundY - 80 - Math.random() * 120,
        radius: 10
    });
}

function update() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scroll ground
    offsetX -= scrollSpeed;

    // Spawn obstacles and items
    if (Math.random() < 0.02) spawnObstacle();
    if (Math.random() < 0.02) spawnItem();

    // Update obstacles
    obstacles.forEach((obs) => {
        obs.x -= scrollSpeed;
        ctx.fillStyle = '#964B00';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });
    obstacles = obstacles.filter(o => o.x + o.width > 0);

    // Update items
    items.forEach((item) => {
        item.x -= scrollSpeed;
        ctx.fillStyle = '#0f0';
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        ctx.fill();
    });
    items = items.filter(i => i.x + i.radius > 0);

    // Player update
    player.update();
    player.draw();

    // Collision detection
    obstacles.forEach(o => {
        if (player.x < o.x + o.width &&
            player.x + player.width > o.x &&
            player.y < o.y + o.height &&
            player.y + player.height > o.y) {
            gameOver = true;
        }
    });

    items.forEach((it, idx) => {
        const dx = player.x + player.width / 2 - it.x;
        const dy = player.y + player.height / 2 - it.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < it.radius + player.width / 2) {
            score += 1;
            items.splice(idx, 1);
        }
    });

    // Draw ground
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    // Score display
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText('Score: ' + score, 10, 30);

    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '40px sans-serif';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
    }

    requestAnimationFrame(update);
}

function jump() {
    if (!player.jumping) {
        player.vy = -12;
        player.jumping = true;
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') jump();
});

// Start the game
update();
