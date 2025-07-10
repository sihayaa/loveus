const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const dinoImg = new Image();
dinoImg.src = "dino.png";

const cactusImg = new Image();
cactusImg.src = "cactus.png";

let dino = {
  x: 50,
  y: 150,
  width: 40,
  height: 40,
  vy: 0,
  gravity: 2,
  jump: -25,
  grounded: true
};

let cactus = {
  x: 900,
  y: 160,
  width: 20,
  height: 40,
  speed: 6
};

let score = 0;
let gameOver = false;
let started = false;

document.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    if (!started) {
      started = true;
      resetGame();
      gameLoop();
    } else if (dino.grounded && !gameOver) {
      dino.vy = dino.jump;
      dino.grounded = false;
    }
  }
});

function resetGame() {
  cactus.x = 1000 + Math.random() * 200;
  score = 0;
  gameOver = false;
  dino.y = 150;
  dino.vy = 0;
  dino.grounded = true;
}

function update() {
  if (!started || gameOver) return;

  dino.y += dino.vy;
  dino.vy += dino.gravity;
  if (dino.y >= 150) {
    dino.y = 150;
    dino.vy = 0;
    dino.grounded = true;
  }

  cactus.x -= cactus.speed;
  if (cactus.x + cactus.width < 0) {
    cactus.x = 800 + Math.random() * 200;
    score++;
  }

  // collision
  if (
    dino.x < cactus.x + cactus.width &&
    dino.x + dino.width > cactus.x &&
    dino.y < cactus.y + cactus.height &&
    dino.y + dino.height > cactus.y
  ) {
    gameOver = true;
    setTimeout(() => {
      alert("Game Over! Your Score: " + score);
      started = false;
      draw(); // show press space to start again
    }, 100);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = "#ccc";
  ctx.fillRect(0, 190, canvas.width, 10);

  // Dino & Cactus
  ctx.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
  ctx.drawImage(cactusImg, cactus.x, cactus.y, cactus.width, cactus.height);

  // Score
  ctx.fillStyle = "#333";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 700, 30);

  // Start screen
  if (!started) {
    ctx.fillStyle = "#444";
    ctx.font = "22px Arial";
    ctx.fillText("Press SPACE to Start", 310, 100);
  }
}

function gameLoop() {
  if (!gameOver) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }
}

draw(); // Initial screen
