
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let dino = { x: 50, y: 150, width: 40, height: 40, vy: 0, gravity: 2, jump: -25, grounded: true };
let cactus = { x: 800, y: 160, width: 20, height: 40, speed: 6 };
let score = 0;
let gameOver = false;

document.addEventListener("keydown", function(e) {
  if (e.code === "Space" && dino.grounded && !gameOver) {
    dino.vy = dino.jump;
    dino.grounded = false;
  }
});

function resetGame() {
  cactus.x = 800;
  score = 0;
  gameOver = false;
  dino.y = 150;
  dino.vy = 0;
  dino.grounded = true;
}

function update() {
  if (gameOver) return;

  // Update dino position
  dino.y += dino.vy;
  dino.vy += dino.gravity;
  if (dino.y >= 150) {
    dino.y = 150;
    dino.vy = 0;
    dino.grounded = true;
  }

  // Move cactus
  cactus.x -= cactus.speed;
  if (cactus.x + cactus.width < 0) {
    cactus.x = 800 + Math.random() * 200;
    score++;
  }

  // Collision detection
  if (
    dino.x < cactus.x + cactus.width &&
    dino.x + dino.width > cactus.x &&
    dino.y < cactus.y + cactus.height &&
    dino.y + dino.height > cactus.y
  ) {
    gameOver = true;
    setTimeout(() => {
      alert("Game Over! Your Score: " + score);
      resetGame();
    }, 50);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw ground
  ctx.fillStyle = "#ccc";
  ctx.fillRect(0, 190, canvas.width, 10);

  // Draw dino
  ctx.fillStyle = "#4fa981";
  ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

  // Draw cactus
  ctx.fillStyle = "#884ea0";
  ctx.fillRect(cactus.x, cactus.y, cactus.width, cactus.height);

  // Draw score
  ctx.fillStyle = "#333";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 700, 30);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

resetGame();
gameLoop();
