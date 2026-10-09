const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game variables
let score = 0;
let hiScore = localStorage.getItem('cyberRunnerHiScore') || 1280;
document.getElementById('hi-score').innerText = hiScore;

let isPlaying = false;
let gameSpeed = 6;
let obstacleInterval = 85;
let frameCount = 0;

// Difficulty button handlers
const diffBtns = document.querySelectorAll('.diff-btn');
diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        diffBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameSpeed = parseFloat(btn.dataset.speed);
        obstacleInterval = parseInt(btn.dataset.interval);
    });
});

// High Score Modal triggers
const highscoreBtn = document.getElementById('highscore-btn');
const highscoreModal = document.getElementById('highscore-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const bestScoreVal = document.getElementById('best-score-val');

highscoreBtn.addEventListener('click', () => {
    bestScoreVal.innerText = hiScore;
    highscoreModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    highscoreModal.classList.add('hidden');
});

// Start button
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('controls-hint').classList.remove('hidden');
    document.getElementById('pause-btn').classList.remove('hidden');
    startGame();
});

// Player object
const player = {
    x: 50,
    y: 0,
    width: 32,
    height: 55,
    dy: 0,
    jumpForce: -13,
    gravity: 0.65,
    grounded: false
};

let obstacles = [];
let obstacleTimer = 0;

window.addEventListener('mousedown', triggerJump);
window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    triggerJump();
});

function triggerJump() {
    if (!isPlaying) return;
    if (player.grounded) {
        player.dy = player.jumpForce;
        player.grounded = false;
    }
}

function spawnObstacle() {
    const isTall = Math.random() > 0.6;
    const height = isTall ? 65 : 40;
    obstacles.push({
        x: canvas.width,
        y: canvas.height - 100 - height,
        width: 28,
        height: height,
        color: "#ff007f"
    });
}

function startGame() {
    score = 0;
    document.getElementById('score').innerText = score;
    obstacles = [];
    player.y = canvas.height - 100 - player.height;
    player.dy = 0;
    isPlaying = true;
    loop();
}

function drawRunner() {
    ctx.save();
    ctx.shadowColor = "#00f3ff";
    ctx.shadowBlur = 12;
    ctx.strokeStyle = "#00f3ff";
    ctx.fillStyle = "#00f3ff";
    ctx.lineWidth = 3;

    let px = player.x;
    let py = player.y;

    // Head
    ctx.beginPath();
    ctx.arc(px + 16, py + 10, 8, 0, Math.PI * 2);
    ctx.fill();

    // Torso
    ctx.beginPath();
    ctx.moveTo(px + 16, py + 18);
    ctx.lineTo(px + 16, py + 38);
    ctx.stroke();

    let limbCycle = player.grounded ? Math.sin(frameCount * 0.3) * 10 : 6;

    // Arms
    ctx.beginPath();
    ctx.moveTo(px + 16, py + 22);
    ctx.lineTo(px + 6 + limbCycle, py + 32);
    ctx.moveTo(px + 16, py + 22);
    ctx.lineTo(px + 26 - limbCycle, py + 32);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(px + 16, py + 38);
    ctx.lineTo(px + 6 - limbCycle, py + 55);
    ctx.moveTo(px + 16, py + 38);
    ctx.lineTo(px + 26 + limbCycle, py + 55);
    ctx.stroke();

    ctx.restore();
}

function loop() {
    if (!isPlaying) return;
    frameCount++;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ground Floor
    ctx.strokeStyle = "#00f3ff";
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00f3ff";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 100);
    ctx.lineTo(canvas.width, canvas.height - 100);
    ctx.stroke();

    // Physics
    player.dy += player.gravity;
    player.y += player.dy;

    if (player.y > canvas.height - 100 - player.height) {
        player.y = canvas.height - 100 - player.height;
        player.dy = 0;
        player.grounded = true;
    }

    drawRunner();

    // Obstacles
    obstacleTimer++;
    if (obstacleTimer > obstacleInterval) {
        spawnObstacle();
        obstacleTimer = 0;
        if (gameSpeed < 11) gameSpeed += 0.15;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.x -= gameSpeed;

        ctx.fillStyle = obs.color;
        ctx.shadowColor = "#ff007f";
        ctx.shadowBlur = 15;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Collision
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            isPlaying = false;
            if (score > hiScore) {
                hiScore = score;
                localStorage.setItem('cyberRunnerHiScore', hiScore);
                document.getElementById('hi-score').innerText = hiScore;
            }
            document.getElementById('menu-screen').classList.remove('hidden');
            document.getElementById('hud').classList.add('hidden');
            document.getElementById('controls-hint').classList.add('hidden');
            document.getElementById('pause-btn').classList.add('hidden');
        }

        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            score += 10;
            document.getElementById('score').innerText = score;
        }
    }

    requestAnimationFrame(loop);
}
